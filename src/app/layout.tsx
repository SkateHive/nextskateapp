import { SpeedInsights } from "@vercel/speed-insights/next"
import type { Metadata } from "next"
import { Inter } from "next/font/google"

import Favicon from "@/components/FaviconLinks"
import Navbar from "@/components/Navbar"
import { Container } from "@chakra-ui/react"
import { Providers } from "./providers"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "UnderHive",
  description: "A Underground space for bees",
  openGraph: {
    images: "/default_banner.png",
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
          <Container p={0} overflow="visible">
            <Navbar />
            {children}
            <SpeedInsights />
          </Container>
        </Providers>
      </body>
    </html>
  )
}
