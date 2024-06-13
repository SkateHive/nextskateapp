'use client'
import { Box, IconButton, Text } from "@chakra-ui/react";
import { FaWindowClose } from "react-icons/fa";

interface VideoCardProps {
    videoPart: {
        name: string;
        filmmaker: string[];
        friends: string[];
        year: number;
        url: string;
    };
    onRemove: () => void;
}

const VideoCard = ({ videoPart, onRemove }: VideoCardProps) => {
    const getYoutubeEmbedUrl = (url: string) => {
        const regExp = /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
        const match = url.match(regExp);
        return match ? `https://www.youtube.com/embed/${match[1]}` : null;
    };

    const getZoraEmbedUrl = (url: string) => {
        const urlParts = url.split('?');
        if (urlParts.length === 2) {
            const baseUrl = urlParts[0];
            const queryParams = urlParts[1];
            const newUrl = baseUrl + '/embed?' + queryParams;
            return newUrl;
        } else {
            return url + '/embed';
        }
    };

    const getEmbedUrl = (url: string) => {
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            return getYoutubeEmbedUrl(url);
        } else if (url.includes('zora.co')) {
            return getZoraEmbedUrl(url);
        }
        return null;
    };

    const embedUrl = getEmbedUrl(videoPart.url);
    const isZora = embedUrl && embedUrl.includes('zora.co');

    return (
        <Box
            borderWidth="1px"
            borderRadius="lg"
            overflow="hidden"
            p={6}
            mb={4}
            boxShadow="md"
            width="100%"
            color={"white"}
            position="relative"
            _hover={{
                '& button': {
                    display: 'block'
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
                display="none"
                onClick={onRemove}
            />
            {embedUrl && (
                <Box mb={4} position="relative" width="100%" paddingTop={isZora ? 'calc(56.25% + 72px)' : '56.25%'}>
                    <iframe
                        src={embedUrl}
                        style={{
                            border: 0,
                            backgroundColor: 'transparent',
                            position: 'absolute',
                            inset: 0,
                            width: '100%',
                            height: '100%'
                        }}
                        allowFullScreen
                        sandbox="allow-pointer-lock allow-same-origin allow-scripts allow-popups"
                        title={videoPart.name}
                    ></iframe>
                </Box>
            )}
            <Text fontWeight="bold" fontSize="xl" mb={2}>{videoPart.name}</Text>
            <Text mb={1}>Filmmakers: {videoPart.filmmaker.join(", ")}</Text>
            <Text mb={1}>Friends: {videoPart.friends.join(", ")}</Text>
            <Text mb={1}>Year: {videoPart.year}</Text>
        </Box>
    );
}

export default VideoCard;
