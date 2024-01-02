import { Link } from "@chakra-ui/next-js"
import { Image, ImageProps } from "@chakra-ui/react"

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
    <Link href={linkUrl} p={3}>
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
    </Link>
  )
}
