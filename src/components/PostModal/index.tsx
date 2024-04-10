"use client"

import ReactMarkdown from "react-markdown"

import { MarkdownRenderers } from "@/app/upload/utils/MarkdownRenderers"
import { usePostContext } from "@/contexts/PostContext"
import {
  Box,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
  StackDivider,
  Text,
} from "@chakra-ui/react"
import Header from "../PostCard/Header"

import { useComments } from "@/hooks/comments"
import { transform3SpeakContent } from "@/lib/utils"
import rehypeRaw from "rehype-raw"
import remarkGfm from "remark-gfm"
import PostComment from "../PostCard/Comment"

interface PostModalInterface {
  isOpen: boolean
  onClose(): void
}

export function PostModal({ isOpen, onClose }: PostModalInterface) {
  const { post } = usePostContext()
  const { comments } = useComments(post.author, post.permlink)
  const postBody = transform3SpeakContent(post.body)
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size={{ base: "lg", md: "2xl", lg: "6xl" }}
    >
      <ModalOverlay style={{ backdropFilter: "blur(5px)" }} />
      <ModalContent
        bg={"black"}
        border={"1.4px solid limegreen"}
        borderRadius={0}
        p={4}
        w={"100%"}
      >
        <ModalHeader>
          <Header variant="open" />
        </ModalHeader>
        <ModalCloseButton mr={4} mt={2} color={"red"} />
        <ModalBody
          display={"flex"}
          flexDir={{ base: "column", lg: "row" }}
          minH={"60vh"}
          gap={6}
        >
          <Box
            bg={"black"}
            flex={1}
            p={4}
            border={"1.4px solid limegreen"}
            borderRadius={0}
          >
            <ReactMarkdown
              components={MarkdownRenderers}
              rehypePlugins={[rehypeRaw]}
              remarkPlugins={[remarkGfm]}
            >
              {postBody}
            </ReactMarkdown>
          </Box>
          <Box
            bg={"black"}
            flex={1}
            p={4}
            border={"1.4px solid limegreen"}
            borderRadius={0}
            height={"fit-content"}
          >
            <Stack divider={<StackDivider borderColor={"limegreen"} />} gap={4}>
              {comments && comments.length > 1 ? (
                comments
                  .toReversed()
                  .map((comment, i) => (
                    <PostComment key={comment.id} comment={comment} />
                  ))
              ) : (
                <Text w={"100%"} align={"center"}>
                  Nothing yet
                </Text>
              )}
            </Stack>
          </Box>
        </ModalBody>
        <ModalFooter></ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default PostModal
