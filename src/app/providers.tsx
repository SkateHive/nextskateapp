"use client"

import { PostsProvider } from "@/contexts/PostsContext"
import { UserProvider } from "@/contexts/UserContext"
import { ChakraProvider } from "@chakra-ui/react"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ChakraProvider>
      <UserProvider>
        <PostsProvider>{children}</PostsProvider>
      </UserProvider>
    </ChakraProvider>
  )
}
