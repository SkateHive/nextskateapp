'use client'
import CommandPrompt from "@/components/PostModal/commentPrompt"
import CommentsSection from "@/components/PostModal/commentSection"
import { useComments } from "@/hooks/comments"
import { Box } from "@chakra-ui/react"
interface CommentsProps {
    author: string
    permlink: string
}

const CommentsComponent = (props: CommentsProps) => {

    const { author, permlink } = props;
    console.log("CommentsComponent", author, permlink)

    const { comments, addComment } = useComments(author, permlink, true);
    return (
        <Box>
            <CommandPrompt addComment={addComment} />
            <CommentsSection comments={comments} />
        </Box>
    )

}
export default CommentsComponent