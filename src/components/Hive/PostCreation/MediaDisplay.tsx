import { Box, Grid, HStack, IconButton, Image } from "@chakra-ui/react";
import React from "react";
import { FaTimes } from "react-icons/fa";

interface MediaDisplayProps {
  imageList: File[];
  handleRemoveImage: (index: number) => void;
}

function MediaDisplay({ imageList, handleRemoveImage }: MediaDisplayProps) {
  return (
    <Grid templateColumns="repeat(4, 1fr)" gap={4} width={"full"}>
      {imageList.map((item, index) => {
        const isImage = item.type.startsWith("image/");
        const isVideo = item.type.startsWith("video/");
        const url = URL.createObjectURL(item);

        return (
          <Box key={index} position="relative" aspectRatio={"1/1"}>
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
                w={"100%"}
                h={"100%"}
                objectFit="cover"
              />
            )}
            {isVideo && <video src={url} controls muted width="100%" />}
          </Box>
        );
      })}
    </Grid>
  );
}

export default MediaDisplay;
