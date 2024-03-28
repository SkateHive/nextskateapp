"use client"

import { useHiveUser } from "@/contexts/UserContext"
import { alchemy } from "@/lib/web3"
import {
  Avatar,
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
} from "@chakra-ui/react"
import { OwnedToken } from "alchemy-sdk"
import { useEffect, useState } from "react"
import { useAccount } from "wagmi"

function Wallet() {
  return (
    <Stack
      direction={{ base: "column", md: "row" }}
      w={"100%"}
      align={"flex-start"}
    >
      <HiveBox />
      <EthBox />
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
      <Text align={"center"} fontSize={28}>
        Hive Wallet
      </Text>
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
            <Text>You Own: $5.43</Text>
            <Text>Wallet Worth: $5.43</Text>
            <Text>Available : $0.00</Text>
          </VStack>
        </VStack>
      ) : null}
    </VStack>
  )
}

function EthBox() {
  const account = useAccount()
  const [userTokens, setUserTokens] = useState<OwnedToken[] | null>()

  useEffect(() => {
    async function fetchTokens(ethAddress: string) {
      const userTokens = await alchemy.core.getTokensForOwner(ethAddress)
      setUserTokens(userTokens.tokens)
      console.log(userTokens)
    }
    if (account.address) fetchTokens(account.address)
  }, [account.address])

  return (
    <VStack
      w={"100%"}
      gap={6}
      align={"normal"}
      flex="1"
      p={4}
      border={"1px solid limegreen"}
    >
      <Text align={"center"} fontSize={28}>
        ETH Wallet
      </Text>
      <Divider mt={-6} color="limegreen" />
      <VStack align={"normal"} gap={0}>
        <Text>Address: {account.address}</Text>
        <Text>Chain: {account.chain?.name}</Text>
      </VStack>
      {userTokens && userTokens.length > 1 ? (
        <TableContainer>
          <Table size="sm">
            <Thead>
              <Tr>
                <Th textColor={"green.600"}>Name</Th>
                <Th textColor={"green.600"} isNumeric>
                  Balance
                </Th>
                <Th textColor={"green.600"} isNumeric>
                  Value
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              {userTokens.map((token) => {
                console.log(token)
                return (
                  <Tr key={token.symbol}>
                    <Td textColor={"green.300"}>{token.name}</Td>
                    <Td textColor={"green.300"} isNumeric>
                      {token.balance ? parseFloat(token.balance).toFixed(2) : 0}
                    </Td>
                    <Td textColor={"green.300"} isNumeric>
                      $0.00
                    </Td>
                  </Tr>
                )
              })}
            </Tbody>
          </Table>
        </TableContainer>
      ) : null}
    </VStack>
  )
}

export default Wallet
