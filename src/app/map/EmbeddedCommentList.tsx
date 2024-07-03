import { Box, Button, Flex, Text } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import CommentItem from '../mainFeed/components/CommentItem';


export interface EmbeddedCommentListProps {
    comments: any[];
    visiblePosts: number;
    username?: string;
    parentPermlink: string; 

}

const EmbeddedCommentList: React.FC<EmbeddedCommentListProps> = ({
    comments,
    visiblePosts,
   parentPermlink,
    username,
    
  
}) => {
    
    const [loadedPosts, setLoadedPosts] = useState<any[]>([]);
    const [loadedCount, setLoadedCount] = useState<number>(5);

    useEffect(() => {
        setLoadedCount(5);
    }, [parentPermlink]);

    useEffect(() => {
        const filteredComments = comments
            .filter(comment => comment.parent_permlink === parentPermlink)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, loadedCount);

        setLoadedPosts(filteredComments);
    }, [comments, loadedCount, parentPermlink]);

    const loadMorePosts = () => {
        setLoadedCount(loadedCount + visiblePosts);
    };
    
    

  return (
    <Box width="full">
            {loadedPosts.map((comment) => (
                <CommentItem
                    key={comment.id}
                    comment={comment}
                    username={username || ""}
                    handleVote={() => {}} />
            ))}
            {comments.length === 0 && (
                <Flex justify="center" py={4}>
                    <Text>No comments found.</Text>
                </Flex>
            )}
            {comments.length > loadedPosts.length && (
                <Flex justify="center" py={4}>
                    <Button onClick={loadMorePosts}>Load more posts</Button>
                </Flex>
            )}
        </Box>

  );
};

export default EmbeddedCommentList;
