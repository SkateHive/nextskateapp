"use client"

import { usePostContext } from "@/contexts/PostContext"
import { Image } from "@chakra-ui/react"
import Carousel from "react-multi-carousel"
import "react-multi-carousel/lib/styles.css"
import "./Post.css"

const SKATEHIVE_DISCORD_IMAGE =
  "https://ipfs.skatehive.app/ipfs/QmdTJSEE1286z1JqxKh8LtsuDjuKB1yRSBZy2AwEogzjVW?pinataGatewayToken=nxHSFa1jQsiF7IHeXWH-gXCY3LDLlZ7Run3aZXZc8DRCfQz4J4a94z9DmVftXyFE"

const SKATEHIVE_LOGO = "https://www.skatehive.app/assets/skatehive.jpeg"

const responsive = {
  mobile: {
    breakpoint: { max: 4200, min: 0 },
    items: 1,
  },
}

function PostCarousel() {
  let { post } = usePostContext()

  // lets make a regex to get markdown images from the post body 
  // and add them to the carousel
  const matchedImages = post.body.match(/!\[.*?\]\((.*?)\)/g)
  const filteredImages = matchedImages ? matchedImages.map((image) => {
    return image.replace(/!\[.*?\]\((.*?)\)/, "$1")
  }) : [SKATEHIVE_LOGO]

  // const filteredImages = post
  //   .metadata()
  //   .image.filter(
  //     (image) => ![post.getThumbnail(), SKATEHIVE_DISCORD_IMAGE].includes(image)
  //   )

  return (
    <Carousel responsive={responsive}>
      <Image
        border={"1px solid white"}
        w="100%"
        src={post.getThumbnail()}
        aspectRatio={16 / 9}
        objectFit="cover"
        borderRadius="none"
        alt={post.title}
        loading="lazy"
      />
      {filteredImages.map((image, i) => (
        <Image
          key={i}
          border={"1px solid white"}
          w="100%"
          src={image}
          aspectRatio={16 / 9}
          objectFit="cover"
          borderRadius="md"
          alt={post.title}
          loading="lazy"
        />
      ))}
    </Carousel>
  )
}

export default PostCarousel
