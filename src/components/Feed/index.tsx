"use client"

import { usePostsContext } from "@/contexts/PostsContext"
import { Button, VStack } from "@chakra-ui/react"
import { useEffect } from "react"
import Post from "../Post"

export default function Feed() {
  const { posts, getPosts, isLoadingPosts } = usePostsContext()

  useEffect(() => {
    if (posts.length == 0) getPosts(10)
  }, [])

  return (
    <VStack align="stretch" spacing={[2, 4]} p={2}>
      {posts.length > 1 &&
        posts.map(({ postData, userData }, i) => (
          <Post key={i} postData={postData} userData={userData} />
        ))}
      {posts.length < 100 && (
        <Button onClick={() => getPosts(posts.length + 10)}>
          {isLoadingPosts ? "Loading..." : `Load More (${posts.length})`}
        </Button>
      )}
    </VStack>
  )
}
