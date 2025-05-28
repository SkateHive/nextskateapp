"use client"

import { usePostContext } from "@/contexts/PostContext"
import { Box, Image } from "@chakra-ui/react"
import { useRef } from "react"
import Carousel from "react-multi-carousel"
import "react-multi-carousel/lib/styles.css"
import "./Post.css"
import {
  extractCustomLinks,
  extractIFrameLinks,
  extractLinksFromMarkdown,
  extractYoutubeLinks, // added new import
  LinkWithDomain
} from "@/lib/utils"
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
  const { post } = usePostContext()
  const imageLinks = extractLinksFromMarkdown(post.body)
  const iframeLinks = extractIFrameLinks(post.body)
  const tSpeakLinks = extractCustomLinks(post.body)
  const youtubeLinks = extractYoutubeLinks(post.body)
  let videoLinks: LinkWithDomain[] = []
  videoLinks = [...iframeLinks, ...tSpeakLinks, ...youtubeLinks]

  const thumbnail: string | undefined = post.getThumbnail()
  const metadataImage: string[] | undefined = post.metadata()?.image

  // Build a single ordered array of image objects, avoiding duplicates
  const uniqueImageUrls = new Set<string>()
  const imagesToAdd: LinkWithDomain[] = []

  // Add thumbnail if valid and not already added
  if (typeof thumbnail === 'string' && thumbnail.startsWith('http') && !uniqueImageUrls.has(thumbnail)) {
    imagesToAdd.push({ domain: 'thumbnail', url: thumbnail })
    uniqueImageUrls.add(thumbnail)
  }

  // Add metadata image if valid and not already added
  if (Array.isArray(metadataImage) && metadataImage.length > 0 && metadataImage[0].startsWith('http') && !uniqueImageUrls.has(metadataImage[0])) {
    imagesToAdd.push({ domain: 'metadata', url: metadataImage[0] })
    uniqueImageUrls.add(metadataImage[0])
  }

  // Add markdown images, skipping duplicates and unwanted images
  imageLinks.forEach((image) => {
    if (
      ![SKATEHIVE_DISCORD_IMAGE, SKATEHIVE_LOGO].includes(image.url) &&
      !uniqueImageUrls.has(image.url)
    ) {
      imagesToAdd.push(image)
      uniqueImageUrls.add(image.url)
    }
  })

  // Add a placeholder image if no images or videos
  if (imagesToAdd.length === 0 && videoLinks.length === 0) {
    imagesToAdd.push({
      domain: 'skatehive.app',
      url: 'https://ipfs.skatehive.app/ipfs/QmWgkeX38hgWNh7cj2mTvk8ckgGK3HSB5VeNn2yn9BEnt7?pinataGatewayToken=nxHSFa1jQsiF7IHeXWH-gXCY3LDLlZ7Run3aZXZc8DRCfQz4J4a94z9DmVftXyFE',
    })
  }

  // Order images: gifs first, then static images
  const gifImages = imagesToAdd.filter(image =>
    image.url.toLowerCase().endsWith('.gif')
  );
  const staticImages = imagesToAdd.filter(image =>
    !image.url.toLowerCase().endsWith('.gif')
  );


  const carouselRef = useRef<any>(null)

  const handleImageClick = () => {
    if (carouselRef.current) {
      carouselRef.current.next()
    }
  }
  return (
    <div style={{ justifyContent: "center" }}>
      <Box m={2} height={"auto"}>
        <Carousel ref={carouselRef} responsive={responsive}>
          {gifImages.map((image, i) => (
            <Image
              key={`gif-${i}`}
              border={"0"}
              w={"100%"}
              h={"100%"}
              src={image.url}
              aspectRatio={16 / 9}
              objectFit="cover"
              borderRadius="none"
              alt={post.title}
              loading="lazy"
              onClick={handleImageClick}
            />
          ))}
          {staticImages.map((image, i) => (
            <Image
              key={`img-${i}`}
              border={"0"}
              w={"100%"}
              h={"100%"}
              src={image.url}
              aspectRatio={16 / 9}
              objectFit="cover"
              borderRadius="none"
              alt={post.title}
              loading="lazy"
              onClick={handleImageClick}
            />
          ))}
          {videoLinks.map((video, i) => {
            // If the video URL is from ipfs.skatehive and has a video file extension, use VideoRenderer.
            if (
              video.url.includes("ipfs.skatehive.app")
            ) {
              return (
                <video
                  key={i}
                  src={video.url}
                  width="100%"
                  height="100%"
                  style={{ aspectRatio: "16/9", objectFit: "cover" }}
                  muted
                  controls={false}
                />
              );
            }
            return (
              <iframe
                key={i}
                src={video.url}
                width={"100%"}
                height={"100%"}
                style={{ aspectRatio: "16/9" }}
              />
            );
          })}
        </Carousel>
      </Box>
    </div>
  )
}

export default PostCarousel
