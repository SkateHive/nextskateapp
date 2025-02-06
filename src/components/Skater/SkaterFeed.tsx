import { Box, Grid, GridItem, Image, Skeleton, AspectRatio } from "@chakra-ui/react";
import { useComments } from "@/hooks/comments";
import { extractMediaItems, MediaItem } from "@/lib/utils";
import { HiveAccount } from "@/lib/useHiveAuth";
import { memo, useMemo, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";

interface SkaterFeedProps {
    user: HiveAccount;
}

const parent_author = process.env.NEXT_PUBLIC_MAINFEED_AUTHOR || "skatehacker";
const parent_permlink = process.env.NEXT_PUBLIC_MAINFEED_PERMLINK || "test-advance-mode-post";

function SkaterFeed({ user }: SkaterFeedProps) {
    const { comments, isLoading, error } = useComments(parent_author, parent_permlink, false, user.name);

    const mediaItems: MediaItem[] = useMemo(() => {
        return comments.flatMap(comment => extractMediaItems(comment.body))
            .filter(item =>
                (item.type === "image" || (item.type === "video" && item.url)) &&
                !item.url.includes("zora.co") && !item.url.includes("spotify.com")
            );
    }, [comments]);

    const reversedMediaItems = useMemo(() => [...mediaItems].reverse(), [mediaItems]);

    const itemsPerPage = 9;
    const [visibleCount, setVisibleCount] = useState(itemsPerPage);

    const loadMore = () => {
        setVisibleCount(prev => Math.min(prev + itemsPerPage, reversedMediaItems.length));
    };

    if (isLoading) {
        return (
            <Grid templateColumns="repeat(3, 1fr)" gap={2}>
                {Array.from({ length: itemsPerPage }).map((_, index) => (
                    <GridItem key={index}>
                        <AspectRatio ratio={1}>
                            <Skeleton w="100%" h="100%" />
                        </AspectRatio>
                    </GridItem>
                ))}
            </Grid>
        );
    }

    if (error) return <Box>Error: {error}</Box>;

    return (
        <InfiniteScroll
            dataLength={visibleCount}
            next={loadMore}
            hasMore={visibleCount < reversedMediaItems.length}
            loader={
                visibleCount < reversedMediaItems.length ? (
                    <Grid templateColumns="repeat(3, 1fr)" gap={2}>
                        {Array.from({ length: itemsPerPage }).map((_, index) => (
                            <GridItem key={index}>
                                <AspectRatio ratio={1}>
                                    <Skeleton w="100%" h="100%" />
                                </AspectRatio>
                            </GridItem>
                        ))}
                    </Grid>
                ) : null
            }
            scrollThreshold={0.9}
        >
            <Grid templateColumns="repeat(3, 1fr)" gap={2}>
                {reversedMediaItems.slice(0, visibleCount).map((item, index) => (
                    <GridItem key={index} overflow="hidden" bg="gray.800">
                        {item.type === "image" ? (
                            <Image
                                src={item.url}
                                alt={`media-${index}`}
                                objectFit="cover"
                                width="100%"
                                height="100%"
                                style={{ aspectRatio: "1/1" }}
                            />
                        ) : (
                            <video
                                controls
                                style={{
                                    objectFit: "cover",
                                    width: "100%",
                                    height: "100%",
                                    aspectRatio: "1/1",
                                }}
                            >
                                <source src={item.url} type="video/mp4" />
                            </video>
                        )}
                    </GridItem>
                ))}
            </Grid>
        </InfiniteScroll>
    );
}

export default memo(SkaterFeed);
