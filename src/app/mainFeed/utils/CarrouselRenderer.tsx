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

    const transformNormalYoutubeLinksinIframes = (markdown: string) => markdown;
    const transformIPFSContent = (markdown: string) => markdown;
    const transformShortYoutubeLinksinIframes = (markdown: string) => markdown;

    const iframeLinks = extractIFrameLinks(editedCommentBody);
    const imageLinks = extractLinksFromMarkdown(editedCommentBody);

    const uniqueImageUrls = new Set();
    const filteredImages = imageLinks.filter((image) => {
        if (!uniqueImageUrls.has(image.url)) {
            uniqueImageUrls.add(image.url);
            return true;
        }
        return false;
    });

    const markdownWithoutImages = editedCommentBody
    .replace(/!\[.*?\]\((.*?)\)/g, "")
    .replace(/<iframe src="(.*?)"/g, "")
    .replace(/allowfullscreen>/g, "");


    const carouselRef = useRef<any>(null);

    const handleImageClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (carouselRef.current) {
            carouselRef.current.next();
        }
    };

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
                                    {iframeLinks.map((video, i) => (
                                        <iframe
                                            key={i}
                                            src={video.url}
                                            width="100%"
                                            height="100%"
                                            style={{
                                                aspectRatio: "16/9",
                                                border: "0",
                                                maxWidth: "100%",
                                                overflow: "hidden",
                                            }}
                                        />
                                    ))}
                                    {filteredImages.map((image, i) => (
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
                                                src={image.url}
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

                                            />
                                        </Box>
                                    ))}
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
