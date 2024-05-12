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
  Image
} from "@chakra-ui/react"
import { useEffect, useMemo, useState } from "react"
import { AiOutlineRetweet } from "react-icons/ai"
import { FaImage, FaRegComment, FaRegHeart } from "react-icons/fa"
import ReactMarkdown from "react-markdown"
import rehypeRaw from "rehype-raw"
import remarkGfm from "remark-gfm"

const PINATA_TOKEN = process.env.NEXT_PUBLIC_PINATA_GATEWAY_TOKEN

interface mediaProps {
  media: string[]
  type: string
}

const AvatarMediaModal = ({
  isOpen,
  onClose,
  media,
}: {
  isOpen: boolean
  onClose: () => void
  media: string[]
}) => {
  const pinataToken = PINATA_TOKEN
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="full">
      <ModalOverlay filter="blur(8px)" />
      <ModalContent bg={"black"}>
        <ModalHeader>Media</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Flex></Flex>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

let thumbnailUrl = "https://www.skatehive.app/assets/skatehive.jpeg"



// const parent_author = "skatehive"
// const parent_permlink = "the-weekly-stoken-55"

const parent_author = 'skatehacker';
const parent_permlink = 'test-advance-mode-post';

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
  const { isOpen, onOpen, onClose } = useDisclosure()

  const formatDate = (date: string) => {
    const now = new Date()
    const postDate = new Date(date)
    const diffInSeconds = Math.floor(
      (now.getTime() - postDate.getTime()) / 1000
    )

    if (diffInSeconds < 60) {
      return "Just now"
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60)
      return `${minutes} minute${minutes > 1 ? "s" : ""} ago`
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600)
      return `${hours} hour${hours > 1 ? "s" : ""} ago`
    } else {
      const days = Math.floor(diffInSeconds / 86400)
      return `${days} day${days > 1 ? "s" : ""} ago`
    }
  }
  const [mediaComments, setMediaComments] = useState(new Set())
  const [mediaDictionary, setMediaDictionary] = useState(new Map())

  useEffect(() => {
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

  return isLoading ? (
    <VStack maxW={"800px"} width={"100%"}>
      <VStack>
        <Image minW={"100%"} src="https://i.ibb.co/Br0SMjz/Crop-animated.gif" alt="Loading..." />
        <Image mt={-2} minW={"100%"} src="https://i.ibb.co/L8mj1CV/Crop-animated-1.gif" alt="Loading..." />

        Loading...

      </VStack>
    </VStack>
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
      {/* <Box flexDirection="column" w="100%" minH="100vh" bg="black"> */}
      <HStack
        flexWrap={"nowrap"}
        w={"100%"}
        css={{ "&::-webkit-scrollbar": { display: "none" } }}
        overflowX="auto"
        minHeight={"60px"}
        px={4}
      >
        {/* <Flex p={5} > */}
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
        {/* </Flex> */}
        <Divider />
      </HStack>
      <Box p={4} width={"100%"} bg="black" color="white">
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
      <Box width={"full"}>
        {/* <InfiniteScroll
                            dataLength={visiblePosts}
                            next={() => setVisiblePosts(visiblePosts + 3)}
                            hasMore={visiblePosts < (comments?.length ?? 0)}
                            loader={<Flex justify="center"><BeatLoader size={8} color="darkgrey" /></Flex>}
                            style={{ overflow: "hidden" }}
                        > */}
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
                <Badge colorScheme="green" variant="outline" mt={0}>
                  4.20 USD
                </Badge>
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
                colorScheme="green"
                variant="ghost"
                leftIcon={<AiOutlineRetweet />}
              >
                {comment.net_votes}
              </Button>
            </Flex>

            <Divider mt={4} />
          </Box>
        ))}
        {/* </InfiniteScroll> */}
      </Box>

      {/* </Box> */}
    </VStack>
  )
}

export default SkateCast
