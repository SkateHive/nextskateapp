import { Flex, Text } from "@chakra-ui/react"
import moment from "moment-timezone"
import Markdown from "../Markdown"
import UserAvatar from "../UserAvatar"

interface PostCommentProps {
  comment: {
    author: string
    body: string
    last_update: string
    permlink: string
    url: string
  }
}

export default function PostComment({ comment }: PostCommentProps) {
  return (
    <Flex gap={2}>
      <UserAvatar username={comment.author} />
      <Flex direction={"column"}>
        <Flex gap={1} alignItems="center">
          <Text fontSize="14px" as="b">
            {comment.author}
          </Text>
          <Text fontSize="14px" color="darkgray">
            ·
          </Text>
          <Text fontSize="12px" color="darkgray" fontWeight="300">
            {moment.utc(comment.last_update).fromNow()}
          </Text>
        </Flex>
        <Markdown content={comment.body} />
      </Flex>
    </Flex>
  )
}
