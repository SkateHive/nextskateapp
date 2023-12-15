"use client"
import React, { useState, FC, useEffect } from "react"
import { Image, Box, Skeleton, ImageProps, Link } from "@chakra-ui/react"
import post from "./post"

interface ImageWithPlaceholderProps extends ImageProps {
  src: string
  alt: string
  linkUrl: string
}

const ImageWithPlaceholder: FC<ImageWithPlaceholderProps> = ({
  src,
  alt,
  linkUrl,
  ...props
}) => {
  const [isLoading, setIsLoading] = useState(true)

  const handleLoad = () => {
    setIsLoading(false)
  }

  return (
    <>
      {isLoading && (
        <Box p={3}>
          <Skeleton aspectRatio={16 / 9} borderRadius="md" />
        </Box>
      )}
      <Box p={3} as={Link} href={linkUrl} cursor="pointer">
        <Image
          w="100%"
          src={src}
          aspectRatio={16 / 9}
          objectFit="cover"
          borderRadius="md"
          onLoad={handleLoad}
          style={{ display: isLoading ? "none" : "block" }}
          {...props}
          alt={alt}
        />
      </Box>
    </>
  )
}

export default ImageWithPlaceholder
