"use client"

import { usePostsContext } from "@/contexts/PostsContext"
import { Button, VStack } from "@chakra-ui/react"
import { useEffect } from "react"
import Post from "../Post"

export default function Feed() {
  // const [posts, setPosts] = useState<PostComponentProps[]>(
  //   [] as PostComponentProps[]
  // )
  // const [isLoading, setIsLoading] = useState(false)

  const { posts, getPosts, isLoadingPosts } = usePostsContext()

  useEffect(() => {
    console.log(posts.length)
    if (posts.length == 0) getPosts(10)
  }, [])

  // const handleClickLoadMore = async (threshold: number = 0) => {
  // loadMorePosts(threshold)
  //   getPosts(threshold)
  // }

  // const loadMorePosts = async (threshold: number = 0) => {
  //   try {
  //     setIsLoading(true)
  //     const res = await fetch(`/api/posts?limit=${threshold + 10}`)
  //     const data = await res.json()
  //     setPosts(data)
  //   } catch (err: any) {
  //     console.log(err)
  //   } finally {
  //     setIsLoading(false)
  //   }
  // }

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
