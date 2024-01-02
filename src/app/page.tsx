import Post, { PostComponentProps } from "@/components/Post"
import HiveClient from "@/lib/hiveclient"
import PostModel from "@/lib/models/post"
import { VStack } from "@chakra-ui/react"

export const revalidate = 30

const SKATEHIVE_TAG = "hive-173115"
const hiveClient = HiveClient()

async function getData(threshold: number = 0): Promise<PostComponentProps[]> {
  const response = await hiveClient.database.getDiscussions("created", {
    tag: SKATEHIVE_TAG,
    limit: threshold + 10,
  })
  if (Array.isArray(response) && response.length > 0)
    return await Promise.all(
      response.map(async (postData) => {
        const post = PostModel.newFromDiscussion(postData)
        const user = await post.authorDetails()
        return { postData: post.simplify(), userData: user.simplify() }
      })
    )
  return [{} as PostComponentProps]
}

export default async function Home() {
  const posts = await getData()
  console.log(posts)
  return (
    <VStack align="stretch" spacing={[2, 4]} p={2}>
      {posts.map(({ postData, userData }, i) => (
        <Post key={i} postData={postData} userData={userData} />
      ))}
    </VStack>
  )
}
