import { MarkdownRenderers } from '@/app/upload/utils/MarkdownRenderers';
import { autoEmbedZoraLink, transformIPFSContent, transformNormalYoutubeLinksinIframes, transformShortYoutubeLinksinIframes } from '@/lib/utils';
import { PINATA_URL } from '@/utils/config';
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
    const videoRefs = useRef<Array<HTMLVideoElement | null>>([]);
    const [loadedMedia, setLoadedMedia] = useState<boolean[]>([]);

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
            .replace(/ipfs\.skatehive\.app/g, PINATA_URL)
            .replace(/\)/g, " ");
    }, [editedCommentBody]);

    const handleCarouselNavigation = (direction: 'next' | 'prev') => {
        if (carouselRef.current) {
            direction === 'next' ? carouselRef.current.next() : carouselRef.current.previous();
        }
    };

    const handleMediaClick = (media: MediaItem, index: number) => {
        if (media.type === 'image') {
            setSelectedMedia(media);
            setIsFullScreen(true);
        }

        if (media.type === 'video' && videoRefs.current[index]) {
            videoRefs.current[index]?.play();
        }
    };

    const closeModal = () => {
        if (selectedMedia?.type === 'video') {
            const index = mediaItems.findIndex((item) => item.url === selectedMedia.url);
            if (index !== -1 && videoRefs.current[index]) {
                videoRefs.current[index]!.pause();
                videoRefs.current[index]!.currentTime = 0;
            }
        }
        setIsFullScreen(false);
        setSelectedMedia(null);
    };

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (selectedMedia && selectedMedia.type === 'video') {
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

    // Lazy load handler to load images and videos when they're in the viewport or clicked
    const loadMediaOnVisibility = (index: number) => {
        const videoElement = videoRefs.current[index];
        const imgElement = document.getElementById(`image-${index}`) as HTMLImageElement; // Assert that it's an image element

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        if (videoElement && !videoElement.src) {
                            videoElement.src = videoElement.getAttribute("data-src") || ''; // Load video only when in view
                        }
                        if (imgElement && !imgElement.src) {
                            imgElement.src = imgElement.getAttribute("data-src") || ''; // Load image only when in view
                        }
                        setLoadedMedia(prevState => {
                            const newState = [...prevState];
                            newState[index] = true;
                            return newState;
                        });
                    }
                });
            },
            { threshold: 0.5 } // Trigger when 50% of the video is visible
        );

        if (videoElement) observer.observe(videoElement);
        if (imgElement) observer.observe(imgElement);
    };


    const renderMediaItem = (media: MediaItem, index: number) => (
        <Box
            key={index}
            display="flex"
            justifyContent="center"
            alignItems="center"
            height="100%"
            overflow="hidden"
            onClick={() => handleMediaClick(media, index)}
            cursor="pointer"
        >
            {media.type === 'video' ? (
                <video
                    ref={(el) => {
                        videoRefs.current[index] = el;
                        loadMediaOnVisibility(index); // Start observing when the video is in view
                    }}
                    src={media.url.replace("ipfs.skatehive.app", PINATA_URL)} // Store the URL to be loaded
                    controls
                    preload="none" // Video will load only when it's visible
                    style={{
                        width: "100%",
                        height: "100%",
                        borderRadius: "8px",
                        maxHeight: '445px',
                        aspectRatio: "16/9",
                        display: loadedMedia[index] ? 'block' : 'none', // Hide until loaded
                    }}
                />
            ) : (
                <Image
                    id={`image-${index}`}
                    src={media.url}
                    alt="Post media"
                    borderRadius="8px"
                    objectFit="cover"
                    maxHeight="445px"
                    loading="lazy" // Lazy load image
                    style={{ cursor: 'pointer' }}
                />
            )}
        </Box>
    );

    return (
        <>
            <Box w="100%" color="white">
                <ReactMarkdown components={MarkdownRenderers} rehypePlugins={[rehypeRaw]} remarkPlugins={[remarkGfm]}>
                    {autoEmbedZoraLink(transformNormalYoutubeLinksinIframes(transformIPFSContent(transformShortYoutubeLinksinIframes(markdownWithoutMedia))))}
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
                    <ModalOverlay onClick={handleOverlayClick} bg="rgba(0, 0, 0, 0.7)" />
                    <ModalContent
                        bg="transparent"
                        padding="0"
                        color="white"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        maxWidth="80vw"
                        maxHeight="80vh"
                        onClick={closeModal}
                        overflow="hidden"
                        position="relative">
                        {selectedMedia.type === 'video' ? (

                            <video
                                src={selectedMedia.url.replace("ipfs.skatehive.app", PINATA_URL)}
                                controls
                                style={{

                                    width: '100%',
                                    height: 'auto',
                                    maxHeight: '80vh',
                                    borderRadius: '8px',
                                    objectFit: 'contain'
                                }}
                                onClick={(e) => e.stopPropagation()}
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
