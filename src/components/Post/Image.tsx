import { usePostContext } from "@/contexts/PostContext"
import { Button, Image, useDisclosure, Link } from "@chakra-ui/react"
import PostModal from "../PostModal"

export default function PostImage() {
  const { isOpen, onOpen, onClose } = useDisclosure()
  let { post } = usePostContext()

  return (
    <Link onClick={onOpen} height={"auto"} m={2}>
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
      <PostModal isOpen={isOpen} onClose={onClose} />
    </Link>
  )
}
