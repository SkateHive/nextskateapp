import { usePostContext } from "@/contexts/PostContext"
import { Box, useDisclosure } from "@chakra-ui/react"
import PostCarousel from "./Carousel"

export default function PostImage() {
  const { isOpen, onOpen, onClose } = useDisclosure()
  let { post } = usePostContext()

  return (
    // <Link m={2} onClick={onOpen} height={"auto"}>
    //   <Image
    //     border={"2px solid grey"}
    //     w="100%"
    //     src={post.getThumbnail()}
    //     aspectRatio={4 / 3}
    //     objectFit="cover"
    //     borderRadius="md"
    //     alt={post.title}
    //     loading="lazy"
    //   />
    //   <PostModal isOpen={isOpen} onClose={onClose} />
    // </Link>
    <Box m={2} height={"auto"}>
      <PostCarousel />
    </Box>
  )
}
