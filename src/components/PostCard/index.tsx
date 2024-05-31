"use client"

import { PostProvider } from "@/contexts/PostContext"
import { PostProps } from "@/lib/models/post"
import { Card } from "@chakra-ui/react"
import PostCarousel from "./Carousel"
import Footer from "./Footer"
import Header from "./Header"

export interface PostComponentProps {
  postData: PostProps
}

export default function Post({ postData }: PostComponentProps) {
  return (
    <Card
      bg={"black"}
      border={"0.6px solid limegreen"}
      size="sm"
      boxShadow="none"
      borderRadius="5px"
      p={2}
      m={2}
      _hover={{ boxShadow: "0 0 2px 5px limegreen" }}
    >
      <PostProvider postData={postData}>
        <Header />
        <PostCarousel />
        <Footer />
      </PostProvider>
    </Card>
  )
}
