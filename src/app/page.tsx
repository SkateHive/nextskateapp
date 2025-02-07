
import { Box } from "@chakra-ui/react";
import "./layout.css";
import SkateCast from "./mainFeed/page";
import MagLayout from "./magLayout";


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
