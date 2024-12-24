"use client";

import { Box } from "@chakra-ui/react";
import dynamic from "next/dynamic";
import "./layout.css";
const MagLayout = dynamic(() => import("./magLayout"), {
  ssr: false

});
const SkateCast = dynamic(() => import("./mainFeed/page"), {
  ssr: false

});
export default function Home() {
  return (
    <>
      <SkateCast />
      <Box className="desktop-layout">
        <MagLayout />
      </Box>
    </>
  );
}
