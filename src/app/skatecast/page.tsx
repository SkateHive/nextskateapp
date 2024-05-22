"use client"
import { MarkdownRenderers } from "@/app/upload/utils/MarkdownRenderers"
import { useHiveUser } from "@/contexts/UserContext"
import { useComments } from "@/hooks/comments"
import { vote } from "@/lib/hive/client-functions"
import { commentWithPrivateKey } from "@/lib/hive/server-functions"
import {
  formatDate,
  transformIPFSContent,
  transformShortYoutubeLinksinIframes,
} from "@/lib/utils"
import {
  Avatar,
  Box,
  Button,
  Divider,
  Flex,
  HStack,
  Input,
  Text,
  Textarea,
  VStack,
} from "@chakra-ui/react"
import * as dhive from "@hiveio/dhive"
import { useEffect, useMemo, useRef, useState } from "react"
import { useDropzone } from "react-dropzone"
import { FaDollarSign, FaImage, FaRegComment, FaRegHeart } from "react-icons/fa"
import InfiniteScroll from "react-infinite-scroll-component"
import ReactMarkdown from "react-markdown"
import { BeatLoader } from "react-spinners"
import rehypeRaw from "rehype-raw"
import remarkGfm from "remark-gfm"
import { uploadFileToIPFS } from "../upload/utils/uploadToIPFS"
import LoadingComponent from "./loadingComponent"
import AvatarMediaModal from "./mediaModal"

const parent_author = "skatehacker"
const parent_permlink = "test-advance-mode-post"

const SkateCast = () => {
  const { comments, addComment, isLoading } = useComments(
    parent_author,
    parent_permlink
  )
  const [visiblePosts, setVisiblePosts] = useState(20)
  const [postBody, setPostBody] = useState("")
  const reversedComments = comments?.slice().reverse()
  const user = useHiveUser()
  const username = user?.hiveUser?.name
  const [mediaModalOpen, setMediaModalOpen] = useState(false)
  const [media, setMedia] = useState<string[]>([])
  const [mediaComments, setMediaComments] = useState(new Set())
  const [mediaDictionary, setMediaDictionary] = useState(new Map())
  const PINATA_GATEWAY_TOKEN = process.env.NEXT_PUBLIC_PINATA_GATEWAY_TOKEN
  const [isUploading, setIsUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const [hasPosted, setHasPosted] = useState(false)

  const { getRootProps, getInputProps } = useDropzone({
    noClick: true,
    noKeyboard: true,
    onDrop: async (acceptedFiles) => {
      setIsUploading(true)
      for (const file of acceptedFiles) {
        const ipfsData = await uploadFileToIPFS(file) // Use the returned data directly
        if (ipfsData !== undefined) {
          // Ensure ipfsData is not undefined
          const ipfsUrl = `https://ipfs.skatehive.app/ipfs/${ipfsData.IpfsHash}?pinataGatewayToken=${PINATA_GATEWAY_TOKEN}`
          const markdownLink = file.type.startsWith("video/")
            ? `<iframe src="${ipfsUrl}" allowfullscreen></iframe>`
            : `![Image](${ipfsUrl})`
          setPostBody((prevMarkdown) => `${prevMarkdown}\n${markdownLink}\n`)
        }
      }
      setIsUploading(false)
    },
    accept: {
      "image/*": [".png", ".gif", ".jpeg", ".jpg"],
      "video/*": [".mp4", ".mov"],
    },
    multiple: false,
  })

  useEffect(() => {
    if (comments) {
      const mediaSet = new Set()
      const mediaDict = new Map()
      comments?.forEach((comment) => {
        const media = comment.body.match(
          /https:\/\/ipfs.skatehive.app\/ipfs\/[a-zA-Z0-9]*/g
        )
        const mediaType =
          comment.body.includes("<video") || comment.body.includes("<iframe")
            ? "video"
            : "image"
        if (media) {
          mediaSet.add(comment.id)
          mediaDict.set(comment.id, { media, type: mediaType })
        }
      })
      setMediaComments(mediaSet)
      setMediaDictionary(mediaDict)
    }
  }, [comments])

  const sortedComments = useMemo(() => {
    return comments?.slice().sort((a: any, b: any) => {
      const aHasMedia = mediaComments.has(a.id)
      const bHasMedia = mediaComments.has(b.id)
      if (aHasMedia && !bHasMedia) {
        return -1
      } else if (!aHasMedia && bHasMedia) {
        return 1
      }
      const aCreated = new Date(a.created)
      const bCreated = new Date(b.created)
      if (aCreated && bCreated) {
        return bCreated.getTime() - aCreated.getTime()
      }
      return 0
    })
  }, [comments, mediaComments])

  const handlePost = async () => {
    console.log("handlePost")
    const permlink = new Date()
      .toISOString()
      .replace(/[^a-zA-Z0-9]/g, "")
      .toLowerCase()
    console.log("permlink", permlink)
    const loginMethod = localStorage.getItem("LoginMethod")
    console.log("loginMethod", loginMethod)

    if (!username) {
      console.error("Username is missing")
      return
    }

    const postData = {
      parent_author: parent_author,
      parent_permlink: parent_permlink,
      author: username,
      permlink: permlink,
      title: "Cast",
      body: postBody,
      json_metadata: JSON.stringify({
        tags: ["skateboard"],
        app: "skatehive",
      }),
    }

    const operations = [["comment", postData]]

    if (loginMethod === "keychain") {
      if (typeof window !== "undefined") {
        try {
          const response = await new Promise<{
            success: boolean
            message?: string
          }>((resolve, reject) => {
            window.hive_keychain.requestBroadcast(
              username,
              operations,
              "posting",
              (response: any) => {
                if (response.success) {
                  resolve(response)
                } else {
                  reject(new Error(response.message))
                }
              }
            )
          })

          if (response.success) {
            setPostBody("")
            console.log("Comment posted successfully")
            addComment(postData)
          }
        } catch (error) {
          console.error("Error posting comment:", (error as Error).message)
        }
      }
    } else if (loginMethod === "privateKey") {
      const commentOptions: dhive.CommentOptionsOperation = [
        "comment_options",
        {
          author: String(username),
          permlink: permlink,
          max_accepted_payout: "10000.000 HBD",
          percent_hbd: 10000,
          allow_votes: true,
          allow_curation_rewards: true,
          extensions: [
            [
              0,
              {
                beneficiaries: [
                  {
                    account: "skatehacker",
                    weight: 1000,
                  },
                ],
              },
            ],
          ],
        },
      ]

      const postOperation: dhive.CommentOperation = [
        "comment",
        {
          parent_author: parent_author,
          parent_permlink: parent_permlink,
          author: String(username),
          permlink: permlink,
          title: "Cast",
          body: postBody,
          json_metadata: JSON.stringify({
            tags: ["skateboard"],
            app: "Skatehive App",
            image: "/skatehive_square_green.png",
          }),
        },
      ]

      try {
        await commentWithPrivateKey(
          localStorage.getItem("EncPrivateKey"),
          postOperation,
          commentOptions
        )
        addComment(postData)
        setPostBody("")
        setHasPosted(true)
      } catch (error) {
        console.error("Error posting comment:", (error as Error).message)
      }
    }
  }

  const handleVote = async (author: string, permlink: string) => {
    if (!username) {
      console.error("Username is missing")
      return
    }
    vote({
      username: username,
      permlink: permlink,
      author: author,
      weight: 10000,
    })
  }

  const handleMediaAvatarClick = (commentId: number) => {
    const media = mediaDictionary.get(commentId)
    console.log("media", media)
    setMedia(media ?? [])
    console.log("media", media)
    setMediaModalOpen(true)
  }

  const getTotalPayout = (comment: any) => {
    if (comment.total_payout_value === undefined) {
      return 0
    }
    if (comment.pending_payout_value === undefined) {
      return 0
    }
    if (comment.curator_payout_value === undefined) {
      return 0
    }
    const payout = parseFloat(comment.total_payout_value.split(" ")[0])
    const pendingPayout = parseFloat(comment.pending_payout_value.split(" ")[0])
    const curatorPayout = parseFloat(comment.curator_payout_value.split(" ")[0])
    return payout + pendingPayout + curatorPayout
  }

  const handleCommentIconClick = (comment: any) => {
    if (typeof window !== "undefined") {
      window.location.href = `post/hive-173115/@${comment.author}/${comment.permlink}`
    }
  }

  const handleImageUploadClick = () => {
    console.log("inputRef", inputRef)
    if (inputRef.current) {
      inputRef.current.click()
    }
  }

  function textAreaAdjust(element: any) {
    element.style.height = "1px"
    element.style.height = 25 + element.scrollHeight + "px"
  }

  return isLoading ? (
    <LoadingComponent />
  ) : (
    <VStack
      overflowY="auto"
      css={{ "&::-webkit-scrollbar": { display: "none" } }}
      maxW={"740px"}
      width={"100%"}
      height={"100%"}
      overflow={"auto"}
      borderInline={"1px solid rgb(255,255,255,0.2)"}
    >
      <AvatarMediaModal
        isOpen={mediaModalOpen}
        onClose={() => setMediaModalOpen(false)}
        media={media}
      />
      <HStack
        flexWrap={"nowrap"}
        w={"100%"}
        css={{ "&::-webkit-scrollbar": { display: "none" } }}
        overflowX="auto"
        minHeight={"60px"}
        px={4}
      >
        {sortedComments?.map((comment, index, commentsArray) => {
          const isDuplicate =
            commentsArray.findIndex((c) => c.author === comment.author) !==
            index
          if (isDuplicate) {
            return null
          }
          return (
            <Avatar
              key={comment.id}
              size="md"
              src={`https://images.ecency.com/webp/u/${comment.author}/avatar/small`}
              border={
                mediaComments.has(comment.id) ? "2px solid limegreen" : "none"
              }
              cursor={"pointer"}
              onClick={() => handleMediaAvatarClick(Number(comment.id))}
            />
          )
        })}
        <Divider />
      </HStack>

      {user.hiveUser !== null && (
        <Box p={4} width={"100%"} bg="black" color="white" {...getRootProps()}>
          <Flex>
            <Avatar
              borderRadius={10}
              boxSize={12}
              src={`https://images.ecency.com/webp/u/${username}/avatar/small`}
            />

            <Textarea
              border="none"
              _focus={{
                border: "none",
                boxShadow: "none",
              }}
              placeholder="What's happening?"
              onChange={(e) => setPostBody(e.target.value)}
              value={postBody}
              overflow={"hidden"}
              resize={"vertical"}
              onKeyUp={(e) => textAreaAdjust(e.target)}
            />
          </Flex>
          <HStack>
            {postBody.includes("![Image](") && (
              <Box>
                <img
                  src={postBody.match(/!\[Image\]\((.*?)\)/)?.[1]}
                  alt="markdown-image"
                  width="100%"
                />
              </Box>
            )}
            {postBody.includes("<iframe") && (
              <Box>
                <video
                  src={
                    postBody.match(
                      /<iframe src="(.*?)" allowfullscreen><\/iframe>/
                    )?.[1]
                  }
                  controls
                  muted
                  width="100%"
                />
              </Box>
            )}
          </HStack>
          <HStack justifyContent="space-between" m={4}>
            <Input
              id="md-image-upload"
              type="file"
              style={{ display: "none" }}
              {...getInputProps({ refKey: "ref" })}
              ref={inputRef}
            />
            <FaImage
              color="#ABE4B8"
              cursor="pointer"
              onClick={handleImageUploadClick}
            />
            <Button
              colorScheme="green"
              variant="outline"
              ml="auto"
              onClick={handlePost}
              isLoading={isUploading}
            >
              Post
            </Button>
          </HStack>
          <Divider mt={4} />
        </Box>
      )}

      <Box width={"full"}>
        <InfiniteScroll
          dataLength={visiblePosts}
          next={() => setVisiblePosts(visiblePosts + 3)}
          hasMore={visiblePosts < (comments?.length ?? 0)}
          loader={
            <Flex justify="center">
              <BeatLoader size={8} color="darkgrey" />
            </Flex>
          }
          style={{ overflow: "hidden" }}
        >
          {reversedComments?.slice(0, visiblePosts).map((comment) => (
            <Box key={comment.id} p={4} width="100%" bg="black" color="white">
              <Flex>
                <Avatar
                  borderRadius={10}
                  boxSize={12}
                  src={`https://images.ecency.com/webp/u/${comment.author}/avatar/small`}
                />
                <HStack ml={4}>
                  <Text fontWeight="bold">{comment.author}</Text>
                  <Text ml={2} color="gray.400">
                    {formatDate(String(comment.created))}
                  </Text>
                </HStack>
              </Flex>
              <Box ml={"64px"} mt={4}>
                <ReactMarkdown
                  components={MarkdownRenderers}
                  rehypePlugins={[rehypeRaw]}
                  remarkPlugins={[remarkGfm]}
                >
                  {transformIPFSContent(
                    transformShortYoutubeLinksinIframes(comment.body)
                  )}
                </ReactMarkdown>
              </Box>
              <Flex justifyContent={"space-between"} mt={4}>
                <Button
                  colorScheme="green"
                  variant="ghost"
                  leftIcon={<FaRegComment />}
                  onClick={() => handleCommentIconClick(comment)}
                >
                  {comment.children}
                </Button>
                <Button
                  onClick={() => handleVote(comment.author, comment.permlink)}
                  colorScheme="green"
                  variant="ghost"
                  leftIcon={<FaRegHeart />}
                >
                  {comment.active_votes?.length}
                </Button>
                <Button
                  colorScheme="white"
                  variant="ghost"
                  leftIcon={<Text>⌐◨-◨</Text>}
                ></Button>
                <Button
                  colorScheme="green"
                  variant="ghost"
                  leftIcon={<FaDollarSign />}
                >
                  {getTotalPayout(comment)} USD
                </Button>
              </Flex>

              <Divider mt={4} />
            </Box>
          ))}
        </InfiniteScroll>
      </Box>
    </VStack>
  )
}

export default SkateCast
