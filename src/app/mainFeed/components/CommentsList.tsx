"use client";

import { Box, Flex } from "@chakra-ui/react";
import { useEffect, useRef } from "react";
import { BeatLoader } from "react-spinners";
import CommentItem from "./CommentItem";

interface CommentListProps {
  comments: any[];
  visiblePosts: number;
  setVisiblePosts: React.Dispatch<React.SetStateAction<number>>;
  username?: string;
  handleVote: (author: string, permlink: string) => void;
}

const CommentList = ({
  comments,
  visiblePosts,
  setVisiblePosts,
  username,
  handleVote,
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
        {comments
          ?.slice(0, visiblePosts)
          .map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              username={username || ""}
              handleVote={handleVote}
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
