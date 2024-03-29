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
      // bgGradient="linear(to-br, limegreen, black,black, black, limegreen)"
      bg={"black"}
      border={"0.6px solid white"}
      // color={"white"}
      size="sm"
      boxShadow="none"
      borderRadius="none"
      // _hover={{
      //   transform: "scale(1.04)", // Added rotation here
      // }}
      _active={{
        transform: "scale(1.02)",
        boxShadow: "0 0 30px limegreen", // Added glow effect here
      }}
      p={2}
      // mt={2}
    >
      <PostProvider postData={postData}>
        <Header />
        <PostImage />
        <Footer />
      </PostProvider>
    </Card>
  )
}
