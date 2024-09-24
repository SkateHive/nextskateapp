
"use client"

import { useEffect, useState } from "react";
import MagLayout from "./magLayout";
import SkateCast from "./mainFeed/page";
import { useMediaQuery } from "@chakra-ui/react";

export default function Home() {
  // Use the media query hook with SSR options
  const [isMobile] = useMediaQuery("(min-width: 700px)", {
    ssr: true,
    fallback: false, // Use fallback during SSR
  });

  const [isMounted, setIsMounted] = useState(false);

  // Ensure media queries are evaluated on the client side
  useEffect(() => {
    setIsMounted(true); // Set a flag when component is mounted on client
  }, []);

  return (
    <>
      <SkateCast />
      {isMounted && isMobile ? <MagLayout /> : <div style={{ maxWidth: "400px", width: "100%", height: "101vh" }} />}
    </>
  );
}
