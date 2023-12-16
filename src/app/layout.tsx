import type { Metadata } from "next"
import { Inter } from "next/font/google"

import { Providers } from "./providers"
import { Container } from "@chakra-ui/react"
import Navbar from "@/components/navbar"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "UnderHive",
  description: "A Underground space for bees",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-br">
      <body className={inter.className}>
        <Providers>
          <Container p={0} overflow="visible">
            <Navbar />
            {children}
          </Container>
        </Providers>
      </body>
    </html>
  )
}
