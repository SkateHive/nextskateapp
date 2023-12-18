"use client"

import { UserProvider } from "@/contexts/UserContext"
import { ChakraProvider } from "@chakra-ui/react"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ChakraProvider>
      <UserProvider>{children}</UserProvider>
    </ChakraProvider>
  )
}
