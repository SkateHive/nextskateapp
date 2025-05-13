import HiveClient from "@/lib/hive/hiveclient"
import { useCallback, useEffect, useState } from "react"
import { Discussion } from "@hiveio/dhive"



export interface ActiveVote {
  percent: number
  reputation: number
  rshares: number
  time: string
  voter: string
  weight: number
}

const commentsCache: { [key: string]: Discussion[] } = {};

export async function fetchComments(
  author: string,
  permlink: string,
  recursive: boolean = false,
  filteredCommenter?: string
): Promise<Discussion[]> {
  const cacheKey = `${author}-${permlink}-${recursive}-${filteredCommenter}`;
  if (commentsCache[cacheKey]) {
    return commentsCache[cacheKey];
  }

  try {
    let response = await HiveClient.database.call("get_content", [
      author,
      permlink,
    ]);

    // Retry logic if the comment is not yet available
    let retries = 3;
    while ((!response || response.id === 0) && retries > 0) {
      console.warn(
        `Comment not available on RPC. Retrying... (${3 - retries + 1})`
      );
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second
      response = await HiveClient.database.call("get_content", [
        author,
        permlink,
      ]);
      retries--;
    }

    if (!response || response.id === 0) {
      console.warn(
        `Post or comment with author "${author}" and permlink "${permlink}" does not exist on the RPC.`
      );
      return []; // Return an empty array if the post/comment does not exist
    }

    const comments = (await HiveClient.database.call("get_content_replies", [
      author,
      permlink,
    ])) as Discussion[];

    if (recursive) {
      const fetchReplies = async (comment: Discussion): Promise<Discussion> => {
        if (comment.children && comment.children > 0) {
          const replies = await fetchComments(comment.author, comment.permlink, true, filteredCommenter);
          comment.replies = replies.map(reply => reply.permlink);
        }
        return comment;
      };
      const commentsWithReplies = await Promise.all(comments.map(fetchReplies));
      const filteredComments = filteredCommenter
        ? commentsWithReplies.filter(comment => comment.author === filteredCommenter)
        : commentsWithReplies;
      commentsCache[cacheKey] = filteredComments;
      return filteredComments;
    } else {
      const filteredComments = filteredCommenter
        ? comments.filter(comment => comment.author === filteredCommenter)
        : comments;
      commentsCache[cacheKey] = filteredComments;
      return filteredComments;
    }
  } catch (error) {
    console.error("Failed to fetch comments:", error);
    return [];
  }
}

export function useComments(
  author: string,
  permlink: string,
  recursive: boolean = false,
  filteredCommenter?: string
) {
  const [comments, setComments] = useState<Discussion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAndUpdateComments = useCallback(async () => {
    setIsLoading(true);
    try {
      const fetchedComments = await fetchComments(author, permlink, recursive, filteredCommenter);
      setComments(fetchedComments);
      setIsLoading(false);
    } catch (err: any) {
      setError(err.message ? err.message : "Error loading comments");
      console.error(err);
      setIsLoading(false);
    }
  }, [author, permlink, recursive, filteredCommenter]);

  useEffect(() => {
    fetchAndUpdateComments();
  }, [fetchAndUpdateComments]);

  const addComment = useCallback((newComment: Discussion) => {
    // Optimistically add the new comment to the state
    setComments((existingComments) => [newComment, ...existingComments]);
  }, []);

  const updateComments = useCallback(async () => {
    await fetchAndUpdateComments();
  }, [fetchAndUpdateComments]);

  return {
    comments,
    error,
    isLoading,
    addComment,
    updateComments,
  };
}
