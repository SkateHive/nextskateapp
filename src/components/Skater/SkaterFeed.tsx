import {
  Box,
  Grid,
  GridItem,
  Skeleton,
  AspectRatio,
  useDisclosure,
  useBreakpointValue,
  Button,
} from "@chakra-ui/react";
import Image from "next/image";
import { useState, useMemo, useCallback } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { useOptimizedComments } from "@/hooks/useOptimizedComments";
import { extractMediaItemsCached, extractSubtitle, MediaItem } from "@/lib/utils";
import { HiveAccount } from "@/lib/useHiveAuth";
import { memo } from "react";
import MediaModal from "./MediaModal"; // direct import
import { LazyMediaItem } from "./LazyMediaItem";
import { Discussion } from "@hiveio/dhive";
import { PerformanceMonitor } from "./PerformanceMonitor";

// Define extended media type with comment attached.
type ExtendedMediaItem = MediaItem & { comment: Discussion };

interface SkaterFeedProps {
  user: HiveAccount;
}

// Constants
const PARENT_AUTHOR = process.env.NEXT_PUBLIC_MAINFEED_AUTHOR || "skatehacker";
const PARENT_PERMLINK =
  process.env.NEXT_PUBLIC_MAINFEED_PERMLINK || "test-advance-mode-post";

function SkaterFeed({ user }: SkaterFeedProps) {
  const defaultItemsPerPage = useBreakpointValue({ base: 15, md: 12 }) || 12;
  const [visibleCount, setVisibleCount] = useState(defaultItemsPerPage);

  const { comments, isLoading, error } = useOptimizedComments(
    PARENT_AUTHOR,
    PARENT_PERMLINK,
    false,
    user.name
  );

  // Memoize media extraction to prevent recalculating on every render
  const mediaItems: ExtendedMediaItem[] = useMemo(() => {
    if (!comments.length) return [];

    return comments
      .reduce<ExtendedMediaItem[]>((acc: ExtendedMediaItem[], comment: Discussion) => {
        try {
          const extractedItems = extractMediaItemsCached(comment.body);
          const filteredItems = extractedItems
            .filter(
              (item: MediaItem) =>
                (item.type === "image" || (item.type === "video" && item.url)) &&
                !item.url.includes("zora.co") &&
                !item.url.includes("spotify.com")
            )
            .map((item: MediaItem) => ({
              ...item,
              comment,
              subtitle: extractSubtitle(comment.body),
            }));
          
          return [...acc, ...filteredItems];
        } catch (error) {
          console.warn("Error extracting media from comment:", comment.permlink, error);
          return acc;
        }
      }, [])
      .sort(
        (a: ExtendedMediaItem, b: ExtendedMediaItem) =>
          new Date(b.comment.created).getTime() -
          new Date(a.comment.created).getTime()
      );
  }, [comments]);

  const loadMore = useCallback(() => {
    setVisibleCount((prev) =>
      Math.min(prev + defaultItemsPerPage, mediaItems.length)
    );
  }, [defaultItemsPerPage, mediaItems.length]);

  const forceLoadMore = useCallback(() => {
    // Use requestIdleCallback for better performance
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      window.requestIdleCallback(() => {
        setVisibleCount(mediaItems.length);
      });
    } else {
      // Fallback for browsers without requestIdleCallback
      setTimeout(() => {
        setVisibleCount(mediaItems.length);
      }, 0);
    }
  }, [mediaItems.length]);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedItem, setSelectedItem] = useState<ExtendedMediaItem | null>(
    null
  );

  const handleOpenModal = useCallback((item: ExtendedMediaItem) => {
    setSelectedItem(item);
    onOpen();
  }, [onOpen]);

  const handleNewComment = useCallback((newComment: any) => {
    console.log("New comment added:", newComment);
    // Additional logic for handling new comments can be added here
  }, []);

  if (isLoading) {
    return (
      <Grid templateColumns="repeat(3, 1fr)" gap={2}>
        {Array.from({ length: defaultItemsPerPage }).map((_, index) => (
          <GridItem key={`loading-skel-${index}`}>
            <AspectRatio ratio={1}>
              <Skeleton w="100%" h="100%" speed={1.2} />
            </AspectRatio>
          </GridItem>
        ))}
      </Grid>
    );
  }

  if (error) {
    return <Box>Error: {error}</Box>;
  }

  return (
    <Box>
      <PerformanceMonitor itemCount={visibleCount} />
      <InfiniteScroll
        dataLength={visibleCount}
        next={loadMore}
        hasMore={visibleCount < mediaItems.length}
        scrollThreshold={0.8}
        loader={
          <Grid templateColumns="repeat(3, 1fr)" gap={1} mt={1}>
            {Array.from({ length: Math.min(6, defaultItemsPerPage) }).map((_, i) => (
              <GridItem key={`inf-skel-${i}`}>
                <AspectRatio ratio={1}>
                  <Skeleton
                    w="100%"
                    h="100%"
                    startColor="gray.700"
                    endColor="gray.900"
                    speed={1.5}
                  />
                </AspectRatio>
              </GridItem>
            ))}
          </Grid>
        }        >
        <Grid templateColumns="repeat(3, 1fr)" gap={1}>
          {mediaItems.slice(0, visibleCount).map((item, idx) => (
            <LazyMediaItem
              key={`media-${item.comment.permlink}-${idx}`}
              item={item}
              idx={idx}
              onClick={() => handleOpenModal(item)}
            />
          ))}
        </Grid>
      </InfiniteScroll>

      {selectedItem && (
        <MediaModal
          media={selectedItem}
          isOpen={isOpen}
          onClose={onClose}
          user={user}
          onNewComment={handleNewComment}
          postDate={selectedItem.comment.created}
        />
      )}

      {visibleCount < mediaItems.length && (
        <Box textAlign="center" mt={4}>
          <Button onClick={forceLoadMore} colorScheme="teal">
            Force Load All ({mediaItems.length - visibleCount} remaining)
          </Button>
        </Box>
      )}
    </Box>
  );
}

export default memo(SkaterFeed);
