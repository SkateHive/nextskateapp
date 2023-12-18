import HiveClient from "@/lib/hiveclient"
import { VStack } from "@chakra-ui/react"
import Post from "./Post"
const SKATEHIVE_TAG = "hive-173115"

const hiveClient = HiveClient()

async function getData(threshold: number = 0) {
  const discussions = await hiveClient.database.getDiscussions("created", {
    tag: SKATEHIVE_TAG,
    limit: threshold + 20,
  })

  if (discussions.length === 0) {
    throw new Error("Failed to fetch discussions")
  }

  return discussions
}

export default async function FeedPage() {
  const data = await getData()
  return (
    <VStack align="stretch" spacing={4} p={2}>
      {data && data.map((post, i) => <Post key={i} post={post} />)}
    </VStack>
  )
}
