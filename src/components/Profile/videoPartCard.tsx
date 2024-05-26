'use client'
import { Box, Text, IconButton } from "@chakra-ui/react";
import { FaWindowClose } from "react-icons/fa";
import React from "react";

interface VideoCardProps {
    videoPart: {
        name: string;
        filmmaker: string[];
        friends: string[];
        year: number;
        url: string;
    };
    onRemove: () => void; // Callback for removal
}

const VideoCard = ({ videoPart, onRemove }: VideoCardProps) => {
    const getYoutubeEmbedUrl = (url: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|watch\?v=&|watch\?vi=|watch\?vi=&|v=|vi=)([^#&?]*).*/;
        const match = url.match(regExp);
        return match && match[2].length === 11 ? `https://www.youtube.com/embed/${match[2]}` : null;
    };

    const embedUrl = getYoutubeEmbedUrl(videoPart.url);

    return (
        <Box
            borderWidth="1px"
            borderRadius="lg"
            overflow="hidden"
            p={6} // Increased padding
            mb={4}
            boxShadow="md" // Added shadow
            width="100%" // Ensure it takes full width of the parent
            position="relative" // For positioning the close button
            _hover={{
                '& button': {
                    display: 'block' // Show button on hover
                }
            }}
        >
            <IconButton
                icon={<FaWindowClose />}
                aria-label="Remove video part"
                position="absolute"
                top={2}
                right={2}
                size="sm"
                display="none" // Hide by default
                onClick={onRemove}
            />
            {embedUrl && (
                <Box mb={4}>
                    <iframe
                        width="100%"
                        height="315"
                        src={embedUrl}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title={videoPart.name}
                    ></iframe>
                </Box>
            )}
            <Text fontWeight="bold" fontSize="xl" mb={2}>{videoPart.name}</Text> {/* Added bottom margin */}
            <Text mb={1}>Filmmakers: {videoPart.filmmaker.join(", ")}</Text>
            <Text mb={1}>Friends: {videoPart.friends.join(", ")}</Text>
            <Text mb={1}>Year: {videoPart.year}</Text>
        </Box>
    );
}

export default VideoCard;
