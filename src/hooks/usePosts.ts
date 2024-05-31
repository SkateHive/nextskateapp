import HiveClient from "@/lib/hive/hiveclient";
import { Discussion } from "@hiveio/dhive";
import { useEffect, useState } from "react";

export default function usePosts(query: String, params: any[]) {
  const [posts, setPosts] = useState<Discussion[]>()
  const [queryCategory, setQueryCategory] = useState<String>(query)
  const [discussionQuery, setDiscussionQuery] = useState(params)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleGetPosts = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const by = 'get_discussions_by_' + queryCategory
        const posts = await HiveClient.database.call(by, discussionQuery)
        setPosts(posts)
      } catch (e) {
        console.log(e)
        setError("Loading account error!")
      } finally {
        setIsLoading(false)
      }
    }
    handleGetPosts()
  }, [queryCategory, discussionQuery]);
  return { posts, isLoading, error, queryCategory, setQueryCategory, setDiscussionQuery }
}

