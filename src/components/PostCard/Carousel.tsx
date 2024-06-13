"use client"

import { usePostContext } from "@/contexts/PostContext"
import {
  LinkWithDomain,
  extractCustomLinks,
  extractIFrameLinks,
  extractLinksFromMarkdown,
} from "@/lib/markdown"
import { Box, Image } from "@chakra-ui/react"
import { useRef } from "react"
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
  const imageLinks = extractLinksFromMarkdown(post.body)
  const iframeLinks = extractIFrameLinks(post.body)
  const tSpeakLinks = extractCustomLinks(post.body)
  let videoLinks: LinkWithDomain[] = []

  if (["samuelvelizsk8", "mark0318"].includes(post.author)) {
    videoLinks = [...iframeLinks, ...tSpeakLinks]
  }

  const filteredImages = imageLinks.filter(
    (image) =>
      ![SKATEHIVE_DISCORD_IMAGE, SKATEHIVE_LOGO].includes(image.url)
  )

  // Add a placeholder image if filteredImages is empty
  if (filteredImages.length === 0) {
    filteredImages.push({ domain: 'skatehive.app', url: 'http://skatehive.app/skatehive_square_green.png' })
  }

  const carouselRef = useRef<any>(null);

  const handleImageClick = () => {
    if (carouselRef.current) {
      carouselRef.current.next();
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <Box m={2} height={"auto"}>
        <Carousel ref={carouselRef} responsive={responsive}>
          {videoLinks.map((video, i) => (
            <iframe
              key={i}
              src={video.url}
              width={"100%"}
              height={"100%"}
              style={{ aspectRatio: "16/9", border: "0" }}
            />
          ))}
          {filteredImages.map((image, i) => (
            <Image
              key={i}
              border={"0"}
              w="100%"
              src={image.url}
              aspectRatio={16 / 9}
              objectFit="cover"
              borderRadius="none"
              alt={post.title}
              loading="lazy"
              onClick={handleImageClick}
            />
          ))}
        </Carousel>
      </Box>
    </div>
  )
}

export default PostCarousel
