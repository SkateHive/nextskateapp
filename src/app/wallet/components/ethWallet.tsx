'use client'
import React from "react";
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
import { useAccount } from "wagmi"
import axios from "axios"
import * as Types from "../types"
import { getENSavatar } from "@/app/dao/utils/getENSavatar";
import { getENSnamefromAddress } from "@/app/dao/utils/getENSfromAddress";
import { FaHive, FaEthereum } from "react-icons/fa"


function EthBox() {
    const account = useAccount();
    const [portfolio, setPortfolio] = useState<Types.PortfolioData>();
    const [userENSavatar, SetUserENSAvatar] = useState<string | null>(null);
    const [userENSname, SetUserENSName] = useState<string | null>(null);

    const getPortfolio = async () => {
        const Portfolio = await axios.get(`https://pioneers.dev/api/v1/portfolio/${account.address}`);
        console.log("Portfolio", Portfolio);
        setPortfolio(Portfolio.data);
    };

    useEffect(() => {
        if (account.address) {
            getPortfolio();
        }
    }, [account.address]);

    const groupedTokens = portfolio?.tokens.reduce((acc, tokenDetail) => {
        (acc[tokenDetail.network] = acc[tokenDetail.network] || []).push(tokenDetail);
        return acc;
    }, {} as { [key: string]: Types.TokenDetail[] });

    const formatEthWallet = (address: string) => {
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };
    const calculateBlockchainTotal = (network: string) => {
        return portfolio?.tokens
            .filter((token) => token.network === network)
            .reduce((acc, token) => acc + token.token.balanceUSD, 0);
    }
    const getUserENSAvatar = async () => {
        const avatar = await getENSavatar(String(account.address));
        SetUserENSAvatar(avatar);
    }

    const getUserENSname = async () => {
        const name = await getENSnamefromAddress(String(account.address));
        SetUserENSName(name);
    }
    useEffect(() => {
        if (account.address) {
            getUserENSAvatar();
            getUserENSname();
        }
    }, [account.address]);

    return (
        <VStack w="100%" gap={6} align="normal" flex="1" p={4} border="1px solid #0fb9fc">
            <Center>
                <HStack>
                    <FaEthereum />
                    <Text align="center" fontSize={28}>
                        ETH Wallet
                    </Text>
                </HStack>
            </Center>
            <Divider mt={-6} color="limegreen" />

            <HStack>
                <Avatar boxSize={'48px'} src={String(userENSavatar)} bg="transparent">
                    <AvatarBadge boxSize="1.25em" bg="transparent" border="none">
                        <Image
                            src={Types.blockchainDictionary[account.chain?.name.toLowerCase() ?? '']?.logo || 'logos/ethereum_logo.png'}
                            boxSize="24px"
                            alt={`${account.chain?.name} logo`}
                        />
                    </AvatarBadge>
                </Avatar>
                <Text>{userENSname || formatEthWallet(String(account.address))}</Text>
            </HStack>
            <Box ml={10} mr={10} border={"1px solid yellow"} bg="#201d21">

                <Center>
                    <VStack>

                        <Text>Tokens Value: {portfolio?.totalBalanceUsdTokens.toFixed(2)}</Text>
                        <Text>Net Worth: {portfolio?.totalNetWorth.toFixed(2)}</Text>
                    </VStack>
                </Center>
            </Box>

            <Accordion allowMultiple>
                {groupedTokens && Object.keys(groupedTokens).map((network) => (
                    <AccordionItem key={network}>
                        <AccordionButton>
                            <Flex justifyContent="space-between" w="100%">
                                <Box>
                                    <HStack flex="1" textAlign="left">

                                        <Image
                                            src={Types.blockchainDictionary[network]?.logo || '/path/to/default_logo.png'} // Fallback to a default logo if none is specified
                                            boxSize="24px"
                                            alt={`${network} logo`}
                                        />
                                        <Text color={Types.blockchainDictionary[network]?.color || 'white'}>
                                            {network.charAt(0).toUpperCase() + network.slice(1)}
                                            {/* Display network name with first letter capitalized */}
                                        </Text>
                                    </HStack>

                                </Box>
                                <Box>

                                    <Badge bg={Types.blockchainDictionary[network]?.color || 'black'}>

                                        <Text color={"black"} isTruncated flex="1" textAlign="right">
                                            ${calculateBlockchainTotal(network)?.toFixed(2)}
                                        </Text>
                                    </Badge>
                                </Box>
                            </Flex>
                            <AccordionIcon />
                        </AccordionButton>
                        <AccordionPanel pb={4}>
                            <TableContainer>
                                <Table variant="simple" size="sm">
                                    <Thead>
                                        <Tr>
                                            <Th>Token</Th>
                                            <Th>Balance</Th>
                                            <Th isNumeric>USD Value</Th>
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                        {groupedTokens[network].map((token) => (
                                            <Tr key={token.key}>
                                                <Td>{token.token.symbol}</Td>
                                                <Td>{token.token.balance.toFixed(4)}</Td>
                                                <Td isNumeric>${token.token.balanceUSD.toFixed(2)}</Td>
                                            </Tr>
                                        ))}
                                    </Tbody>
                                </Table>
                            </TableContainer>
                        </AccordionPanel>
                    </AccordionItem>
                ))}
            </Accordion>
        </VStack >
    );
}

export default EthBox;