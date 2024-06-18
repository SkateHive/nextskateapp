// src/app/RootLayout.tsx

import Favicon from "@/components/FaviconLinks";
import MobileNavbar from "@/components/Navbar/MobileNavbar";
import SidebarDesktop from "@/components/Navbar/sidebarDesktop";
import { getWebsiteURL } from "@/lib/utils";
import { Flex } from "@chakra-ui/react"; // Remove ColorModeScript import from here
import dynamic from 'next/dynamic';
import { Share_Tech_Mono } from "next/font/google";
import type { ReactNode } from "react";
import { Providers } from "./providers";

const share_tech_mono = Share_Tech_Mono({ subsets: ["latin"], weight: "400" });

// Dynamically import ColorModeScriptWrapper
const ColorModeScriptWrapper = dynamic(() => import('./ColorModeScriptWrapper'), { ssr: false });

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
        <meta name="theme-color" content="#000000" />
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
                left: 0px;
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
        {/* Dynamically load ColorModeScriptWrapper */}
        <ColorModeScriptWrapper />
        <Providers>
          <Flex justifyContent={"center"} id="layout"

          >
            <div className="hide-on-mobile">
              <SidebarDesktop />
            </div>
            <div className="mobile-menu-button">
              <MobileNavbar />
            </div>
            {children}
          </Flex>
        </Providers>
      </body>
    </html>
  );
}
