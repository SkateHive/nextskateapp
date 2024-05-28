"use client"

import { usePostContext } from "@/contexts/PostContext"
import {
  LinkWithDomain,
  extractCustomLinks,
  extractIFrameLinks,
  extractLinksFromMarkdown,
} from "@/lib/markdown"
import { Image } from "@chakra-ui/react"
import { useState } from "react"
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
  const [hover, setHover] = useState(false); // State to manage hover

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
    <div style={{ position: 'relative' }}
    // onMouseEnter={() => setHover(true)}
    // onMouseLeave={() => setHover(false)}
    >
      <Carousel responsive={responsive}>
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
          />
        ))}
      </Carousel>
      {/* <div style={{
        backgroundImage: 'url("https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT5x7Nk1Rjy1lTjF_ZMyOv0AzPef98WQKgR1Dy0szzpQA&s")',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        opacity: 0.2,
      }} />
      {!hover && (
        <div>
          <div style={{
            backgroundColor: 'rgba(0, 128, 0, 0.3)',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backdropFilter: 'grayscale(0.5) brightness(0.8) contrast(2) sepia(0.1)',
          }} />

          <div style={{
            backgroundImage: 'url("https://global.discourse-cdn.com/business7/uploads/notch/original/2X/0/005e870f89c55433413ac324ce978c372c3739a1.gif")',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.1,
          }} />
        </div>
      )} */}
    </div>
  )

}

export default PostCarousel
