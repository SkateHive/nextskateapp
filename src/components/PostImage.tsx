import { Box, Image, ImageProps } from "@chakra-ui/react"
import { useRouter } from "next/navigation"

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
  const router = useRouter()
  return (
    <Box
      p={3}
      cursor="pointer"
      onClick={() => {
        router.push(linkUrl)
      }}
    >
      <Image
        border={"1px"}
        borderColor={"gray.50"}
        w="100%"
        src={src}
        aspectRatio={16 / 9}
        objectFit="cover"
        borderRadius="md"
        {...props}
        alt={alt}
        loading="lazy"
      />
    </Box>
  )
}
