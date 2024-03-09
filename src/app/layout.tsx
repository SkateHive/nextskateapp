import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"
import type { Metadata } from "next"
import { Inter } from "next/font/google"

import Favicon from "@/components/FaviconLinks"
import Navbar from "@/components/Navbar"
import { getWebsiteURL } from "@/lib/utils"
import { Flex } from "@chakra-ui/react"
import { Providers } from "./providers"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  metadataBase: new URL(getWebsiteURL()),
  title: "Skatehive App",
  description: "Digital hive for underground bees",
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
        <Favicon />
      </head>
      <body className={inter.className}>
        <Providers>
          <Navbar />
          <Flex px={[1, 3]} pt={0} overflow="visible">
            {children}
          </Flex>
          <SpeedInsights />
          <Analytics />
        </Providers>
      </body>
    </html>
  )
}
