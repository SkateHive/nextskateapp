// src/components/CommentsSection.jsx
'use client'
import React, { useEffect } from 'react';
import { Box, Stack, StackDivider, Text } from '@chakra-ui/react';
import PostComment from '../PostCard/Comment';

import { Comment } from '@/hooks/comments';
import { useComments } from '@/hooks/comments';

interface CommentsSectionProps { comments: Comment[] | undefined, isCommentReply?: boolean }

const CommentsSection = ({ comments, isCommentReply = false }: CommentsSectionProps) => {
    if (!comments) return null

    // Filter out comments from the author "hivebuzz"
    const filteredComments = comments.filter(comment => comment.author !== 'hivebuzz');

    const hasComments = filteredComments.length > 0
    if (!hasComments && isCommentReply) return null

    return (
        <Box
            bg="black"
            p={4}
            border={isCommentReply ? "" : "0px solid limegreen"}
            borderLeft={isCommentReply ? "1.4px solid limegreen" : ""}
            pl={isCommentReply ? 8 : 4}
            borderRadius={0}
            height="fit-content"
        >
            <Stack gap={0}>
                {hasComments ? (
                    filteredComments.reverse().map((comment, i) => (
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
