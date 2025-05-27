import { GridItem, AspectRatio, Skeleton, Box } from "@chakra-ui/react";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";

interface LazyMediaItemProps {
  item: {
    type: "image" | "video";
    url: string;
    comment: any;
  };
  idx: number;
  onClick: () => void;
}

export const LazyMediaItem = ({ item, idx, onClick }: LazyMediaItemProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      {
        rootMargin: "100px", // Load 100px before entering viewport
        threshold: 0.1,
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  const handleImageError = () => {
    setHasError(true);
    setIsLoaded(true); // Stop showing loading state
  };

  return (
    <GridItem
      ref={ref}
      key={`media-${item.comment.permlink}-${idx}`}
      overflow="hidden"
      bg="gray.800"
      onClick={onClick}
      cursor="pointer"
    >
      <AspectRatio ratio={1}>
        {!isVisible ? (
          <Skeleton w="100%" h="100%" />
        ) : hasError ? (
          <Box 
            w="100%" 
            h="100%" 
            bg="gray.600" 
            display="flex" 
            alignItems="center" 
            justifyContent="center"
            color="gray.400"
            fontSize="sm"
          >
            Failed to load
          </Box>
        ) : item.type === "image" ? (
          <>
            {!isLoaded && <Skeleton w="100%" h="100%" />}
            <Image
              src={item.url}
              alt={`media-${idx}`}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              style={{ 
                objectFit: "cover",
                opacity: isLoaded ? 1 : 0,
                transition: "opacity 0.3s ease"
              }}
              loading="lazy"
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
              onLoad={() => setIsLoaded(true)}
              onError={handleImageError}
            />
          </>
        ) : (
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="none"
            style={{
              objectFit: "cover",
              width: "100%",
              height: "100%",
            }}
            onError={handleImageError}
          >
            <source src={item.url} type="video/mp4" />
          </video>
        )}
      </AspectRatio>
    </GridItem>
  );
};
