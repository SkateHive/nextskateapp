// RootLayout.tsx
import Favicon from "@/components/FaviconLinks";
import SidebarDesktop from "@/components/Navbar/sidebarDesktop";
import MobileMenuButton from "@/components/mobileMenuButton";
import { getWebsiteURL } from "@/lib/utils";
import { Box, ColorModeScript, Flex } from "@chakra-ui/react";
import { Share_Tech_Mono } from "next/font/google";
import type { ReactNode } from "react";
import { Providers } from "./providers";

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
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json"></link>
        <Favicon />
        <style>
          {`
            @media (max-width: 768px) {
              .hide-on-mobile {
                display: none;
              }
              .mobile-menu-button {   
                z-index: 1000;
                position: fixed;
                left: 16px;
                bottom: 16px;
              }
            }
            @media (min-width: 769px) {
              #layout {
                gap: 30px;
              }
              .mobile-menu-button {
                display: none;
              }
            }
          `}
        </style>
      </head>
      <body className={share_tech_mono.className}>
        <ColorModeScript initialColorMode="dark" />
        <Providers>
          <Flex justifyContent={"center"} id="layout" height={"100vh"}>
            <Box className="hide-on-mobile">
              <SidebarDesktop />
            </Box>
            <div className="mobile-menu-button">
              <MobileMenuButton />
            </div>
            {children}
          </Flex>
        </Providers>
      </body>
    </html>
  );
}
