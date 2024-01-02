import { PostComponentProps } from "@/components/Post"
import HiveClient from "@/lib/hiveclient"
import PostModel from "@/lib/models/post"

const SKATEHIVE_TAG = "hive-173115"
const hiveClient = HiveClient()

export const revalidate = 30

async function getData(limit: number = 0): Promise<PostComponentProps[]> {
  const response = await hiveClient.database.getDiscussions("created", {
    tag: SKATEHIVE_TAG,
    limit: limit,
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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const limit = parseInt(searchParams.get("limit") as string)
  const data = await getData(isNaN(limit) ? 1 : limit)
  return Response.json(data)
}
