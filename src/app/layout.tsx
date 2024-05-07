import type { Metadata } from "next"
import { Share_Tech_Mono } from "next/font/google"

import Favicon from "@/components/FaviconLinks"
import Feed from "@/components/Feed"
import Sidebar2 from "@/components/Navbar/sidebar2"
import { getWebsiteURL } from "@/lib/utils"
import { Box, ColorModeScript, Flex } from "@chakra-ui/react"
import { Providers } from "./providers"

const share_tech_mono = Share_Tech_Mono({ subsets: ["latin"], weight: "400" })

export const metadata: Metadata = {
  title: "Skatehive App",
  description: "The portal of web3 skateboarding",
  manifest: "/manifest.json",
  openGraph: {
    images: `${getWebsiteURL()}/default_banner.png`,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-br">
      <head>
        <link rel="manifest" href="/manifest.json"></link>
        <Favicon />
      </head>
      <body className={share_tech_mono.className}>
        <ColorModeScript initialColorMode="dark" />
        <Providers>
          {/* <Navbar /> */}
          <Flex id="layout" justify={"center"} height={"100vh"} gap="40px">
            {/* Sidebar on the left */}
            <Sidebar2 />
            {/* Main content area */}
            {children}
            <Box maxW={"400px"} width={"100%"}>
              <Feed/>
            </Box>
          </Flex>
        </Providers>
      </body>
    </html>
  )
}
