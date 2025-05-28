import React, { useEffect, useState } from "react";
import { Box, IconButton, SimpleGrid } from "@chakra-ui/react";
import { FaTimes } from "react-icons/fa";

interface MediaItem {
    url: string;
    type: "image" | "video";
    extension?: string;
}

interface MediaListComponentProps {
    mediaList: MediaItem[];
    setMediaList: React.Dispatch<React.SetStateAction<MediaItem[]>>;
}

const generateThumbnail = (videoUrl: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        const video = document.createElement("video");
        video.src = videoUrl;
        video.crossOrigin = "anonymous";
        video.addEventListener("loadeddata", () => {
            video.currentTime = 1; // Capture the frame at 1 second
        });
        video.addEventListener("seeked", () => {
            const canvas = document.createElement("canvas");
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const context = canvas.getContext("2d");
            if (context) {
                context.drawImage(video, 0, 0, canvas.width, canvas.height);
                const thumbnailUrl = canvas.toDataURL("image/png");
                resolve(thumbnailUrl);
            } else {
                reject("Failed to get canvas context");
            }
        });
        video.addEventListener("error", (e) => reject(e));
    });
};

const MediaItemComponent: React.FC<{ item: MediaItem; index: number; removeItem: (index: number) => void }> = ({ item, index, removeItem }) => {
    const [poster, setPoster] = useState<string | undefined>(undefined);

    useEffect(() => {
        if (item.extension === "mov") {
            generateThumbnail(item.url).then(setPoster).catch(console.error);
        }
    }, [item.url, item.extension]);

    return (
        <Box key={index} position="relative" w="100%" h="100%" borderRadius="md" overflow="hidden" bg="gray.900">
            {/* Remove Button */}
            <IconButton
                aria-label="Remove media"
                icon={<FaTimes size={12} color="white" />}
                size="xs"
                position="absolute"
                top={1}
                right={1}
                bg="blackAlpha.700"
                _hover={{ bg: "red.500" }}
                onClick={() => removeItem(index)}
                cursor={"pointer"}
                zIndex={666}
            />

            {/* Video or Image */}
            {item.type === "video" ? (
                <video
                    src={item.url}
                    controls
                    autoPlay
                    loop
                    muted
                    playsInline
                    poster={poster}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    onError={(e) => console.error("Error loading video:", item.url, e)}
                >
                    <source src={item.url} type={`video/${item.extension}`} />
                    Your browser does not support the video tag.
                </video>
            ) : (
                <img
                    src={item.url}
                    alt="Uploaded media"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    onError={(e) => console.error("Error loading image:", item.url, e)}
                />
            )}
        </Box>
    );
};

export const MediaListComponent: React.FC<MediaListComponentProps> = ({ mediaList, setMediaList }) => {
    const removeItem = (index: number) => {
        const newMediaList = mediaList.filter((_, i) => i !== index);
        setMediaList(newMediaList);
    };

    return (
        <>
            {mediaList.length === 1 ? (
                <Box w="100%" h="auto">
                    <MediaItemComponent item={mediaList[0]} index={0} removeItem={removeItem} />
                </Box>
            ) : (
                <SimpleGrid columns={[1, 2, 3]} spacing={2} mt={2}>
                    {mediaList.map((item, index) => (
                        <MediaItemComponent key={index} item={item} index={index} removeItem={removeItem} />
                    ))}
                </SimpleGrid>
            )}
        </>
    );
};
