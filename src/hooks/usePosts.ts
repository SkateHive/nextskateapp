import HiveClient from "@/lib/hiveclient"
import { Discussion } from "@hiveio/dhive"
import useSWR from "swr"

const hiveClient = HiveClient
const SKATEHIVE_TAG = "hive-173115"
export const SWR_POSTS_TAG = "posts"

// async function fetchPosts(): Promise<PostComponentProps[] | undefined> {
//   const posts = await hiveClient.database.getDiscussions("created", {
//     tag: SKATEHIVE_TAG,
//     limit: 100,
//   })
//   if (Array.isArray(posts) && posts.length > 0)
//     return await Promise.all(
//       posts.map(async (postData) => {
//         const post = PostModel.newFromDiscussion(postData)
// const user = await post.authorDetails()
//         return { postData: post.simplify(), userData: user.simplify() }
//       })
//     )
//   return undefined
// }
async function fetchPosts(): Promise<Discussion[] | undefined> {
  const posts = await hiveClient.database.getDiscussions("created", {
    tag: SKATEHIVE_TAG,
    limit: 100,
  })
  return posts
}

export function usePosts() {
  const { data, error, isLoading } = useSWR(SWR_POSTS_TAG, fetchPosts)

  return {
    posts: data,
    error,
    isLoading,
  }
}
