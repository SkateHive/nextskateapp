import { Box, Center, Image } from "@chakra-ui/react";
import React, { useRef, useMemo, useCallback, memo } from "react";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import CustomLeftArrow from "../components/CommentItem/CustomLeftArrow";
import CustomRightArrow from "../components/CommentItem/CustomRightArrow";
import VideoRenderer from "@/app/upload/utils/VideoRenderer";

interface CarrouselRendererProps {
  mediaItems: MediaItem[];
  onImageClick?: () => void;
  onCommentIconClick?: () => void;
}

type MediaItem = {
  type: "video" | "image";
  url: string;
};

const CarrouselRenderer: React.FC<CarrouselRendererProps> = memo(
  ({ mediaItems, onImageClick, onCommentIconClick }) => {
    const carouselRef = useRef<any>(null);

    // Memoize static configuration
    const responsive = useMemo(
      () => ({
        mobile: {
          breakpoint: { max: 4200, min: 0 },
          items: 1,
        },
      }),
      []
    );

    // Memoize carousel navigation handlers
    const handlePrevious = useCallback(() => {
      carouselRef.current?.previous();
    }, []);

    const handleNext = useCallback(() => {
      carouselRef.current?.next();
    }, []);

    const handleGoToSlide = useCallback((index: number) => {
      carouselRef.current?.goToSlide(index);
    }, []);

    // Memoized CustomDot component to prevent recreation
    const CustomDot = useCallback<
      React.FC<{
        onGoToSlide: (index: number) => void;
        index: number;
        active: boolean;
      }>
    >(
      ({ onGoToSlide, index, active }) => (
        <Box
          bg={active ? "green.200" : "black"}
          borderRadius="50%"
          height="8px"
          width="8px"
          onClick={() => onGoToSlide(index)}
          cursor="pointer"
          m={1}
        />
      ),
      []
    );

    // Memoized media renderer to prevent recreation
    const renderMediaItem = useCallback(
      (media: MediaItem, index: number) => (
        <Box key={media.url} cursor="pointer" width="100%">
          {media.type === "video" ? (
            <VideoRenderer src={media.url} />
          ) : (
            <Center>
              <Image
                src={media.url}
                alt="Post media"
                objectFit="cover"
                loading="lazy"
                width="100%"
              />
            </Center>
          )}
        </Box>
      ),
      []
    );

    // Memoize rendered items to prevent re-mapping on every render
    const renderedMediaItems = useMemo(
      () => mediaItems.map(renderMediaItem),
      [mediaItems, renderMediaItem]
    );

    return (
      <>
        {mediaItems.length > 1 ? (
          <Box mt={4}>
            <Carousel
              ref={carouselRef}
              responsive={responsive}
              arrows
              customLeftArrow={<CustomLeftArrow onClick={handlePrevious} />}
              customRightArrow={<CustomRightArrow onClick={handleNext} />}
              showDots
              ssr
              containerClass="carousel-container"
              customDot={
                <CustomDot
                  onGoToSlide={handleGoToSlide}
                  index={0}
                  active={false}
                />
              }
            >
              {renderedMediaItems}
            </Carousel>
          </Box>
        ) : (
          <Box mt={4}>{renderedMediaItems}</Box>
        )}
      </>
    );
  }
);

export default CarrouselRenderer;
