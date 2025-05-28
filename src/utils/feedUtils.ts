import { Discussion } from "@hiveio/dhive";
import { getTotalPayout } from "@/lib/utils";
import { exceedsDownvoteThreshold } from "@/lib/voteUtils";
import { APP_CONFIG, getEnvConfig } from "@/lib/config";

export type SortMethod = "chronological" | "engagement" | "payout";

export interface SortedCommentsOptions {
  comments: Discussion[];
  sortMethod: SortMethod;
  downvoteThreshold?: number;
}

/**
 * Sorts and filters comments based on the specified method
 */
export const getSortedComments = ({
  comments,
  sortMethod,
  downvoteThreshold = APP_CONFIG.MAIN_FEED.DOWNVOTE_THRESHOLD,
}: SortedCommentsOptions): Discussion[] => {
  if (!comments?.length) return [];

  // Filter out comments that exceed downvote threshold
  const filteredComments = comments.filter(
    (comment) => !exceedsDownvoteThreshold(comment.active_votes, downvoteThreshold)
  );

  switch (sortMethod) {
    case "engagement":
      return filteredComments.sort(
        (a, b) => (b?.children ?? 0) - (a?.children ?? 0)
      );
    case "payout":
      return filteredComments.sort(
        (a, b) => getTotalPayout(b) - getTotalPayout(a)
      );
    case "chronological":
    default:
      return filteredComments.reverse();
  }
};

/**
 * Configuration for the main feed
 */
export const getMainFeedConfig = () => {
  const envConfig = getEnvConfig();
  
  return {
    parentAuthor: envConfig.MAINFEED_AUTHOR,
    parentPermlink: envConfig.MAINFEED_PERMLINK,
    initialVisiblePosts: APP_CONFIG.MAIN_FEED.INITIAL_VISIBLE_POSTS,
    postsIncrement: APP_CONFIG.MAIN_FEED.POSTS_INCREMENT,
    scrollThreshold: APP_CONFIG.MAIN_FEED.SCROLL_THRESHOLD,
  };
};

/**
 * Toast configuration for success messages
 */
export const getSuccessToastConfig = () => ({
  title: "Success",
  description: "Your post has been published!",
  status: "success" as const,
  duration: APP_CONFIG.ANIMATION.TOAST_DURATION,
  isClosable: true,
});

/**
 * Handles infinite scroll logic
 */
export const handleInfiniteScroll = (
  scrollElement: HTMLElement | null,
  callback: () => void,
  threshold: number = 100
): (() => void) => {
  const handleScroll = () => {
    if (
      scrollElement &&
      scrollElement.scrollTop + scrollElement.clientHeight >=
        scrollElement.scrollHeight - threshold
    ) {
      callback();
    }
  };

  scrollElement?.addEventListener("scroll", handleScroll);
  
  // Return cleanup function
  return () => scrollElement?.removeEventListener("scroll", handleScroll);
};
