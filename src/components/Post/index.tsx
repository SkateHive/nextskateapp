"use client"

import { PostProvider } from "@/contexts/PostContext"
import { PostProps } from "@/lib/models/post"
import { Card } from "@chakra-ui/react"
import Footer from "./Footer"
import Header from "./Header"
import PostImage from "./Image"

export interface PostComponentProps {
  postData: PostProps
}

export default function Post({ postData }: PostComponentProps) {
  return (
    <Card
      bg={"black"}
      border={"0.6px solid white"}
      size="sm"
      boxShadow="none"
      borderRadius="none"
      _active={{
        transform: "scale(1.02)",
      }}
      p={2}
    >
      <PostProvider postData={postData}>
        <Header />
        <PostImage />
        <Footer />
      </PostProvider>
    </Card>
  )
}
