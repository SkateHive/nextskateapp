import { Comment } from '@/hooks/comments';
import { Box, Stack, Text } from '@chakra-ui/react';
import PostComment from '../PostCard/Comment';

interface CommentsSectionProps {
    comments: Comment[] | undefined;
    isCommentReply?: boolean;
}

const CommentsSection = ({ comments, isCommentReply = false }: CommentsSectionProps) => {
    if (!comments) return null;

    const blockedUsers = ['hivebuzz', 'keys-defender'];
    const filteredComments = comments.filter(comment => !blockedUsers.includes(comment.author)).reverse();

    if (filteredComments.length === 0) {
        if (isCommentReply) return null;
        return <Text w="100%" align="center">Nothing yet</Text>;
    }

    return (
        <Box
            bg="black"
            p={4}
            border={isCommentReply ? "" : "0px solid #A5D6A7"}
            borderLeft={isCommentReply ? "1.4px dashed green" : ""}
            pl={isCommentReply ? 8 : 4}
            borderRadius={0}
            height="fit-content"
        >
            <Stack gap={0}>
                {filteredComments.map((comment, i) => (
                    <PostComment key={`${comment.id}-${i}`} comment={comment} />
                ))}


            </Stack>
        </Box>
    );
};

export default CommentsSection;
