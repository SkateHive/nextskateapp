import { Flex, Text } from "@chakra-ui/react"
import moment from "moment-timezone"
import Markdown from "../Markdown"
import UserAvatar from "../UserAvatar"
import { useComments } from '@/hooks/comments';
import { Comment } from '@/hooks/comments';
import CommentsSection from "@/components/PostModal/commentSection"
import useHiveAccount from "@/hooks/useHiveAccount";

interface PostCommentProps {
  comment: Comment
}

export default function PostComment({ comment }: PostCommentProps) {

  const { hiveAccount, isLoading } = useHiveAccount(comment.author)
  if (isLoading || !hiveAccount) return <div>Loading...</div>

  return (
    <Flex gap={2} direction={"column"}  >
      <Flex gap={1} alignItems="center" border={"1px solid white"} mb={-2} >
        <UserAvatar hiveAccount={hiveAccount} />

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
      <Flex direction={"column"} border={"1px solid"} p={5} bg={"#201d21"} >

        <Markdown content={comment.body} />
      </Flex>

      <CommentsSection comments={comment.replies} isCommentReply={true} />
    </Flex>

  )
}
