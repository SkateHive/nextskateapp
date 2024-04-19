"use client"

import { useHiveUser } from "@/contexts/UserContext"
import { alchemy } from "@/lib/web3"
import {
  Avatar,
  Button,
  Divider,
  HStack,
  Stack,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  VStack,
  Box,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Link,
  Center,
  Image,
  Badge,
  AvatarBadge,
  Flex
} from "@chakra-ui/react"
import { useEffect, useState } from "react"
import { claimRewards } from "@/lib/hive/client-functions"
import { HiveAccount } from "@/lib/useHiveAuth"
import { FaHive } from "react-icons/fa"
import EthBox from "./components/ethWallet"
function ClaimRewards(hiveUser: HiveAccount) {
  if (hiveUser) claimRewards(hiveUser)

}

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

function HiveBox() {
  const { hiveUser } = useHiveUser()
  return (
    <VStack
      w={"100%"}
      gap={6}
      align={"normal"}
      p={4}
      flex="1"
      border={"1px solid limegreen"}
    >
      <Center>
        <HStack>
          <FaHive />
          <Text align={"center"} fontSize={28}>
            Hive Wallet

          </Text>
        </HStack>
      </Center>
      <Divider mt={-6} color="limegreen" />
      {hiveUser ? (
        <VStack align={"normal"}>
          <HStack>
            <Avatar
              name={hiveUser.name}
              src={hiveUser.metadata?.profile.profile_image}
              borderRadius={"100%"}
              size="md"
              bg="gray.200"
            />
            <Text fontSize={22}>{hiveUser.name}</Text>
          </HStack>
          <VStack align={"normal"} gap={0}>
            <Text>You Own: {String(hiveUser.balance)}</Text>
            <Text>Wallet Worth: </Text>
            <Text>Rewards to Claim : <br /> HBD: {String(hiveUser.reward_hbd_balance)}<br />
              Hive {String(hiveUser.reward_hive_balance)}<br />
              HP {String(hiveUser.reward_vesting_hive)}</Text>
            <Button onClick={() => ClaimRewards(hiveUser)}>Claim!</Button>
          </VStack>
        </VStack>
      ) : null}
    </VStack>
  )
}



export default Wallet;