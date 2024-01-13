import PostModel, { PostProps } from "@/lib/models/post"
import UserModel, { UserProps } from "@/lib/models/user"
import { ReactNode, createContext, useContext, useState } from "react"

export interface PostContextProps {
  post: PostModel
  user: UserModel
}

interface PostProviderProps {
  children: ReactNode
  postData: PostProps
  userData: UserProps
}

const PostContext = createContext<PostContextProps>({} as PostContextProps)

export const PostProvider = ({
  children,
  postData,
  userData,
}: PostProviderProps) => {
  const [post, setPost] = useState(new PostModel(postData))
  const [user, setUser] = useState(new UserModel(userData))

  return (
    <PostContext.Provider value={{ post, user }}>
      {children}
    </PostContext.Provider>
  )
}

export const usePostContext = (): PostContextProps => {
  const context = useContext(PostContext)
  return context
}
