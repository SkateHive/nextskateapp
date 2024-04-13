import { Flex, Text } from "@chakra-ui/react"
import moment from "moment-timezone"
import Markdown from "../Markdown"
import UserAvatar from "../UserAvatar"
import { useComments } from '@/hooks/comments';
import { Comment } from '@/hooks/comments';
import CommentsSection from "@/components/PostModal/commentSection"

interface PostCommentProps {
  comment: Comment
}

export default function PostComment({ comment }: PostCommentProps) {
  return (
    <Flex gap={2} direction={"column"}  >
      <Flex gap={1} alignItems="center" border={"1px solid white"} mb={-2} >
        <UserAvatar username={comment.author} />

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
      <Flex direction={"column"} border={"1px solid"} p={5}>

        <Markdown content={comment.body} />
      </Flex>

      <CommentsSection comments={comment.replies} isCommentReply={true} />
    </Flex>

  )
}
