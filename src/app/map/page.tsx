// app/map/page.tsx
import dynamic from "next/dynamic";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Skate Map | Find and Share Skatespots Worldwide",
  description:
    "Discover and contribute to the Skatehive Skate Map – a collaborative tool to find, add, and share skate spots and parks near you.",
  keywords: [
    "skate map",
    "skate spot finder",
    "skateboarding map",
    "global skate spots",
    "skateparks",
    "street spots",
    "add skate spot",
  ],
  openGraph: {
    title: "Skate Map | Global Skatespot Finder",
    description:
      "Explore skateparks and street spots submitted by skaters worldwide.",
    url: "https://legacy.skatehive.app/map",
    images: [
      {
        url: "https://legacy.skatehive.app/og-map.png",
        width: 1200,
        height: 630,
        alt: "Skatehive Map Open Graph Image",
      },
    ],
    siteName: "Skatehive",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Skate Map | Global Skatespot Finder",
    description:
      "Explore skateparks and street spots submitted by skaters worldwide.",
    images: ["https://legacy.skatehive.app/og-map.png"],
  },
  alternates: {
    canonical: "https://legacy.skatehive.app/map",
  },
};

const EmbeddedMap = dynamic(() => import("./EmbeddedMap"), { ssr: false });

export default function MapPage() {
  return <EmbeddedMap />;
}
