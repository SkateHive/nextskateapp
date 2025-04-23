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
import { useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { useComments } from "@/hooks/comments";
import { extractMediaItems, extractSubtitle, MediaItem } from "@/lib/utils";
import { HiveAccount } from "@/lib/useHiveAuth";
import { memo } from "react";
import MediaModal from "./MediaModal"; // direct import

// Define extended media type with comment attached.
type ExtendedMediaItem = MediaItem & { comment: any };

interface SkaterFeedProps {
  user: HiveAccount;
}

// Constants
const PARENT_AUTHOR = process.env.NEXT_PUBLIC_MAINFEED_AUTHOR || "skatehacker";
const PARENT_PERMLINK =
  process.env.NEXT_PUBLIC_MAINFEED_PERMLINK || "test-advance-mode-post";

function SkaterFeed({ user }: SkaterFeedProps) {
  const defaultItemsPerPage = useBreakpointValue({ base: 15, md: 12 }) || 12; // Increase items per page for smoother scrolling
  const [visibleCount, setVisibleCount] = useState(defaultItemsPerPage);

  const { comments, isLoading, error } = useComments(
    PARENT_AUTHOR,
    PARENT_PERMLINK,
    false,
    user.name
  );

  // Extract media items from comments
  const mediaItems: ExtendedMediaItem[] = comments
    .flatMap((comment) =>
      extractMediaItems(comment.body)
        .filter(
          (item) =>
            (item.type === "image" || (item.type === "video" && item.url)) &&
            !item.url.includes("zora.co") &&
            !item.url.includes("spotify.com")
        )
        .map((item) => ({
          ...item,
          comment,
          subtitle: extractSubtitle(comment.body),
        }))
    )
    .sort(
      (a, b) =>
        new Date(b.comment.created).getTime() -
        new Date(a.comment.created).getTime()
    );

  const loadMore = () => {
    setVisibleCount((prev) =>
      Math.min(prev + defaultItemsPerPage, mediaItems.length)
    );
  };

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedItem, setSelectedItem] = useState<ExtendedMediaItem | null>(
    null
  );

  const handleOpenModal = (item: ExtendedMediaItem) => {
    setSelectedItem(item);
    onOpen();
  };

  const handleNewComment = (newComment: any) => {
    console.log("New comment added:", newComment);
    // Additional logic for handling new comments can be added here
  };

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
      <InfiniteScroll
        dataLength={visibleCount}
        next={loadMore}
        hasMore={visibleCount < mediaItems.length}
        scrollThreshold={0.6} // Lower threshold to trigger earlier
        loader={
          <Grid templateColumns="repeat(3, 1fr)" gap={1} mt={1}>
            {Array.from({ length: defaultItemsPerPage }).map((_, i) => (
              <GridItem key={`inf-skel-${i}`}>
                <AspectRatio ratio={1}>
                  <Skeleton
                    w="100%"
                    h="100%"
                    startColor="gray.700"
                    endColor="gray.900"
                    speed={1.2} // Faster skeleton animation
                  />
                </AspectRatio>
              </GridItem>
            ))}
          </Grid>
        }
      >
        <Grid templateColumns="repeat(3, 1fr)" gap={1}>
          {mediaItems.slice(0, visibleCount).map((item, idx) => (
            <GridItem
              key={`media-${item.comment.permlink}-${idx}`} // unique key per item
              overflow="hidden"
              bg="gray.800"
              onClick={() => handleOpenModal(item)}
              cursor="pointer"
            >
              {item.type === "image" ? (
                <AspectRatio ratio={1}>
                  <Image
                    src={item.url}
                    alt={`media-${idx}`}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    style={{ objectFit: "cover" }}
                  />
                </AspectRatio>
              ) : (
                <AspectRatio ratio={1}>
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    style={{
                      objectFit: "cover",
                      width: "100%",
                      height: "100%",
                    }}
                  >
                    <source src={item.url} type="video/mp4" />
                  </video>
                </AspectRatio>
              )}
            </GridItem>
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

      <Box textAlign="center" mt={4}>
        <Button onClick={loadMore} colorScheme="teal">
          Force Load
        </Button>
      </Box>
    </Box>
  );
}

export default memo(SkaterFeed);
