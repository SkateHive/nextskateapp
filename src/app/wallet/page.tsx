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
import '../../styles/fonts.css';
import Pix from "./components/Pix/Pix";
import TotalValueBox from "./components/TotalWalletPage";
function Wallet() {
  const user = useHiveUser();
  const username = user?.hiveUser?.name;
  const posting_metadata = JSON.parse(user?.hiveUser?.posting_json_metadata || '{}');
  const location = posting_metadata?.profile?.location || '';


  return (
    <Box w="100%" p={4}>
      <Tabs isLazy variant={'soft-enclosed'}>
        <TabList color={"white"} justifyContent={"center"} fontFamily="Joystix">
          <Tab _selected={{ bg: 'limegreen' }}>Wallet</Tab>
          <Tab _selected={{ bg: 'limegreen' }}>Swap</Tab>
          {location === 'BR' && <Tab _selected={{ bg: 'limegreen' }}> 🇧🇷 PIX</Tab>}

        </TabList>
        <TabPanels>
          <TabPanel>
            <TotalValueBox />
          </TabPanel>
          <TabPanel>
            <Flex direction={{ base: "column", md: "row" }}>
              <Box w={'100%'} h={'80%'} backgroundColor={'black'} borderRadius={10} p={4}>
                <iframe
                  id="swapWidgetkeychain"
                  title="Swap Tokens with Keychain"
                  src={`https://swapwidget.hive-keychain.com/?username=${username}&to=WEED&partnerUsername=steemskate&partnerFee=0.5&from=HIVE`}
                  allow="clipboard-write"
                  width="100%"
                  height="500px"
                />
              </Box>
              <Box w={'100%'} h={'80%'} backgroundColor={'black'} borderRadius={10} p={4}>
                <iframe
                  id="simpleswap-frame"
                  name="SimpleSwap Widget"
                  width="100%"
                  height="500px"
                  style={{ border: "none", borderRadius: "50px" }}
                  src="https://simpleswap.io/widget/df29d743-6c03-4c7e-a745-4a0bfd19c656" ></iframe>
              </Box>
            </Flex>

          </TabPanel>
          <TabPanel>
            {user.hiveUser && <Pix user={user.hiveUser} />}
          </TabPanel>
        </TabPanels>
      </Tabs >
    </Box>
  );
}

export default Wallet;
