"use client"
import { Box, Flex } from "@chakra-ui/react"
import InfiniteScroll from "react-infinite-scroll-component"
import { BeatLoader } from "react-spinners"
import CommentItem from "./CommentItem"

interface CommentListProps {
  comments: any[]
  visiblePosts: number
  setVisiblePosts: (posts: number) => void
  username?: string
  handleCommentIconClick: (comment: any) => void
  handleVote: (author: string, permlink: string) => void
  getTotalPayout: (comment: any) => number
}

const CommentList = ({
  comments,
  visiblePosts,
  setVisiblePosts,
  username,
  handleCommentIconClick,
  handleVote,
  getTotalPayout,
}: CommentListProps) => {
  return (
    <Box width={"full"}>
      <InfiniteScroll
        dataLength={visiblePosts}
        next={() => setVisiblePosts(visiblePosts + 3)}
        hasMore={visiblePosts < (comments?.length ?? 0)}
        loader={
          <Flex justify="center">
            <BeatLoader size={8} color="darkgrey" />
          </Flex>
        }
        style={{ overflow: "hidden" }}
      >
{comments?.slice(0, visiblePosts).map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            username={username || ""}
            handleCommentIconClick={handleCommentIconClick}
            handleVote={handleVote}
            getTotalPayout={getTotalPayout}
          />
        ))}
      </InfiniteScroll>
    </Box>
  )
}

export default CommentList
