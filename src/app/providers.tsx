"use client"

import { PostsProvider } from "@/contexts/PostsContext"
import { UserProvider } from "@/contexts/UserContext"
import { ChakraProvider, extendTheme } from "@chakra-ui/react"

const chakraTheme = extendTheme({
  styles: {
    global: {
      body: {
        bg: "black",
      },
    },
  },
})

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ChakraProvider theme={chakraTheme}>
      <UserProvider>
        <PostsProvider>{children}</PostsProvider>
      </UserProvider>
    </ChakraProvider>
  )
}
