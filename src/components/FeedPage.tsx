import { VStack } from "@chakra-ui/react"
import Post, { PostComponentProps } from "./Post"

export default function FeedPage({ posts }: { posts: PostComponentProps[] }) {
  return (
    <VStack align="stretch" spacing={[2, 4]} p={2}>
      {posts.map(({ postData, userData }, i) => (
        <Post key={i} postData={postData} userData={userData} />
      ))}
    </VStack>
  )
}
