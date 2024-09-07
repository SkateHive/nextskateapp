import { MarkdownRenderers } from '@/app/upload/utils/MarkdownRenderers';
import { transformIPFSContent, transformNormalYoutubeLinksinIframes, transformShortYoutubeLinksinIframes } from '@/lib/utils';
import { Box } from '@chakra-ui/react';
import React, { useRef } from 'react';
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

const CarrouselRenderer: React.FC<ContentRendererProps> = ({ editedCommentBody }) => {
    const extractLinksFromMarkdown = (markdown: string) => {
        const regex = /!\[.*?\]\((.*?)\)/g;
        const links = [];
        let match;
        while ((match = regex.exec(markdown))) {
            links.push({ url: match[1] });
        }
        return links;
    };

    const extractIFrameLinks = (markdown: string) => {
        const regex = /<iframe src="(.*?)"/g;
        const links = [];
        let match;
        while ((match = regex.exec(markdown))) {
            links.push({ url: match[1] });
        }
        return links;
    };

    const extractLinksAndIFrameLinksFromMarkdown = (markdown: string) => {
        const imageLinks = extractLinksFromMarkdown(markdown);
        const iframeLinks = extractIFrameLinks(markdown);
        const uniqueImageUrls = new Set();
        const filteredImages = imageLinks.filter((image) => {
            if (!uniqueImageUrls.has(image.url)) {
                uniqueImageUrls.add(image.url);
                return true;
            }
            return false;
        });
        return { imageLinks, iframeLinks, filteredImages };
    }

    const { imageLinks, iframeLinks, filteredImages } = extractLinksAndIFrameLinksFromMarkdown(editedCommentBody);

    const carouselRef = useRef<any>(null);


    const markdownWithoutImages = editedCommentBody
        .replace(/!\[.*?\]\((.*?)\)/g, "")
        .replace(/<iframe src="(.*?)"/g, "")
        .replace(/allowfullscreen>/g, "");



    const handleImageClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (carouselRef.current) {
            carouselRef.current.next();
        }
    };

    const mediaItems = [
        ...iframeLinks.map((video) => ({ type: "video", url: video.url })),
        ...filteredImages.map((image) => ({ type: "image", url: image.url }))
    ];

    const responsive = {
        mobile: {
            breakpoint: { max: 4200, min: 0 },
            items: 1,
        },
    };

    return (
        <Box w={"100%"} color="white" id="flexxx">
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
                                transformShortYoutubeLinksinIframes(markdownWithoutImages)
                            )
                        )}
                    </ReactMarkdown>
                    {(filteredImages.length > 1 || iframeLinks.length > 1) && (
                        <Box w={'100%'}>
                            <CarouselContainer>
                                <Carousel
                                    ref={carouselRef}
                                    responsive={responsive}
                                    arrows
                                    customLeftArrow={<CustomLeftArrow onClick={() => carouselRef.current?.previous()} color='green' />}
                                    customRightArrow={<CustomRightArrow onClick={() => carouselRef.current?.next()} color='green' />}
                                    containerClass="carousel-container"
                                >
                                    {mediaItems.map((media, i) =>
                                        media.type === "video" ? (
                                            <Box
                                                key={i}
                                                display="flex"
                                                justifyContent="center"
                                                alignItems="center"
                                                style={{
                                                    height: "100%",
                                                    overflow: "hidden",
                                                    maxWidth: "100%",
                                                }}
                                            >
                                                <video
                                                    key={i}
                                                    src={media.url}
                                                    controls
                                                    style={{
                                                        width: "100%",
                                                        maxWidth: "100%",
                                                        aspectRatio: "16/9",
                                                        border: "0",
                                                        borderRadius: "8px",
                                                        overflow: "hidden",
                                                    }}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        handleImageClick(e);
                                                    }}
                                                />
                                            </Box>
                                        ) : (
                                            <Box
                                                key={i}
                                                display="flex"
                                                justifyContent="center"
                                                alignItems="center"
                                                style={{
                                                    height: "100%",
                                                    overflow: "hidden",
                                                    maxWidth: "100%",
                                                }}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    handleImageClick(e);
                                                }}
                                            >
                                                <img
                                                    src={media.url}
                                                    alt="Post media"
                                                    style={{
                                                        width: "100%",
                                                        maxWidth: "100%",
                                                        objectFit: "cover",
                                                        borderRadius: "8px",
                                                        maxHeight: '445px',
                                                        display: "block",
                                                        margin: "3px",
                                                        overflow: "hidden",
                                                    }}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        handleImageClick(e);
                                                    }}
                                                />
                                            </Box>
                                        )
                                    )}
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
