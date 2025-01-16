import { MarkdownRenderers } from '@/app/upload/utils/MarkdownRenderers';
import {
    autoEmbedZoraLink,
    transformIPFSContent,
    transformNormalYoutubeLinksinIframes,
    transformShortYoutubeLinksinIframes
} from '@/lib/utils';
import { Box, Image, Modal, ModalContent, ModalOverlay } from '@chakra-ui/react';
import React, { useMemo, useRef, useState } from 'react';
import { IoClose } from 'react-icons/io5';
import ReactMarkdown from 'react-markdown';
import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import CarouselContainer from '../components/CommentItem/CarouselContainer';
import CustomLeftArrow from '../components/CommentItem/CustomLeftArrow';
import CustomRightArrow from '../components/CommentItem/CustomRightArrow';
import VideoRenderer from '@/app/upload/utils/VideoRenderer';

interface CarrouselRendererProps {
    mediaItems: MediaItem[];
}

type MediaItem = {
    type: 'video' | 'image';
    url: string;
};

const CarrouselRenderer: React.FC<CarrouselRendererProps> = ({ mediaItems }) => {
    const carouselRef = useRef<any>(null);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);

    const responsive = {
        mobile: {
            breakpoint: { max: 4200, min: 0 },
            items: 1,
        },
    };

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
            onClick={() => handleMediaClick(media)}
            cursor="pointer"
            width="100%"
        >
            {media.type === 'video' ? (
                <VideoRenderer src={media.url} />
            ) : (
                <Image
                    src={media.url}
                    alt="Post media"
                    objectFit="cover"
                    loading="lazy"
                    width="100%"
                />
            )}
        </Box>
    );

    return (
        <>
            {mediaItems.length > 0 && (
                <Box mt={4}>
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

            {selectedMedia && selectedMedia.type === 'image' && (
                <Modal isOpen={isFullScreen} onClose={closeModal} size="full">
                    <ModalOverlay bg="rgba(10, 10, 10, 0.911)" />
                    <ModalContent
                        bg="transparent"
                        color="white"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        width="100vw"
                        height="100vh"
                        position="relative"
                    >
                        <Box position="relative" display="inline-block">
                            <Image
                                src={selectedMedia.url}
                                alt="Full screen media"
                                objectFit="contain"
                                loading="lazy"
                                maxH={'90vh'}
                            />

                            <Box
                                position="absolute"
                                top="10px"
                                right="10px"
                                cursor="pointer"
                                fontSize="24px"
                                fontWeight="bold"
                                color="white"
                                zIndex="1000"
                                bg="rgba(0, 0, 0, 0.7)"
                                borderRadius="50%"
                                width="40px"
                                height="40px"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                boxShadow="0 2px 5px rgba(0, 0, 0, 0.5)"
                                transition="transform 0.2s, background-color 0.2s"
                                _hover={{
                                    transform: 'scale(1.1)',
                                    backgroundColor: 'rgba(255, 0, 0, 0.8)',
                                }}
                                onClick={closeModal}
                            >
                                <IoClose size={24} color="white" />
                            </Box>
                        </Box>
                    </ModalContent>
                </Modal>
            )}
        </>
    );
};

export default CarrouselRenderer;
