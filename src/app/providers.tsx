"use client"

import { PostsProvider } from "@/contexts/PostsContext"
import { UserProvider } from "@/contexts/UserContext"
import { ChakraProvider, extendTheme } from "@chakra-ui/react"
import { ThirdwebProvider } from "thirdweb/react"

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
    <ThirdwebProvider>
      <ChakraProvider theme={chakraTheme}>
        <UserProvider>
          <PostsProvider>{children}</PostsProvider>
        </UserProvider>
      </ChakraProvider>
    </ThirdwebProvider>
  )
}
