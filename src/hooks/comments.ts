import HiveClient from "@/lib/hive/hiveclient"
import { useCallback, useEffect, useState, useMemo } from "react"
import { Discussion } from "@hiveio/dhive"

export interface ActiveVote {
  percent: number
  reputation: number
  rshares: number
  time: string
  voter: string
  weight: number
}

// Enhanced cache with TTL (Time To Live) for better memory management
interface CacheEntry {
  data: Discussion[];
  timestamp: number;
  ttl: number; // in milliseconds
}

const commentsCache: { [key: string]: CacheEntry } = {};
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const MAX_CACHE_SIZE = 100; // Maximum number of cached entries

// Clean expired cache entries
const cleanExpiredCache = () => {
  const now = Date.now();
  const keys = Object.keys(commentsCache);
  
  // If cache is getting too large, remove oldest entries
  if (keys.length > MAX_CACHE_SIZE) {
    const sortedEntries = keys
      .map(key => ({ key, timestamp: commentsCache[key].timestamp }))
      .sort((a, b) => a.timestamp - b.timestamp);
    
    // Remove oldest 25% of entries
    const toRemove = Math.floor(keys.length * 0.25);
    for (let i = 0; i < toRemove; i++) {
      delete commentsCache[sortedEntries[i].key];
    }
  }
  
  // Remove expired entries
  Object.keys(commentsCache).forEach(key => {
    const entry = commentsCache[key];
    if (now - entry.timestamp > entry.ttl) {
      delete commentsCache[key];
    }
  });
};

export async function fetchComments(
  author: string,
  permlink: string,
  recursive: boolean = false,
  filteredCommenter?: string
): Promise<Discussion[]> {
  const cacheKey = `${author}-${permlink}-${recursive}-${filteredCommenter}`;
  
  // Clean expired cache entries periodically
  if (Math.random() < 0.1) { // 10% chance to clean cache
    cleanExpiredCache();
  }
  
  // Check cache with TTL
  const cached = commentsCache[cacheKey];
  if (cached && Date.now() - cached.timestamp < cached.ttl) {
    return cached.data;
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

    let finalComments: Discussion[];

    if (recursive) {
      const fetchReplies = async (comment: Discussion): Promise<Discussion> => {
        if (comment.children && comment.children > 0) {
          const replies = await fetchComments(comment.author, comment.permlink, true, filteredCommenter);
          comment.replies = replies.map(reply => reply.permlink);
        }
        return comment;
      };
      const commentsWithReplies = await Promise.all(comments.map(fetchReplies));
      finalComments = filteredCommenter
        ? commentsWithReplies.filter(comment => comment.author === filteredCommenter)
        : commentsWithReplies;
    } else {
      finalComments = filteredCommenter
        ? comments.filter(comment => comment.author === filteredCommenter)
        : comments;
    }

    // Cache with TTL
    commentsCache[cacheKey] = {
      data: finalComments,
      timestamp: Date.now(),
      ttl: CACHE_TTL
    };
    
    return finalComments;
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

  // Memoize the parameters to prevent unnecessary re-fetches
  const memoizedParams = useMemo(
    () => ({ author, permlink, recursive, filteredCommenter }),
    [author, permlink, recursive, filteredCommenter]
  );

  const fetchAndUpdateComments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedComments = await fetchComments(
        memoizedParams.author, 
        memoizedParams.permlink, 
        memoizedParams.recursive, 
        memoizedParams.filteredCommenter
      );
      setComments(fetchedComments);
    } catch (err: any) {
      setError(err.message ? err.message : "Error loading comments");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [memoizedParams]);

  useEffect(() => {
    fetchAndUpdateComments();
  }, [fetchAndUpdateComments]);

  // Memoize callbacks to prevent recreation on every render
  const addComment = useCallback((newComment: Discussion) => {
    // Optimistically add the new comment to the state
    setComments((existingComments) => {
      // Prevent duplicate comments
      const isDuplicate = existingComments.some(
        comment => comment.id === newComment.id || 
        (comment.author === newComment.author && comment.permlink === newComment.permlink)
      );
      
      if (isDuplicate) {
        return existingComments;
      }
      
      return [newComment, ...existingComments];
    });
  }, []);

  const updateComments = useCallback(async () => {
    await fetchAndUpdateComments();
  }, [fetchAndUpdateComments]);

  // Memoize the returned object to prevent unnecessary re-renders
  const returnValue = useMemo(() => ({
    comments,
    error,
    isLoading,
    addComment,
    updateComments,
  }), [comments, error, isLoading, addComment, updateComments]);

  return returnValue;
}
