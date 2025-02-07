import { Box, Grid, GridItem, Image, Skeleton, AspectRatio, useDisclosure, useBreakpointValue } from "@chakra-ui/react";
import { useComments } from "@/hooks/comments";
import { extractMediaItems, extractSubtitle, MediaItem } from "@/lib/utils";
import { HiveAccount } from "@/lib/useHiveAuth";
import { memo, useMemo, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import MediaModal from "./MediaModal";

// Define extended media type with comment attached.
type ExtendedMediaItem = MediaItem & { comment: any }; // adjust type as needed

interface SkaterFeedProps {
    user: HiveAccount;
}

const parent_author = process.env.NEXT_PUBLIC_MAINFEED_AUTHOR || "skatehacker";
const parent_permlink = process.env.NEXT_PUBLIC_MAINFEED_PERMLINK || "test-advance-mode-post";

function SkaterFeed({ user }: SkaterFeedProps) {
    // Determine items per page based on viewport (15 for mobile, 9 for desktop)
    const defaultItemsPerPage = useBreakpointValue({ base: 15, md: 9 }) || 9;

    // Add states for tracking comment replies and count
    const [commentReplies, setCommentReplies] = useState<any[]>([]);
    const [numberOfComments, setNumberOfComments] = useState<number>(0);

    const { comments, isLoading, error } = useComments(parent_author, parent_permlink, false, user.name);

    // Updated mapping to attach the extracted subtitle:
    const extendedMediaItems: ExtendedMediaItem[] = useMemo(() => {
        return comments.flatMap(comment =>
            extractMediaItems(comment.body)
                .filter(item =>
                    (item.type === "image" || (item.type === "video" && item.url)) &&
                    !item.url.includes("zora.co") && !item.url.includes("spotify.com")
                )
                .map(item => ({ ...item, comment, subtitle: extractSubtitle(comment.body) }))
        );
    }, [comments]);

    const reversedMediaItems = useMemo(() => [...extendedMediaItems].reverse(), [extendedMediaItems]);

    const [visibleCount, setVisibleCount] = useState(defaultItemsPerPage);
    const [selectedItem, setSelectedItem] = useState<ExtendedMediaItem | null>(null);
    const { isOpen, onOpen, onClose } = useDisclosure();

    const handleNewComment = (newComment: any) => {
        setCommentReplies((prevComments) => [newComment, ...prevComments]);
        setNumberOfComments((prevCount: number) => prevCount + 1);
    };
    const loadMore = () => {
        setVisibleCount(prev => Math.min(prev + defaultItemsPerPage, reversedMediaItems.length));
    };

    const handleOpenModal = (item: ExtendedMediaItem) => {
        setSelectedItem(item);
        onOpen();
    };

    if (isLoading) {
        return (
            <Grid templateColumns="repeat(3, 1fr)" gap={2}>
                {Array.from({ length: defaultItemsPerPage }).map((_, index) => (
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
        <>
            <InfiniteScroll
                dataLength={visibleCount}
                next={loadMore}
                hasMore={visibleCount < reversedMediaItems.length}
                loader={
                    visibleCount < reversedMediaItems.length ? (
                        <Grid templateColumns="repeat(3, 1fr)" gap={1} mt={1}>
                            {Array.from({ length: defaultItemsPerPage }).map((_, index) => (
                                <GridItem key={index}>
                                    <AspectRatio ratio={1}>
                                        <Skeleton w="100%" h="100%" startColor='black' endColor='gray.800'
                                        />
                                    </AspectRatio>
                                </GridItem>
                            ))}
                        </Grid>
                    ) : null
                }
                scrollThreshold={0.9}
            >
                <Grid templateColumns="repeat(3, 1fr)" gap={1}>
                    {reversedMediaItems.slice(0, visibleCount).map((item, index) => (
                        <GridItem key={index} overflow="hidden" bg="gray.800" onClick={() => handleOpenModal(item)} cursor="pointer">
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
                                    autoPlay
                                    loop
                                    muted
                                    playsInline
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
            {selectedItem && (
                <MediaModal
                    media={selectedItem}
                    isOpen={isOpen}
                    onClose={onClose}
                    user={user}
                    onNewComment={handleNewComment} // Pass the new comment handler
                />
            )}
        </>
    );
}

export default memo(SkaterFeed);
