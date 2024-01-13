"use client"

import { usePosts } from "@/hooks/usePosts"
import PostModel from "@/lib/models/post"
import { Flex, VStack } from "@chakra-ui/react"
import { useState } from "react"
import InfiniteScroll from "react-infinite-scroll-component"
import { BeatLoader } from "react-spinners"
import Post from "../Post"

export default function Feed() {
  const { posts, error } = usePosts()
  const [visiblePosts, setVisiblePosts] = useState(5)

  if (error) return "Error"
  if (!posts)
    return (
      <Flex w={"100%"} justify={"center"}>
        <BeatLoader size={8} color="darkgrey" />
      </Flex>
    )
  return (
    <VStack align="stretch" spacing={[2, 4]}>
      <InfiniteScroll
        style={{ padding: 2 }}
        dataLength={visiblePosts}
        next={() => setVisiblePosts((visiblePosts) => visiblePosts + 5)}
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
