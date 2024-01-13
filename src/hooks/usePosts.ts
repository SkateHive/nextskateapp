import HiveClient from "@/lib/hiveclient"
import { Discussion } from "@hiveio/dhive"
import useSWR from "swr"

const SKATEHIVE_TAG = "hive-173115"
export const SWR_POSTS_TAG = "posts"

async function fetchPosts(): Promise<Discussion[] | undefined> {
  const posts = await HiveClient.database.getDiscussions("created", {
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
