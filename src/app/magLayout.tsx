"use client";

import MagColumn from "@/components/Mag";
import { Box } from "@chakra-ui/react";

const MagLayout = () => {
  return (
    <Box className="hide-on-mobile" maxW={"400px"} width={"100%"}>
      <MagColumn />
    </Box>
  );
};

export default MagLayout;
