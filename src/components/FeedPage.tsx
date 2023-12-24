import HiveClient from "@/lib/hiveclient"
import PostModel from "@/lib/models/post"
import { VStack } from "@chakra-ui/react"
import Post, { PostComponentProps } from "./Post"
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

export default async function FeedPage() {
  const data = await getData()
  return (
    <VStack align="stretch" spacing={4} p={2}>
      {data &&
        data.map(({ postData, userData }, i) => (
          <Post key={i} postData={postData} userData={userData} />
        ))}
    </VStack>
  )
}
