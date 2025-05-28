import { useState, useMemo, useEffect, useCallback } from "react";
import { Discussion } from "@hiveio/dhive";
import { useToast } from "@chakra-ui/react";
import { 
  getSortedComments, 
  SortMethod, 
  getMainFeedConfig, 
  getSuccessToastConfig,
  handleInfiniteScroll
} from "@/utils/feedUtils";
import { useStableCallback } from "@/lib/performanceUtils";
import { handleAsyncError, formatErrorMessage } from "@/lib/errorUtils";

interface UseMainFeedProps {
  comments: Discussion[];
  isLoading: boolean;
  addComment: (comment: Discussion) => void;
}

export const useMainFeed = ({ comments, isLoading, addComment }: UseMainFeedProps) => {
  const [sortMethod, setSortMethod] = useState<SortMethod>("chronological");
  const [visiblePosts, setVisiblePosts] = useState<number>(getMainFeedConfig().initialVisiblePosts);
  const toast = useToast();

  const sortedComments = useMemo(() => 
    getSortedComments({ comments, sortMethod }), 
    [comments, sortMethod]
  );

  const handleCommentSubmit = useStableCallback(async (newComment: Discussion) => {
    const result = await handleAsyncError(
      async () => {
        addComment(newComment);
        toast(getSuccessToastConfig());
      },
      undefined,
      'handleCommentSubmit'
    );

    if (!result) {
      toast({
        title: "Error",
        description: "Failed to submit comment. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  });

  const handleSortChange = useCallback((method: SortMethod) => {
    setSortMethod(method);
  }, []);

  const loadMorePosts = useCallback(() => {
    setVisiblePosts(prev => prev + getMainFeedConfig().postsIncrement);
  }, []);

  useEffect(() => {
    const scrollDiv = document.getElementById("scrollableDiv");
    if (!scrollDiv) return;

    const cleanup = handleInfiniteScroll(
      scrollDiv, 
      loadMorePosts, 
      getMainFeedConfig().scrollThreshold
    );

    return cleanup;
  }, [loadMorePosts]);

  return {
    sortMethod,
    sortedComments,
    visiblePosts,
    handleCommentSubmit,
    handleSortChange,
    setVisiblePosts,
  };
};
