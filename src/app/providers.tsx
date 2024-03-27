"use client"

import "@rainbow-me/rainbowkit/styles.css"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

import { PostsProvider } from "@/contexts/PostsContext"
import { UserProvider } from "@/contexts/UserContext"
import { ChakraProvider } from "@chakra-ui/react"

import {
  RainbowKitProvider,
  darkTheme,
  getDefaultConfig,
} from "@rainbow-me/rainbowkit"
import { http } from "viem"
import { WagmiProvider } from "wagmi"
import { base } from "wagmi/chains"

const config = getDefaultConfig({
  appName: "SkateHive",
  projectId: "52f3a9b032f5caf26719af6939715629",
  chains: [base],
  transports: {
    [base.id]: http(),
  },
})

const queryClient = new QueryClient()

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            ...darkTheme.accentColors.green,
            borderRadius: "small",
          })}
        >
          <ChakraProvider>
            <UserProvider>
              <PostsProvider>{children}</PostsProvider>
            </UserProvider>
          </ChakraProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
