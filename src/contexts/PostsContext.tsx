import { PostComponentProps } from "@/components/PostCard"
import { createContext, useContext, useState, useMemo } from "react"

interface PostsContextProps {
  isLoadingPosts: boolean
  posts: PostComponentProps[]
  getPosts: (limit: number) => void
}

const PostsDataContext = createContext<PostComponentProps[] | null>(null)
const PostsLoadingContext = createContext<boolean>(false)

export const PostsProvider = ({ children }: { children: React.ReactNode }) => {
  const [posts, setPosts] = useState<PostComponentProps[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)

  async function getPosts(limit: number) {
    try {
      setIsLoading(true)
      const res = await fetch(`/api/posts?limit=${limit}`)
      const data = await res.json()
      setPosts(data)
    } catch (err: any) {
      console.log(err)
    } finally {
      setIsLoading(false)
    }
  }

  const postsValue = useMemo(() => posts, [posts])
  const loadingValue = useMemo(() => isLoading, [isLoading])

  return (
    <PostsDataContext.Provider value={postsValue}>
      <PostsLoadingContext.Provider value={loadingValue}>
        {children}
      </PostsLoadingContext.Provider>
    </PostsDataContext.Provider>
  )
}

export const usePosts = () => {
  const context = useContext(PostsDataContext)
  if (context === undefined || context === null) {
    throw new Error("usePosts must be used within a PostsProvider")
  }
  return context
}

export const usePostsLoading = () => {
  const context = useContext(PostsLoadingContext)
  if (context === undefined) {
    throw new Error("usePostsLoading must be used within a PostsProvider")
  }
  return context
}

// Deprecated: usePostsContext
export const usePostsContext = () => {
  console.warn(
    "[DEPRECATED] usePostsContext is deprecated. Use usePosts() and usePostsLoading() instead."
  )
  return {
    posts: usePosts(),
    isLoadingPosts: usePostsLoading(),
    getPosts: () => {
      throw new Error(
        "getPosts is not available in the split context. Use your own fetch logic."
      )
    },
  }
}
