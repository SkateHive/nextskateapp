import React, { useRef, useEffect } from 'react';
import { Box } from '@chakra-ui/react';
import ReactMarkdown from 'react-markdown';
import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { MarkdownRenderers } from '@/app/upload/utils/MarkdownRenderers';
import { transformIPFSContent, transformNormalYoutubeLinksinIframes, transformShortYoutubeLinksinIframes } from '@/lib/utils';
import CarouselContainer from '../components/CommentItem/CarouselContainer';
import CustomLeftArrow from '../components/CommentItem/CustomLeftArrow';
import CustomRightArrow from '../components/CommentItem/CustomRightArrow';

interface ContentRendererProps {
    editedCommentBody: string;
}

const CarrouselRenderer: React.FC<ContentRendererProps> = ({ editedCommentBody }) => {

    const extractMarkdownLinks = (markdown: string, regex: RegExp) => {
        const links = [];
        let match;
        while ((match = regex.exec(markdown))) {
            links.push({ url: match[1] });
        }
        return links;
    };

    const extractLinksAndIFrames = (markdown: string) => {
        const imageLinks = extractMarkdownLinks(markdown, /!\[.*?\]\((.*?)\)/g);
        const iframeLinks = extractMarkdownLinks(markdown, /<iframe[^>]+src="([^"]+)"[^>]*>/g);
        const uniqueImageUrls = new Set();
        const filteredImages = imageLinks.filter((image) => {
            if (!uniqueImageUrls.has(image.url)) {
                uniqueImageUrls.add(image.url);
                return true;
            }
            return false;
        });

        return { filteredImages, iframeLinks };
    };

    const { filteredImages, iframeLinks } = extractLinksAndIFrames(editedCommentBody);



    const carouselRef = useRef<any>(null);

    const markdownWithoutMedia = editedCommentBody
        .replace(/!\[.*?\]\((.*?)\)/g, "")
        .replace(/<iframe src="(.*?)"/g, "")
        .replace(/allowfullscreen>/g, "")
        .replace(/.gif/g, "")
        .replace(/\)/g, " ");

    // Combine media items for the carousel
    const mediaItems = [
        ...iframeLinks.map((video) => ({ type: "video", url: video.url })),
        ...filteredImages.map((image) => ({ type: "image", url: image.url }))
    ];

    const handleCarouselNavigation = (direction: 'next' | 'prev') => {
        if (carouselRef.current) {
            direction === 'next' ? carouselRef.current.next() : carouselRef.current.previous();
        }
    };

    // Responsive settings for the carousel
    const responsive = {
        mobile: {
            breakpoint: { max: 4200, min: 0 },
            items: 1,
        },
    };

    // Render individual media items
    const renderMediaItem = (media: { type: string, url: string }, index: number) => {
        const commonStyle = {
            width: "100%",
            height: "100%",
            display: "block",
            borderRadius: "8px",
            maxHeight: '445px',
        };

        return (
            <Box
                key={index}
                display="flex"
                justifyContent="center"
                alignItems="center"
                style={{ height: "100%", overflow: "hidden", maxWidth: "100%" }}
            >
                {media.type === "video" ? (
                    <video
                        src={media.url}
                        controls
                        style={{ ...commonStyle, aspectRatio: "16/9" }}
                    />
                ) : (
                    <img
                        src={media.url}
                        alt="Post media"
                        style={{ ...commonStyle, objectFit: "cover" }}
                    />
                )}
            </Box>
        );
    };


    return (
        <Box w="100%" color="white">

            {/* Check if only one type of media exists and render accordingly */}
            {((filteredImages.length <= 1 && iframeLinks.length === 0) ||
                (iframeLinks.length <= 1 && filteredImages.length === 0)) ? (
                <ReactMarkdown
                    components={MarkdownRenderers}
                    rehypePlugins={[rehypeRaw]}
                    remarkPlugins={[remarkGfm]}
                >
                    {transformNormalYoutubeLinksinIframes(
                        transformIPFSContent(
                            transformShortYoutubeLinksinIframes(editedCommentBody)
                        )
                    )}
                </ReactMarkdown>
            ) : (
                <>
                    <ReactMarkdown
                        components={MarkdownRenderers}
                        rehypePlugins={[rehypeRaw]}
                        remarkPlugins={[remarkGfm]}
                    >
                        {transformNormalYoutubeLinksinIframes(
                            transformIPFSContent(
                                transformShortYoutubeLinksinIframes(markdownWithoutMedia)
                            )
                        )}
                    </ReactMarkdown>
                    {(filteredImages.length > 1 || iframeLinks.length > 1 || iframeLinks.length + filteredImages.length) && (
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
                                    {mediaItems.map((media, i) => renderMediaItem(media, i))}
                                </Carousel>
                            </CarouselContainer>
                        </Box>
                    )}
                </>
            )}
        </Box>
    );
};

export default CarrouselRenderer;
