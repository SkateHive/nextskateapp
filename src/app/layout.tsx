import Favicon from "@/components/FaviconLinks";
import MobileNavbar from "@/components/Navbar/MobileNavbar";
import { Flex } from "@chakra-ui/react";
import dynamic from "next/dynamic";
import { Share_Tech_Mono } from "next/font/google";
import type { ReactNode } from "react";
import { Providers } from "./providers";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import SidebarDesktop from "@/components/Navbar/sidebarDesktop";
import "@/app/layout.css"; // Import the CSS file
import InitFrameSDK from "@/hooks/init-frame-sdk";
import { Metadata } from "next";

const share_tech_mono = Share_Tech_Mono({ subsets: ["latin"], weight: "400" });

const ColorModeScriptWrapper = dynamic(
  () => import("./ColorModeScriptWrapper"),
  { ssr: false }
);

const frameObject = {
  version: "next",
  imageUrl: `https://www.skatehive.app/opengraph-image`,
  button: {
    title: "Be brave",
    action: {
      type: "launch_frame", // Simplified action type
      name: "Skatehive",
      url: "https://www.skatehive.app",
    },
  },
  postUrl: "https://www.skatehive.app",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://legacy.skatehive.app"),
  title: "Skatehive App",
  description: "The infinity skateboard maganize",
  manifest: "/manifest.json",
  openGraph: {
    images: "/ogimage.png",
  },
  twitter: {
    card: "summary_large_image",
    title: "Skatehive App",
    description: "The infinity skateboard maganize",
    images: "/ogimage.png",
  },
  alternates: {
    canonical: "/", // This will be automatically resolved relative to metadataBase
  },
  other: {
    // Use compliant image URL
    "fc:frame": JSON.stringify(frameObject),
    "fc:frame:image": "https://www.skatehive.app/ogimage.png",
    "fc:frame:post_url": "https://www.skatehive.app",
  },
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <head>
        {/* Canonical tag for SEO */}
        <link
          rel="canonical"
          href={
            typeof window !== "undefined"
              ? `${process.env.NEXT_PUBLIC_WEBSITE_URL}${window.location.pathname}`
              : process.env.NEXT_PUBLIC_WEBSITE_URL || "https://legacy.skatehive.app"
          }
        />
        {/* DNS Prefetch for domains */}
        <link rel="dns-prefetch" href="//vercel-scripts.com" />
        <link rel="dns-prefetch" href="//va.vercel-scripts.com" />

        {/* Preconnect to speed up TLS and handshake */}
        <link
          rel="preconnect"
          href="https://vercel-scripts.com"
          crossOrigin=""
        />
        <link
          rel="preconnect"
          href="https://va.vercel-scripts.com"
          crossOrigin=""
        />

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
          <InitFrameSDK />
          <Flex
            w={"100%"}
            justifyContent={"center"}
            id="layout"
            className="mobile-layout-padding"
          >
            <div className="hide-on-mobile">
              <SidebarDesktop />
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
