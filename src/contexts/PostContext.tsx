import PostModel, { PostProps } from "@/lib/models/post"
import { ReactNode, createContext, useContext, useState } from "react"

export interface PostContextProps {
  post: PostModel
}

interface PostProviderProps {
  children: ReactNode
  postData: PostProps
}

const PostContext = createContext<PostContextProps>({} as PostContextProps)

export const PostProvider = ({ children, postData }: PostProviderProps) => {
  const [post, setPost] = useState(new PostModel(postData))

  return (
    <PostContext.Provider value={{ post }}>{children}</PostContext.Provider>
  )
}

export const usePostContext = (): PostContextProps => {
  const context = useContext(PostContext)
  return context
}
