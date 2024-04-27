'use client'
import CommentsSection from "@/components/PostModal/commentSection"
import { useComments } from "@/hooks/comments"
import { Box } from "@chakra-ui/react"

interface CommentsProps {
    author: string
    permlink: string
}

const CommentsComponent = (props: CommentsProps) => {

    const { author, permlink } = props;
    const { comments } = useComments(author, permlink);
    return (
        <Box>
            <CommentsSection comments={comments} />
        </Box>
    )

}
export default CommentsComponent