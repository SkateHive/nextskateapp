'use client'
import CommentsSection from "@/components/PostModal/commentSection"
import { useComments } from "@/hooks/comments"
import { Box } from "@chakra-ui/react"
import CommandPrompt from "@/components/PostModal/commentPrompt"
interface CommentsProps {
    author: string
    permlink: string
}

const CommentsComponent = (props: CommentsProps) => {

    const { author, permlink } = props;
    const { comments, addComment } = useComments(author, permlink);
    return (
        <Box>
            <CommandPrompt addComment={addComment} />
            <CommentsSection comments={comments} />
        </Box>
    )

}
export default CommentsComponent