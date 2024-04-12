// src/components/CommentsSection.jsx

import React from 'react';
import { Box, Stack, StackDivider, Text } from '@chakra-ui/react';
import PostComment from '../PostCard/Comment';

import { Comment } from '@/hooks/comments';
const CommentsSection = ({ comments }: { comments: Comment[] }) => {

    return (
        <Box
            bg="black"
            p={4}
            border="1.4px solid limegreen"
            borderRadius={0}
            height="fit-content"
        >
            <Stack divider={<StackDivider borderColor="limegreen" />} gap={4}>
                {comments && comments.length > 1 ? (
                    comments.toReversed().map((comment, i) => (
                        <PostComment key={comment.id} comment={comment} />
                    ))
                ) : (
                    <Text w="100%" align="center">
                        Nothing yet
                    </Text>
                )}
            </Stack>
        </Box>
    );
};

export default CommentsSection;
