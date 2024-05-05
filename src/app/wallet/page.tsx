"use client"

import {
  Stack,
  Box,
} from "@chakra-ui/react"
import EthBox from "./components/ethWallet"
import HiveBox from "./components/hiveWallet"


function Wallet() {
  return (
    <Stack
      direction={{ base: "column", md: "row" }}
      w={"100%"}
      align={"flex-start"}
    >
      <Box width={{ base: "100%", md: "50%" }}>
        <HiveBox />
      </Box>
      <Box width={{ base: "100%", md: "50%" }}>
        <EthBox />
      </Box>
    </Stack>
  )
}

export default Wallet;