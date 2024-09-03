import { Box, HStack, IconButton, Image } from "@chakra-ui/react";
import React from "react";
import { FaTimes } from "react-icons/fa";

interface MediaDisplayProps {
  imageList: File[];
  handleRemoveImage: (index: number) => void;
}

function MediaDisplay({ imageList, handleRemoveImage }: MediaDisplayProps) {
  return (
    <HStack>
      {imageList.map((item, index) => {
        const isImage = item.type.startsWith("image/");
        const isVideo = item.type.startsWith("video/");
        const url = URL.createObjectURL(item);

        return (
          <Box key={index} position="relative" maxW={100} maxH={100}>
            <IconButton
              aria-label="Remove image"
              icon={<FaTimes style={{ color: "black", strokeWidth: 1 }} />}
              size="base"
              color="white"
              bg="white"
              _hover={{ bg: "white", color: "black" }}
              _active={{ bg: "white", color: "black" }}
              position="absolute"
              top="0"
              right="0"
              onClick={() => handleRemoveImage(index)}
              zIndex="1"
              borderRadius="full"
            />
            {isImage && (
              <Image
                src={url}
                alt="uploaded-image"
                maxW="100%"
                maxH="100%"
                objectFit="contain"
              />
            )}
            {isVideo && <video src={url} controls muted width="100%" />}
          </Box>
        );
      })}
    </HStack>
  );
}

export default MediaDisplay;
