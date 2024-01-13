"use client"

import { PostProvider } from "@/contexts/PostContext"
import { PostProps } from "@/lib/models/post"
import { UserProps } from "@/lib/models/user"
import { Card } from "@chakra-ui/react"
import Footer from "./Footer"
import Header from "./Header"
import PostImage from "./Image"

export interface PostComponentProps {
  postData: PostProps
  userData: UserProps
}

export default function Post({ postData, userData }: PostComponentProps) {
  return (
    <Card
      size="sm"
      boxShadow="none"
      borderRadius="lg"
      _hover={{
        outline: "1px solid",
        outlineColor: "gray.100",
      }}
      mt={2}
    >
      <PostProvider postData={postData} userData={userData}>
        <Header />
        <PostImage />
        <Footer />
      </PostProvider>
    </Card>
  )
}
