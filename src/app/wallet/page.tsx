"use client"

import {
  Box,
  Stack,
} from "@chakra-ui/react";
import TotalValueBox from "./components/TotalWalletPage";



function Wallet() {
  return (
    <Stack
      direction={{ base: "column", md: "row" }}
      w={"100%"}
      align={"flex-start"}
    >
      
      <Box width={{ base: "100%", md: "50%" }}>
       <TotalValueBox />
      </Box>
    </Stack>
  )
}

export default Wallet;