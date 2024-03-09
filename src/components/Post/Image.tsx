import { usePostContext } from "@/contexts/PostContext"
import { Link } from "@chakra-ui/next-js"
import { Image } from "@chakra-ui/react"

export default function PostImage() {
  let { post } = usePostContext()
  return (
    <Link href={post.getFullUrl()} p={3}>
      <Image
        border={"1px solid limegreen"}
        w="100%"
        src={post.getThumbnail()}
        aspectRatio={16 / 9}
        objectFit="cover"
        borderRadius="md"
        alt={post.title}
        loading="lazy"
      />
    </Link>
  )
}
