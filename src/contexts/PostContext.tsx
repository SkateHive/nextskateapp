"use client";

import PostModel, { PostProps } from "@/lib/models/post";
import { ReactNode, createContext, useContext, useMemo, memo } from "react";

export interface PostContextProps {
  post: PostModel;
}

const PostContext = createContext<PostContextProps | undefined>(undefined);

export const PostProvider = memo(
  ({ children, postData }: { children: ReactNode; postData: PostProps }) => {
    // Memoize PostModel creation to prevent recreation on every render
    const post = useMemo(
      () => new PostModel(postData),
      [
        postData.post_id,
        postData.author,
        postData.permlink,
        postData.title,
        postData.body,
        postData.json_metadata,
        postData.created,
        postData.total_payout_value,
        postData.curator_payout_value,
        postData.pending_payout_value,
        postData.active_votes,
      ]
    );

    // Memoize context value to prevent unnecessary re-renders
    const contextValue = useMemo(() => ({ post }), [post]);

    return (
      <PostContext.Provider value={contextValue}>
        {children}
      </PostContext.Provider>
    );
  }
);

PostProvider.displayName = "PostProvider";

export const usePostContext = (): PostContextProps => {
  const context = useContext(PostContext);
  if (!context) {
    throw new Error("usePostContext must be used within a PostProvider");
  }
  return context;
};
