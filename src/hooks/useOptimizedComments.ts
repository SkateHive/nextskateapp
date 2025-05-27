import { useComments as useOriginalComments } from "./comments";
import { useMemo } from "react";
import { Discussion } from "@hiveio/dhive";

// Enhanced hook with better caching for feed components
export function useOptimizedComments(
  author: string,
  permlink: string,
  recursive: boolean = false,
  filteredCommenter?: string
) {
  const { comments, isLoading, error, addComment, updateComments } = useOriginalComments(
    author,
    permlink,
    recursive,
    filteredCommenter
  );

  // Memoize comments to prevent unnecessary re-renders
  const memoizedComments = useMemo(() => {
    if (!comments.length) return [];
    
    // Sort by creation date once and memoize
    return [...comments].sort((a, b) => 
      new Date(b.created).getTime() - new Date(a.created).getTime()
    );
  }, [comments]);

  // Memoize filtered comments if filteredCommenter is provided
  const filteredComments = useMemo(() => {
    if (!filteredCommenter) return memoizedComments;
    
    return memoizedComments.filter(comment => 
      comment.author === filteredCommenter
    );
  }, [memoizedComments, filteredCommenter]);

  return {
    comments: filteredCommenter ? filteredComments : memoizedComments,
    isLoading,
    error,
    addComment,
    updateComments,
  };
}
