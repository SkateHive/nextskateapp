"use client"

import { usePosts } from "@/hooks/usePosts"
import PostModel from "@/lib/models/post"
import { Box, Flex, VStack } from "@chakra-ui/react"
import { useState } from "react"
import InfiniteScroll from "react-infinite-scroll-component"
import { BeatLoader } from "react-spinners"
import Post from "../Post"
import PostSkeleton from "../Post/Skeleton"

export default function Feed() {
  const { posts, error, isLoading } = usePosts()
  const [visiblePosts, setVisiblePosts] = useState(3)

  if (error) return "Error"

  if (isLoading || !posts)
    return (
      <Box p={1}>
        <PostSkeleton />
        <PostSkeleton />
        <PostSkeleton />
      </Box>
    )

  return (
    <VStack align="stretch" spacing={[2, 4]}>
      <InfiniteScroll
        style={{ padding: 2 }}
        dataLength={visiblePosts}
        next={() => setVisiblePosts((visiblePosts) => visiblePosts + 3)}
        hasMore={visiblePosts !== 100}
        loader={
          <Flex w={"100%"} justify={"center"}>
            <BeatLoader size={8} color="darkgrey" />
          </Flex>
        }
      >
        {posts.length > 1 &&
          posts
            .slice(0, visiblePosts)
            .map((post, i) => (
              <Post key={i} postData={PostModel.newFromDiscussion(post)} />
            ))}
      </InfiniteScroll>
    </VStack>
  )
}
