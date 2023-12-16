import { Box, Image, ImageProps } from "@chakra-ui/react"
import Link from "next/link"

interface PostImageProps extends ImageProps {
  src: string
  alt: string
  linkUrl: string
}

export default function PostImage({
  src,
  alt,
  linkUrl,
  ...props
}: PostImageProps) {
  return (
    <Link href={linkUrl} passHref>
      <Box p={3} cursor="pointer">
        <Image
          w="100%"
          src={src}
          aspectRatio={16 / 9}
          objectFit="cover"
          borderRadius="md"
          {...props}
          alt={alt}
        />
      </Box>
    </Link>
  )
}
