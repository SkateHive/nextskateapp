// RootLayout.tsx
import type { ReactNode } from "react";
import { Share_Tech_Mono } from "next/font/google";
import Favicon from "@/components/FaviconLinks";
import Sidebar2 from "@/components/Navbar/sidebar2";
import { Box, ColorModeScript, Flex } from "@chakra-ui/react";
import { Providers } from "./providers";
import FeedLayout from "./feedLayout";
import { getWebsiteURL } from "@/lib/utils";

const share_tech_mono = Share_Tech_Mono({ subsets: ["latin"], weight: "400" });

export type Metadata = {
  title: string;
  description: string;
  manifest: string;
  openGraph: {
    images: string;
  };
};

export const metadata: Metadata = {
  title: "Skatehive App",
  description: "The portal of web3 skateboarding",
  manifest: "/manifest.json",
  openGraph: {
    images: `${getWebsiteURL()}/default_banner.png`,
  },
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({
  children,
}: RootLayoutProps) {
  return (
    <html lang="pt-br">
      <head>
        <link rel="manifest" href="/manifest.json"></link>
        <Favicon />
        <style>
          {`
            @media (max-width: 768px) {
              .hide-on-mobile {
                display: none;
              }
            }
          `}
        </style>
      </head>
      <body className={share_tech_mono.className}>
        <ColorModeScript initialColorMode="dark" />
        <Providers>
          <Flex justifyContent={"center"} id="layout" height={"100vh"} gap="40px">
            <Box className="hide-on-mobile">
              <Sidebar2 />
            </Box>
            {children}
            <FeedLayout />
          </Flex>
        </Providers>
      </body>
    </html>
  );
}
