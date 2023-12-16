"use client"
import { Box, Image, ImageProps, Skeleton } from "@chakra-ui/react"
import NextLink from "next/link"
import { useState } from "react"

interface ImageWithPlaceholderProps extends ImageProps {
  src: string
  alt: string
  linkUrl: string
}

const ImageWithPlaceholder: React.FC<ImageWithPlaceholderProps> = ({
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
      <Box p={3} as={NextLink} href={linkUrl} cursor="pointer">
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
