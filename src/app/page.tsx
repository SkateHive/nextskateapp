
import { Box } from "@chakra-ui/react";
import "./layout.css";
import MagLayout from "./magLayout";
import MainFeed from "./mainFeed/page";


export default function Home() {
  return (
    <>
      <MainFeed />
      <Box className="desktop-layout">
        <MagLayout />
      </Box>
    </>
  );
}
