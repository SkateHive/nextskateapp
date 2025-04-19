import { Box, Center, Image } from "@chakra-ui/react";
import React, { useRef } from "react";
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

const CarrouselRenderer: React.FC<CarrouselRendererProps> = ({
  mediaItems,
  onImageClick,
  onCommentIconClick,
}) => {
  const carouselRef = useRef<any>(null);

  const responsive = {
    mobile: {
      breakpoint: { max: 4200, min: 0 },
      items: 1,
    },
  };

  const CustomDot: React.FC<{
    onGoToSlide: (index: number) => void;
    index: number;
    active: boolean;
  }> = ({ onGoToSlide, index, active }) => (
    <Box
      bg={active ? "green.200" : "black"}
      borderRadius="50%"
      height="8px"
      width="8px"
      onClick={() => onGoToSlide(index)}
      cursor="pointer"
      m={1}
    />
  );

  const renderMediaItem = (media: MediaItem, index: number) => (
    <Box
      key={media.url} // Use a stable, unique key
      cursor="pointer"
      width="100%"
    >
      {media.type === "video" ? (
        <VideoRenderer
          src={media.url}
          onCommentIconClick={onCommentIconClick}
        />
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
  );

  return (
    <>
      {mediaItems.length > 1 ? (
        <Box mt={4}>
          <Carousel
            ref={carouselRef}
            responsive={responsive}
            arrows
            customLeftArrow={
              <CustomLeftArrow onClick={() => carouselRef.current.previous()} />
            }
            customRightArrow={
              <CustomRightArrow onClick={() => carouselRef.current.next()} />
            }
            showDots
            ssr
            containerClass="carousel-container"
            customDot={
              <CustomDot
                onGoToSlide={(index: number) =>
                  carouselRef.current.goToSlide(index)
                }
                index={0}
                active={false}
              />
            }
          >
            {mediaItems.map(renderMediaItem)}
          </Carousel>
        </Box>
      ) : (
        <Box mt={4}>{mediaItems.map(renderMediaItem)}</Box>
      )}
    </>
  );
};

export default CarrouselRenderer;
