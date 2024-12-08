"use client";

import { Box } from "@chakra-ui/react";
import MagColumn from "@/components/MagColumn";

const MagLayout = () => {
  return (
    <Box className="hide-on-mobile" maxW={"400px"} width={"100%"} height={'101vh'} overflow={'auto'} sx={{
      "&::-webkit-scrollbar": {
        display: "none",
      },
      "&::-webkit-scrollbar-thumb": {
        display: "none",
      }
    }} >
      <MagColumn />
    </Box>
  );
};

export default MagLayout;

