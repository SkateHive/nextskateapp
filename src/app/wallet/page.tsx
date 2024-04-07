"use client"

import { useHiveUser } from "@/contexts/UserContext"
import { ethClient, wallets } from "@/lib/wallet/client"
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
} from "@chakra-ui/react"
import { OwnedToken } from "alchemy-sdk"
import { useEffect, useState } from "react"
import { base } from "thirdweb/chains"
import { ConnectButton, useActiveWallet, useDisconnect } from "thirdweb/react"
import { Wallet } from "thirdweb/wallets"

function WalletPage() {
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
  const wallet = useActiveWallet()
  const { disconnect } = useDisconnect()
  const [userTokens, setUserTokens] = useState<OwnedToken[] | null>()

  function disconnectWallet() {
    disconnect(wallet as Wallet)
    setUserTokens(null)
  }

  useEffect(() => {
    async function fetchTokens(ethAddress: string) {
      const userTokens = await alchemy.core.getTokensForOwner(ethAddress)
      setUserTokens(userTokens.tokens)
      console.log(userTokens)
    }
    if (wallet && wallet.getAccount()?.address) {
      fetchTokens(wallet.getAccount()?.address as string)
    }
  }, [wallet])

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
        {wallet ? (
          <>
            <Text>Address: {wallet.getAccount()?.address}</Text>
            <Text>Chain: {wallet.getChain()?.name}</Text>
            <Button onClick={disconnectWallet}>Disconnect</Button>
          </>
        ) : (
          <ConnectButton
            theme={"dark"}
            client={ethClient}
            wallets={wallets}
            chain={base}
            connectButton={{
              label: "Connect ETH wallet",
              style: {
                backgroundColor: "black",
                border: "1px solid white",
                color: "white",
                paddingBlock: "0",
                height: "40px",
                width: "100%",
                borderRadius: "6px",
              },
            }}
          />
        )}
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
                return (
                  <Tr key={token.contractAddress}>
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

export default WalletPage
