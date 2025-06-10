"use client";

import { Box, Flex } from "@chakra-ui/react";
import { useEffect, useRef, memo, useCallback, useMemo } from "react";
import { BeatLoader } from "react-spinners";
import CommentItem from "./CommentItem";
import { Comment } from "@hiveio/dhive";

interface CommentListProps {
  comments: Comment[];
  visiblePosts: number;
  setVisiblePosts: React.Dispatch<React.SetStateAction<number>>;
  username?: string;
  onNewComment?: (newComment: Comment) => void;
}

const CommentList = ({
  comments,
  visiblePosts,
  setVisiblePosts,
  username,
  onNewComment,
}: CommentListProps) => {
  const observerRef = useRef<HTMLDivElement>(null);

  // Memoize the visible comments to prevent unnecessary recalculations
  const visibleComments = useMemo(() => {
    return comments?.slice(0, visiblePosts) || [];
  }, [comments, visiblePosts]);

  // Memoize the increment function
  const incrementVisiblePosts = useCallback(() => {
    setVisiblePosts((prev: number) => prev + 5);
  }, [setVisiblePosts]);

  // Memoize the comment handler to prevent recreating on every render
  const handleNewComment = useCallback(
    (newComment: Comment) => {
      if (onNewComment) {
        onNewComment(newComment);
      }
      setVisiblePosts((prev) => prev + 1);
    },
    [onNewComment, setVisiblePosts]
  );

  useEffect(() => {
    const currentRef = observerRef.current;
    if (!currentRef) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting) {
          incrementVisiblePosts();
        }
      },
      {
        root: null,
        rootMargin: "0px",
        threshold: 0.1,
      }
    );

    observer.observe(currentRef);

    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, [incrementVisiblePosts]);

  return (
    <Box width={"full"}>
      <Box>
        {visibleComments.map((comment, index) => (
          <CommentItem
            key={
              comment.id ||
              `comment-${comment.author}-${comment.permlink}-${index}`
            }
            comment={comment}
            username={username || ""}
            onNewComment={handleNewComment}
          />
        ))}

        {visiblePosts === 0 && comments.length === 0 && (
          <Flex justify="center">
            <BeatLoader size={8} color="darkgrey" />
          </Flex>
        )}

        {visiblePosts < comments.length && (
          <div ref={observerRef} style={{ height: "50px" }}></div>
        )}
      </Box>
    </Box>
  );
};

export default memo(CommentList);
