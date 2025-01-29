import Favicon from "@/components/FaviconLinks";
import MobileNavbar from "@/components/Navbar/MobileNavbar";
import { getWebsiteURL } from "@/lib/utils";
import { Flex } from "@chakra-ui/react";
import dynamic from 'next/dynamic';
import { Share_Tech_Mono } from "next/font/google";
import type { ReactNode } from "react";
import { Providers } from "./providers";
import SidebarWrapper from "./SidebarWrapper";
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from "@vercel/speed-insights/next"

const share_tech_mono = Share_Tech_Mono({ subsets: ["latin"], weight: "400" });

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
  description: "The infinity skateboard maganize",
  manifest: "/manifest.json",
  openGraph: {
    images: `/ogimage.png`,
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
        {/* DNS Prefetch for domains */}
        <link rel="dns-prefetch" href="//vercel-scripts.com" />
        <link rel="dns-prefetch" href="//va.vercel-scripts.com" />

        {/* Preconnect to speed up TLS and handshake */}
        <link rel="preconnect" href="https://vercel-scripts.com" crossOrigin="" />
        <link rel="preconnect" href="https://va.vercel-scripts.com" crossOrigin="" />

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
            ::-webkit-scrollbar {
              display: none;
            }
            body {
              scrollbar-width: none; /* Firefox */
            }
          `}
        </style>
      </head>

      <body className={share_tech_mono.className}>
        <ColorModeScriptWrapper />
        <Providers>
          <Flex w={"100%"}
            justifyContent={"center"} id="layout">
            <div className="hide-on-mobile">
              <SidebarWrapper />
            </div>
            <div className="mobile-menu-button">
              <MobileNavbar />
            </div>
            {children}
          </Flex>
          <Analytics />
          <SpeedInsights />
        </Providers>
      </body>
    </html>
  );
}
