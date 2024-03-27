"use client"

import { PostProvider } from "@/contexts/PostContext"
import { PostProps } from "@/lib/models/post"
import { Card } from "@chakra-ui/react"
import Footer from "./Footer"
import Header from "./Header"
import PostImage from "./Image"
import { transform } from "next/dist/build/swc"

export interface PostComponentProps {
  postData: PostProps
}

export default function Post({ postData }: PostComponentProps) {
  return (
    <Card
      bgGradient="linear(to-br, grey, black, black)"
      border={"0px solid white  "}
      color={"white"}
      size="sm"
      boxShadow="none"
      borderRadius="lg"
      _hover={{
        transform: "scale(1.04)", // Added rotation here
      }}
      _active={{
        transform: "scale(1.02)",
        boxShadow: "0 0 100px limegreen", // Added glow effect here
      }}
      mt={2}
    >
      <PostProvider postData={postData}>
        <Header />
        <PostImage />
        <Footer />
      </PostProvider>
    </Card>
  )
}
