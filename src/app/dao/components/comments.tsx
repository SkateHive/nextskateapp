"use client"
import CommandPrompt from "@/components/PostModal/commentPrompt"
import CommentsSection from "@/components/PostModal/commentSection"
import { usePostContext } from "@/contexts/PostContext"
import { useComments } from "@/hooks/comments"
import { Box } from "@chakra-ui/react"
interface CommentsProps {
  author: string
  permlink: string
  comments: any
}

const CommentsComponent = (props: CommentsProps) => {
  const { author, permlink, comments } = props
  console.log("CommentsComponent", author, permlink)
  const { post } = usePostContext()

  const { addComment } = useComments(author, permlink, true)
  return (
    <Box>
      <CommandPrompt addComment={addComment} post={post} />
      <CommentsSection comments={comments} />
    </Box>
  )
}
export default CommentsComponent
