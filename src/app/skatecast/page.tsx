"use client"
import { MarkdownRenderers } from "@/app/upload/utils/MarkdownRenderers"
import { useHiveUser } from "@/contexts/UserContext"
import { useComments } from "@/hooks/comments"
import { vote } from "@/lib/hive/client-functions"
import { transformShortYoutubeLinksinIframes } from "@/lib/utils"
import {
  Avatar,
  Badge,
  Box,
  Button,
  Center,
  Divider,
  Flex,
  HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  Textarea,
  VStack,
  useDisclosure,
  Image,
  calc
} from "@chakra-ui/react"
import { useEffect, useMemo, useState } from "react"
import { FaDollarSign, FaImage, FaRegComment, FaRegHeart } from "react-icons/fa"
import ReactMarkdown from "react-markdown"
import rehypeRaw from "rehype-raw"
import remarkGfm from "remark-gfm"
import InfiniteScroll from "react-infinite-scroll-component"
import { BeatLoader } from "react-spinners"
import AvatarMediaModal from "./mediaModal"
import { formatDate } from "@/lib/utils"
import LoadingComponent from "./loadingComponent"
import { useDropzone } from "react-dropzone"
import { uploadFileToIPFS } from "../upload/utils/uploadToIPFS"

const parent_author = "skatehacker"
const parent_permlink = "test-advance-mode-post"

// const parent_author = 'tomrohrer';
// const parent_permlink = 'how-to-backside-180-heelflip-or-full-backside-180-heelflip-tutorial';

const SkateCast = () => {
  const { comments, addComment, isLoading } = useComments(parent_author, parent_permlink)
  const [visiblePosts, setVisiblePosts] = useState(20)
  const [postBody, setPostBody] = useState("")
  const reversedComments = comments?.slice().reverse()
  const user = useHiveUser()
  const username = user?.hiveUser?.name
  const [mediaModalOpen, setMediaModalOpen] = useState(false)
  const [media, setMedia] = useState<string[]>([])
  const [mediaComments, setMediaComments] = useState(new Set())
  const [mediaDictionary, setMediaDictionary] = useState(new Map())
  const PINATA_GATEWAY_TOKEN = process.env.NEXT_PUBLIC_PINATA_GATEWAY_TOKEN;
  const [isUploading, setIsUploading] = useState(false);
  const { getRootProps, getInputProps } = useDropzone({
    noClick: true,
    noKeyboard: true,
    onDrop: async (acceptedFiles) => {
      setIsUploading(true);
      for (const file of acceptedFiles) {
        const ipfsData = await uploadFileToIPFS(file); // Use the returned data directly
        if (ipfsData !== undefined) { // Ensure ipfsData is not undefined
          const ipfsUrl = `https://ipfs.skatehive.app/ipfs/${ipfsData.IpfsHash}?pinataGatewayToken=${PINATA_GATEWAY_TOKEN}`;
          const markdownLink = file.type.startsWith("video/") ? `<iframe src="${ipfsUrl}" allowfullscreen></iframe>` : `![Image](${ipfsUrl})`;
          setPostBody(prevMarkdown => `${prevMarkdown}\n${markdownLink}\n`);
        }
      }
      setIsUploading(false);
    },
    accept: {
      'image/*': ['.png', '.gif', '.jpeg', '.jpg'],
      'video/*': ['.mp4']
    },
    multiple: false
  }
  );

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
  }, [])

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

  const handlePost = () => {
    if (!window.hive_keychain) {
      console.error("Hive Keychain extension not found!")
      return
    }

    if (!username) {
      console.error("Username is missing")
      return
    }

    const permlink = new Date()
      .toISOString()
      .replace(/[^a-zA-Z0-9]/g, "")
      .toLowerCase()

    const postData = {
      parent_author: parent_author,
      parent_permlink: parent_permlink,
      author: username,
      permlink: permlink,
      title: "",
      body: postBody,
      json_metadata: JSON.stringify({
        tags: ["skateboard"],
        app: "skatehive",
      }),
    }

    const operations = [["comment", postData]]
    window.hive_keychain.requestBroadcast(
      username,
      operations,
      "posting",
      async (response: any) => {
        if (response.success) {
          setPostBody("")
          addComment(postData)
          console.log("Comment posted successfully")
        } else {
          console.error("Error posting comment:", response.message)
        }
      }
    )
  }

  const handleVote = async (author: string, permlink: string) => {
    console.log("Vote")
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
    console.log("commentId", commentId)
    const media = mediaDictionary.get(commentId)
    console.log("media", media)
    setMedia(media ?? [])
    setMediaModalOpen(true)
  }

  const getTotalPayout = (comment: any) => {
    console.log("comment", comment)
    console.log(typeof comment.total_payout_value)
    // undefined 
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
  };



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
              size='md'
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

      {user.hiveUser !== null &&
        <Box p={4} width={"100%"} bg="black" color="white"  {...getRootProps()} >
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
            />


          </Flex>
          <HStack justifyContent="space-between" m={4}>
            <FaImage color="#ABE4B8" cursor="pointer" />
            <Button
              colorScheme="green"
              variant="outline"
              ml="auto"
              onClick={handlePost}
            >
              Post
            </Button>
          </HStack>
          <Divider mt={4} />
        </Box>
      }

      <Box width={"full"}>
        <InfiniteScroll
          dataLength={visiblePosts}
          next={() => setVisiblePosts(visiblePosts + 3)}
          hasMore={visiblePosts < (comments?.length ?? 0)}
          loader={<Flex justify="center"><BeatLoader size={8} color="darkgrey" /></Flex>}
          style={{ overflow: "hidden" }}>
          {reversedComments?.slice(0, visiblePosts).map((comment) => (
            <Box key={comment.id} p={4} width="100%" bg="black" color="white">
              <Flex >
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
                  {transformShortYoutubeLinksinIframes(comment.body)}
                </ReactMarkdown>
              </Box>
              <Flex justifyContent={"space-between"} mt={4}>
                <Button
                  colorScheme="green"
                  variant="ghost"
                  leftIcon={<FaRegComment />}
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
                >
                </Button>
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
