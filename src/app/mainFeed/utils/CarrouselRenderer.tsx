import React, { useMemo, useRef, useState, useEffect } from 'react';
import { Box, Image, Modal, ModalContent, ModalOverlay } from '@chakra-ui/react';
import ReactMarkdown from 'react-markdown';
import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import {
    autoEmbedZoraLink,
    transformIPFSContent,
    transformNormalYoutubeLinksinIframes,
    transformShortYoutubeLinksinIframes
} from '@/lib/utils';
import { PINATA_URL } from '@/utils/config';
import CarouselContainer from '../components/CommentItem/CarouselContainer';
import CustomLeftArrow from '../components/CommentItem/CustomLeftArrow';
import CustomRightArrow from '../components/CommentItem/CustomRightArrow';

interface ContentRendererProps {
    editedCommentBody: string;
}

type MediaItem = {
    type: 'video' | 'image';
    url: string;
};

const CarrouselRenderer: React.FC<ContentRendererProps> = ({ editedCommentBody }) => {
    const carouselRef = useRef<any>(null);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
    const videoRefs = useRef<Array<HTMLVideoElement | null>>([]);
    const [loadedMedia, setLoadedMedia] = useState<boolean[]>([]);

    const responsive = {
        mobile: {
            breakpoint: { max: 4200, min: 0 },
            items: 1,
        },
    };

    const extractMediaItems = (markdown: string): MediaItem[] => {
        const imageRegex = /!\[.*?\]\((.*?)\)/g;
        const iframeRegex = /<iframe[^>]+src="([^"]+)"[^>]*>/g;
        const mediaItems: MediaItem[] = [];

        let match;
        while ((match = imageRegex.exec(markdown))) {
            mediaItems.push({ type: 'image', url: match[1] });
        }
        while ((match = iframeRegex.exec(markdown))) {
            mediaItems.push({ type: 'video', url: match[1] });
        }
        return mediaItems;
    };

    const mediaItems = useMemo(() => extractMediaItems(editedCommentBody), [editedCommentBody]);

    const markdownWithoutMedia = useMemo(() => {
        return editedCommentBody
            .replace(/!\[.*?\]\((.*?)\)/g, '')
            .replace(/<iframe[^>]*>/g, '')
            .replace(/allowFullScreen>/g, '')
            .replace(/allowFullScreen={true}>/g, '')
            .replace(/ipfs\.skatehive\.app/g, PINATA_URL);
    }, [editedCommentBody]);

    const handleMediaClick = (media: MediaItem) => {
        setSelectedMedia(media);
        setIsFullScreen(true);
    };

    const closeModal = () => {
        setIsFullScreen(false);
        setSelectedMedia(null);
    };

    const renderMediaItem = (media: MediaItem, index: number) => (
        <Box
            key={index}
            display="flex"
            justifyContent="center"
            alignItems="center"
            onClick={() => handleMediaClick(media)}
            cursor="pointer"
        >
            {media.type === 'video' ? (
                <video
                    ref={(el) => {
                        videoRefs.current[index] = el;
                    }}
                    src={media.url.replace('ipfs.skatehive.app', PINATA_URL)}
                    controls
                    style={{ width: '100%', borderRadius: '8px', maxHeight: '545px' }}
                />
            ) : (
                <Image
                    src={media.url.replace('ipfs.skatehive.app', PINATA_URL)}
                    alt="Post media"
                    borderRadius="8px"
                    objectFit="cover"
                    maxHeight="445px"
                    loading="lazy"
                />
            )}
        </Box>
    );

    return (
        <>
            <Box w="100%" color="white">
                <ReactMarkdown components={{}} rehypePlugins={[rehypeRaw]} remarkPlugins={[remarkGfm]}>
                    {autoEmbedZoraLink(
                        transformNormalYoutubeLinksinIframes(
                            transformIPFSContent(transformShortYoutubeLinksinIframes(markdownWithoutMedia))
                        )
                    )}
                </ReactMarkdown>
                {mediaItems.length > 0 && (
                    <Box w="100%">
                        <CarouselContainer>
                            <Carousel
                                ref={carouselRef}
                                responsive={responsive}
                                arrows
                                customLeftArrow={<CustomLeftArrow onClick={() => carouselRef.current.previous()} />}
                                customRightArrow={<CustomRightArrow onClick={() => carouselRef.current.next()} />}
                            >
                                {mediaItems.map(renderMediaItem)}
                            </Carousel>
                        </CarouselContainer>
                    </Box>
                )}
            </Box>

            {selectedMedia && (
                <Modal isOpen={isFullScreen} onClose={closeModal} size="full">
                    <ModalOverlay bg="rgba(0, 0, 0, 0.8)" />
                    <ModalContent
                        bg="transparent"
                        color="white"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        maxWidth="80vw"
                        maxHeight="80vh"
                    >
                        {selectedMedia.type === 'video' ? (
                            <video
                                src={selectedMedia.url.replace('ipfs.skatehive.app', PINATA_URL)}
                                controls
                                style={{ width: '100%', borderRadius: '8px', maxHeight: '80vh' }}
                            />
                        ) : (
                            <Image
                                src={selectedMedia.url}
                                alt="Full screen media"
                                borderRadius="8px"
                                objectFit="contain"
                                maxHeight="80vh"
                            />
                        )}
                    </ModalContent>
                </Modal>
            )}
        </>
    );
};

export default CarrouselRenderer;
