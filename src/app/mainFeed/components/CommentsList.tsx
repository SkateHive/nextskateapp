"use client";

import { Box, Flex } from "@chakra-ui/react";
import { useEffect, useRef } from "react";
import { BeatLoader } from "react-spinners";
import CommentItem from "./CommentItem";
import { Comment } from "@hiveio/dhive";

interface CommentListProps {
  comments: Comment[];
  visiblePosts: number;
  setVisiblePosts: React.Dispatch<React.SetStateAction<number>>;
  username?: string;
}

const CommentList = ({
  comments,
  visiblePosts,
  setVisiblePosts,
  username,
}: CommentListProps) => {
  const observerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentRef = observerRef.current;
    if (!currentRef) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting) {
          setVisiblePosts((prev: number) => prev + 5);
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
  }, [setVisiblePosts]);

  return (
    <Box width={"full"}>
      <Box>
        {comments?.slice(0, visiblePosts).map((comment, index) => (
          <CommentItem
            key={comment.id || `placeholder-${index}`} // Use a fallback key if comment.id is missing
            comment={comment}
            username={username || ""}
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

export default CommentList;
