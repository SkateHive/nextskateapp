"use client"

import { usePostContext } from "@/contexts/PostContext"
import {
  LinkWithDomain,
  extractCustomLinks,
  extractIFrameLinks,
  extractLinksFromMarkdown,
} from "@/lib/markdown"
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
  const imageLinks = extractLinksFromMarkdown(post.body)

  const iframeLinks = extractIFrameLinks(post.body)
  const tSpeakLinks = extractCustomLinks(post.body)
  let videoLinks: LinkWithDomain[] = []

  if (["samuelvelizsk8", "mark0318"].includes(post.author)) {
    videoLinks = [...iframeLinks, ...tSpeakLinks]
  }

  const filteredImages = imageLinks.length
    ? imageLinks.filter(
      (image) =>
        ![SKATEHIVE_DISCORD_IMAGE, SKATEHIVE_LOGO].includes(image.url)
    )
    : [{ url: SKATEHIVE_LOGO }]

  return (
    <Carousel responsive={responsive}>
      {videoLinks.map((video, i) => {
        return (
          <iframe
            key={1}
            src={video.url}
            width={"100%"}
            height={"100%"}
            style={{ aspectRatio: "16/9" }}
          />
        )
      })}
      {filteredImages.map((image, i) => (
        <Image
          key={i}
          border={"1px solid white"}
          w="100%"
          src={image.url}
          aspectRatio={16 / 9}
          objectFit="cover"
          borderRadius="none"
          alt={post.title}
          loading="lazy"
        />
      ))}
    </Carousel>
  )
}

export default PostCarousel
