import Posts from "@/components/posts"
import HiveClient from "@/lib/hiveclient"

import { Discussion } from "@hiveio/dhive"

const SKATEHIVE_TAG = "hive-173115"
const SKATEHIVE_QUERY = "created"

export default async function Home() {
  let posts: Discussion[] = []

  const hiveClient = HiveClient()
  const queryResult = await hiveClient.database.getDiscussions(
    SKATEHIVE_QUERY,
    {
      tag: SKATEHIVE_TAG,
      limit: posts.length + 10,
    }
  )

  if (queryResult?.length) posts = queryResult

  return <main>{posts?.length && <Posts posts={posts} />}</main>
}
