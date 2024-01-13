"use client"

import { usePostsContext } from "@/contexts/PostsContext"
import { Flex, VStack } from "@chakra-ui/react"
import { useEffect } from "react"
import InfiniteScroll from "react-infinite-scroll-component"
import { BeatLoader } from "react-spinners"
import Post from "../Post"

export default function Feed() {
  const { posts, getPosts } = usePostsContext()

  useEffect(() => {
    if (posts.length == 0) getPosts(10)
  }, [])

  return (
    <VStack align="stretch" spacing={[2, 4]}>
      <InfiniteScroll
        style={{ padding: 2 }}
        dataLength={posts.length}
        next={() => getPosts(posts.length + 10)}
        hasMore={posts.length !== 100}
        loader={
          <Flex w={"100%"} justify={"center"}>
            <BeatLoader size={8} color="darkgrey" />
          </Flex>
        }
      >
        {posts.length > 1 &&
          posts.map(({ postData, userData }, i) => (
            <Post key={i} userData={userData} postData={postData} />
          ))}
      </InfiniteScroll>
    </VStack>
  )
}
