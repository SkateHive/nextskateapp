"use client"

import { useHiveUser } from "@/contexts/UserContext";
import {
  Box,
  Flex,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs
} from "@chakra-ui/react";
import TotalValueBox from "./components/TotalWalletPage";
function Wallet() {
  const user = useHiveUser();
  const username = user?.hiveUser?.name;

  return (
    <Box w="100%" p={4}>
      <Tabs variant={'soft-enclosed'}>
        <TabList color={"white"} justifyContent={"center"}>
          <Tab _selected={{ bg: 'limegreen' }}>Wallet</Tab>
          <Tab _selected={{ bg: 'limegreen' }}>Trade Tokens</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <TotalValueBox />
          </TabPanel>
          <TabPanel>
            <Flex direction={{ base: "column", md: "row" }}>

              <Box w={'100%'} >

                <iframe
                  id="swapWidgetkeychain"
                  title="Swap Tokens with Keychain"
                  src={`https://swapwidget.hive-keychain.com/?username=${username}&to=WEED&partnerUsername=steemskate&partnerFee=0.5&from=HIVE`}
                  allow="clipboard-write"
                  width="100%"
                  height="600px"
                />
              </Box>
              <Box w={'100%'}>
                <iframe
                  id="simpleswap-frame"
                  name="SimpleSwap Widget"
                  width="100%"
                  height="600px"
                  src="https://simpleswap.io/widget/df29d743-6c03-4c7e-a745-4a0bfd19c656" ></iframe>
              </Box>
            </Flex>

          </TabPanel>
        </TabPanels>
      </Tabs >
    </Box>
  );
}

export default Wallet;
