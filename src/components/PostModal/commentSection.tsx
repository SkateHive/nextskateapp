import React, { useState, useEffect } from 'react';
import { Box, Stack, Text, Button, Tooltip, Spinner, Center } from '@chakra-ui/react';
import MDEditor from '@uiw/react-md-editor';

import PostComment from '../PostCard/Comment';
import { useComments } from '@/hooks/comments'; // assuming you import useComments somewhere
import { Comment } from '@/hooks/comments';
interface CommentsSectionProps {
    comments: Comment[] | undefined;
    isCommentReply?: boolean;
}

const CommentsSection = ({ comments, isCommentReply = false }: CommentsSectionProps) => {



    if (!comments) return null;
    const blockedUsers = ['hivebuzz', 'keys-defender']; // Add the usernames of the users you want to block
    const filteredComments = comments.filter(comment => !blockedUsers.includes(comment.author));
    const hasComments = filteredComments.length > 0;
    if (!hasComments && isCommentReply) return null;


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
