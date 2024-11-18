"use client";

import { Box } from "@chakra-ui/react";
import { useCallback, useEffect, useRef } from "react";
import CommentList from "./CommentsList";

interface ToggleCommentsProps {
  isEyeClicked?: boolean;
  commentReplies: any[];
  visiblePosts: number;
  setVisiblePosts: React.Dispatch<React.SetStateAction<number>>;
  username: string;
  handleVote: (author: string, permlink: string) => void;
  shouldShowAllComments?: boolean;
  isCommentFormVisible?: boolean;
}

const ToggleComments = ({
  isEyeClicked,
  commentReplies,
  visiblePosts,
  setVisiblePosts,
  username,
  handleVote,
  shouldShowAllComments,
  isCommentFormVisible
}: ToggleCommentsProps) => {
  const shouldShowComments = isEyeClicked || shouldShowAllComments || isCommentFormVisible;

  const observerRef = useRef<HTMLDivElement>(null);

  const loadMoreComments = useCallback(() => {
    if (visiblePosts < commentReplies.length) {
      setVisiblePosts((prev) => prev + 5);
    }
  }, [visiblePosts, commentReplies.length, setVisiblePosts]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting) {
          loadMoreComments();
        }
      },
      {
        root: null, 
        rootMargin: "0px",
        threshold: 1.0, 
      }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => {
      if (observerRef.current) {
        observer.unobserve(observerRef.current);
      }
    };
  }, [loadMoreComments]);

  return (
    <>
      {shouldShowComments && (
        <Box ml={10} mt={4} pl={4} borderLeft="2px solid gray">
          <CommentList
            comments={commentReplies}
            visiblePosts={visiblePosts}
            setVisiblePosts={setVisiblePosts}
            username={username}
            handleVote={handleVote}
          />

          {visiblePosts < commentReplies.length && (
            <div ref={observerRef} style={{ height: "1px" }}></div>
          )}
        </Box>
      )}
    </>
  );
};

export default ToggleComments;
