"use client";

import Feed from "@/components/Feed";
import { Box } from "@chakra-ui/react";

const FeedLayout = () => {
  return (
    <Box className="hide-on-mobile" maxW={"400px"} width={"100%"}>
      <Feed />
    </Box>
  );
};

export default FeedLayout;
