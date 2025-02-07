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
      size="sm"
      boxShadow="none"
      bg={"black"}
      borderRadius="5px"
      border={"1px solid #A5D6A7"}
      _hover={{
        boxShadow: "0 0 1px 1px #A5D6A7"
      }}
      p={0.5}
      m={1}
    >
      <PostProvider postData={postData}>
        <Header />
        <PostCarousel />
        <Footer />
      </PostProvider>
    </Card>
  )
}
