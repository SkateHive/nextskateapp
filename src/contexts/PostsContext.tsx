import { PostComponentProps } from "@/components/Post"
import { createContext, useContext, useState } from "react"

interface PostsContextProps {
  isLoadingPosts: boolean
  posts: PostComponentProps[]
  getPosts: (limit: number) => void
}

const PostsContext = createContext<PostsContextProps>({} as PostsContextProps)

export const PostsProvider = ({ children }: { children: React.ReactNode }) => {
  const [posts, setPosts] = useState<PostComponentProps[]>(
    [] as PostComponentProps[]
  )
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

  return (
    <PostsContext.Provider
      value={{ posts: posts, getPosts: getPosts, isLoadingPosts: isLoading }}
    >
      {children}
    </PostsContext.Provider>
  )
}

export const usePostsContext = (): PostsContextProps => {
  const context = useContext(PostsContext)
  return context
}
