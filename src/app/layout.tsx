import type { Metadata } from "next";
import { Share_Tech_Mono } from "next/font/google";

import Favicon from "@/components/FaviconLinks";
import Navbar from "@/components/Navbar";
import Sidebar2 from "@/components/Navbar/sidebar2";
import { getWebsiteURL } from "@/lib/utils";
import { ColorModeScript, Flex, Box } from "@chakra-ui/react";
import { Providers } from "./providers";

const share_tech_mono = Share_Tech_Mono({ subsets: ["latin"], weight: "400" });

export const metadata: Metadata = {
  title: "Skatehive App",
  description: "The portal of web3 skateboarding",
  manifest: "/manifest.json",
  openGraph: {
    images: `${getWebsiteURL()}/default_banner.png`,
  },
};

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
          <Flex>
            {/* Sidebar on the left */}
            <Box>
              <Sidebar2 />
            </Box>
            {/* Main content area */}
            <Flex px={[1, 3]} pt={0} overflow="visible" color={"white"} flex="1">
              {children}
            </Flex>
          </Flex>
        </Providers>
      </body>
    </html>
  );
}
