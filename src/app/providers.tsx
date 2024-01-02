"use client"

import { PostProvider } from "@/contexts/PostsContext"
import { UserProvider } from "@/contexts/UserContext"
import { ChakraProvider } from "@chakra-ui/react"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ChakraProvider>
      <UserProvider>
        <PostProvider>{children}</PostProvider>
      </UserProvider>
    </ChakraProvider>
  )
}
