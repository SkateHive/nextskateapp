import { MarkdownRenderers } from '@/app/upload/utils/MarkdownRenderers';
import { transformIPFSContent, transformNormalYoutubeLinksinIframes, transformShortYoutubeLinksinIframes } from '@/lib/utils';
import { Box, Image, Modal, ModalContent, ModalOverlay } from '@chakra-ui/react';
import React, { useMemo, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
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
    const videoRef = useRef<HTMLVideoElement | null>(null);

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
            .replace(/!\[.*?\]\((.*?)\)/g, "")
            .replace(/<iframe[^>]*>/g, "")
            .replace(/allowfullscreen>/g, "")
            .replace(/.gif/g, "")
            .replace(/\)/g, " ");
    }, [editedCommentBody]);

    const handleCarouselNavigation = (direction: 'next' | 'prev') => {
        if (carouselRef.current) {
            direction === 'next' ? carouselRef.current.next() : carouselRef.current.previous();
        }
    };

    const handleMediaClick = (media: MediaItem) => {
        setSelectedMedia(media);
        setIsFullScreen(true);
    };

    const closeModal = () => {
        setIsFullScreen(false);
        setSelectedMedia(null);
    };

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (selectedMedia && selectedMedia.type === 'video' && videoRef.current && videoRef.current.contains(e.target as Node)) {
            return;
        }
        closeModal();
    };

    const responsive = {
        mobile: {
            breakpoint: { max: 4200, min: 0 },
            items: 1,
        },
    };

    const renderMediaItem = (media: MediaItem, index: number) => (
        <Box
            key={index}
            display="flex"
            justifyContent="center"
            alignItems="center"
            height="100%"
            overflow="hidden"
            onClick={() => handleMediaClick(media)}
            cursor="pointer"
        >
            {media.type === 'video' ? (
                <video
                    src={media.url}
                    controls
                    style={{ width: "100%", height: "100%", borderRadius: "8px", maxHeight: '445px', aspectRatio: "16/9" }}
                />
            ) : (
                <Image
                    src={media.url}
                    alt="Post media"
                    borderRadius="8px"
                    objectFit="cover"
                    maxHeight="445px"
                    style={{ cursor: 'pointer' }}
                />
            )}
        </Box>
    );

    return (
        <>
            <Box w="100%" color="white">
                <ReactMarkdown components={MarkdownRenderers} rehypePlugins={[rehypeRaw]} remarkPlugins={[remarkGfm]}>
                    {transformNormalYoutubeLinksinIframes(transformIPFSContent(transformShortYoutubeLinksinIframes(markdownWithoutMedia)))}
                </ReactMarkdown>

                {mediaItems.length > 0 && (
                    <Box w="100%">
                        <CarouselContainer>
                            <Carousel
                                ref={carouselRef}
                                responsive={responsive}
                                arrows
                                customLeftArrow={<CustomLeftArrow onClick={() => handleCarouselNavigation('prev')} color='green' />}
                                customRightArrow={<CustomRightArrow onClick={() => handleCarouselNavigation('next')} color='green' />}
                                containerClass="carousel-container"
                            >
                                {mediaItems.map(renderMediaItem)}
                            </Carousel>
                        </CarouselContainer>
                    </Box>
                )}
            </Box>

            {selectedMedia && (
                <Modal isOpen={isFullScreen} onClose={closeModal} size="full">
                    <ModalOverlay onClick={handleOverlayClick} />
                    <ModalContent
                        bg="transparent"
                        padding="0"
                        color="white"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        maxWidth="80vw"
                        maxHeight="80vh"

                        overflow="hidden"
                        position="relative">


                        {selectedMedia.type === 'video' ? (

                            <video
                                ref={videoRef}
                                src={selectedMedia.url}
                                controls
                                style={{

                                    width: '100%',
                                    height: 'auto',
                                    maxHeight: '80vh',
                                    borderRadius: '8px',
                                    objectFit: 'contain'
                                }}
                            />
                        ) : (
                            <Image
                                src={selectedMedia.url}
                                alt="Full screen media"
                                style={{
                                    width: '100%',
                                    height: 'auto',
                                    maxHeight: '80vh',
                                    borderRadius: '8px',
                                    objectFit: 'contain'
                                }}
                            />
                        )}
                    </ModalContent>
                </Modal>
            )}
        </>
    );
};

export default CarrouselRenderer;
