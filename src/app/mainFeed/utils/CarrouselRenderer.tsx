import { Box, Image, IconButton } from '@chakra-ui/react';
import React, { useRef } from 'react';
import { FaRegComment } from 'react-icons/fa';
import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';
import CarouselContainer from '../components/CommentItem/CarouselContainer';
import CustomLeftArrow from '../components/CommentItem/CustomLeftArrow';
import CustomRightArrow from '../components/CommentItem/CustomRightArrow';
import VideoRenderer from '@/app/upload/utils/VideoRenderer';

interface CarrouselRendererProps {
    mediaItems: MediaItem[];
    onImageClick?: () => void;
    onCommentIconClick?: () => void;
}

type MediaItem = {
    type: 'video' | 'image';
    url: string;
};

const CarrouselRenderer: React.FC<CarrouselRendererProps> = ({ mediaItems, onImageClick, onCommentIconClick }) => {
    const carouselRef = useRef<any>(null);

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
            cursor="pointer"
            width="100%"
            position="relative"
            onClick={media.type === 'image' ? onImageClick : undefined}
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
            <IconButton
                icon={<FaRegComment />}
                position="absolute"
                top="10px"
                right="10px"
                colorScheme="teal"
                aria-label="Toggle comments"
                onClick={(e) => {
                    e.stopPropagation();
                    if (onCommentIconClick) {
                        onCommentIconClick();
                    }
                }}
            />
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
        </>
    );
};

export default CarrouselRenderer;
