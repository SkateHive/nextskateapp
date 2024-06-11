"use client";

import PostModel from "@/lib/models/post";
import { ReactNode, createContext, useContext, useState } from "react";

export interface PostViewContextProps {
  postView?: PostModel
  setPostView: (post: PostModel) => void
  hidePostView: () => void
}

interface PostViewProviderProps {
  children: ReactNode
}

const PostViewContext = createContext<PostViewContextProps>({} as PostViewContextProps)

export const PostViewProvider = ({ children }: PostViewProviderProps) => {
  const [post, setPost] = useState<PostModel | undefined>()
  const hidePostView = () => {
    setPost(undefined)
  }

  return (
    <PostViewContext.Provider value={{ postView: post, setPostView: setPost, hidePostView }}>{children}</PostViewContext.Provider>
  )
}

export const usePostViewContext = (): PostViewContextProps => {
  const context = useContext(PostViewContext)
  return context
}
