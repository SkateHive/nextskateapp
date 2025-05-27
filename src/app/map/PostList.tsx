import CommentItem from '@/components/MainFeed/components/CommentItem';
import { Box, Button, Flex, Text } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';

export interface PostListProps {
  comments: any[];
  visiblePosts: number;
  username?: string;
  parentPermlink: string;
}

const PostList: React.FC<PostListProps> = ({
  comments,
  visiblePosts,
  parentPermlink,
  username,
}) => {
  const [loadedPosts, setLoadedPosts] = useState<any[]>([]);
  const [loadedCount, setLoadedCount] = useState<number>(5);
  const [expandedComments, setExpandedComments] = useState<{ [key: string]: boolean }>({});

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

  const toggleCommentVisibility = (commentId: string) => {
    setExpandedComments(prevState => ({
      ...prevState,
      [commentId]: !prevState[commentId]
    }));
  };

  return (
    <Box width="full">
      {loadedPosts.map((comment) => (
        <Box key={comment.id}>
          <CommentItem
            comment={comment}
            username={username || ""}
            onClick={() => toggleCommentVisibility(comment.id)}
          />
          {expandedComments[comment.id] && (
            <Box ml={4} mt={2} pl={4} borderLeft="1px solid gray">
              {comments.filter(childComment => childComment.parent_permlink === comment.permlink).map(childComment => (
                <CommentItem
                  key={childComment.id}
                  comment={childComment}
                  username={username || ""}
                />
              ))}
            </Box>
          )}
        </Box>
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

export default PostList;
