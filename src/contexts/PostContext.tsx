"use client";

import PostModel, { PostProps } from "@/lib/models/post";
import { ReactNode, createContext, useContext, useState } from "react";

export interface PostContextProps {
  post: PostModel;
}

const PostContext = createContext<PostContextProps | undefined>(undefined);

export const PostProvider = ({ children, postData }: { children: ReactNode; postData: PostProps }) => {
  const [post, setPost] = useState(new PostModel(postData));

  return (
    <PostContext.Provider value={{ post }}>
      {children}
    </PostContext.Provider>
  );
};

export const usePostContext = (): PostContextProps => {
  const context = useContext(PostContext);
  if (!context) {
    throw new Error("usePostContext must be used within a PostProvider");
  }
  return context;
};
