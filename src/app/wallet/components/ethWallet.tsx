'use client'

import {
    Accordion,
    AccordionButton,
    AccordionIcon,
    AccordionItem,
    AccordionPanel,
    Avatar,
    Badge,
    Box,
    Button,
    Center,
    Flex,
    HStack,
    Image,
    Skeleton,
    SkeletonCircle,
    SkeletonText,
    Table,
    TableContainer,
    Tbody,
    Td,
    Text,
    Th,
    Thead,
    Tr,
    VStack
} from "@chakra-ui/react";
import { useEffect, useState, useCallback } from "react";
import { FaEye, FaSync } from "react-icons/fa";
import { useAccount } from "wagmi";
import * as Types from "../types";
import { FormattedAddress } from "@/components/NNSAddress";
import { fetchPortfolio } from "../utils/fetchPortfolio";
import CollapsibleBox from "./CollapsibleBox";

interface EthBoxProps {
    onNetWorthChange: (value: number) => void;
}

const EthBox: React.FC<EthBoxProps> = ({ onNetWorthChange }) => {
    const { address } = useAccount();
    const [portfolio, setPortfolio] = useState<Types.PortfolioData>();
    const [groupedTokens, setGroupedTokens] = useState<{ [key: string]: Types.TokenDetail[] }>({});
    const [isLoading, setIsLoading] = useState(true);
    const [lastFetchTime, setLastFetchTime] = useState<number>(0);

    const fetchAndSetPortfolio = useCallback(async () => {
        const now = Date.now();
        if (now - lastFetchTime < 60000) return; // Prevent fetching more than once per minute
        setLastFetchTime(now);

        if (!address) return;
        setIsLoading(true);
        try {
            const data = await fetchPortfolio(address);
            setPortfolio(data);
            onNetWorthChange(data.totalNetWorth);
        } catch (error) {
            console.error("Failed to fetch portfolio", error);
        } finally {
            setIsLoading(false);
        }
    }, [address, lastFetchTime, onNetWorthChange]);

    useEffect(() => {
        if (address) fetchAndSetPortfolio();
    }, [address, fetchAndSetPortfolio]);

    useEffect(() => {
        if (portfolio?.tokens) {
            const filteredTokens = portfolio.tokens.filter(token => token.token.balanceUSD >= 1);
            const newGroupedTokens = filteredTokens.reduce((acc, tokenDetail) => {
                (acc[tokenDetail.network] = acc[tokenDetail.network] || []).push(tokenDetail);
                return acc;
            }, {} as { [key: string]: Types.TokenDetail[] });

            Object.keys(newGroupedTokens).forEach(network => {
                newGroupedTokens[network].sort((a, b) => b.token.balanceUSD - a.token.balanceUSD);
            });

            setGroupedTokens(newGroupedTokens);
        }
    }, [portfolio?.tokens]);

    const calculateBlockchainTotal = (network: string) => {
        return portfolio?.tokens
            ?.filter((token) => token.network === network)
            .reduce((acc, token) => acc + token.token.balanceUSD, 0) || 0;
    };

    const sortedNetworks = Object.keys(groupedTokens).sort((a, b) => calculateBlockchainTotal(b) - calculateBlockchainTotal(a));

    return (
        <CollapsibleBox
            title="Ethereum Wallet"
            isLoading={isLoading}
            netWorth={portfolio?.totalNetWorth || 0}
            iconSrc="logos/ethereum_logo.png"
            address={address}
            color="blue"
            maxHeight="666px" // Set consistent maxHeight
        >
            {isLoading && (
                <Center>
                    <Button onClick={fetchAndSetPortfolio} leftIcon={<FaSync />} colorScheme="blue" variant="solid">
                        Reload
                    </Button>
                </Center>
            )}
            {!isLoading && (
                <Accordion allowMultiple w="95%" bg="blue.900" borderRadius={10} mx="auto">
                    {sortedNetworks.map((network) => (
                        <AccordionItem key={network} w="100%">
                            <AccordionButton>
                                <Flex justifyContent="space-between" w="100%">
                                    <Box>
                                        <HStack flex="1" textAlign="left">
                                            <SkeletonCircle isLoaded={!isLoading} boxSize="24px">
                                                <Image src={Types.blockchainDictionary[network]?.logo || '/path/to/default_logo.png'} boxSize="24px" alt={`${network} logo`} />
                                            </SkeletonCircle>
                                            <SkeletonText isLoaded={!isLoading} noOfLines={1}>
                                                <Text color={Types.blockchainDictionary[network]?.color || 'white'} fontSize={{ base: 12, md: 14 }}>
                                                    {Types.blockchainDictionary[network]?.alias || network.charAt(0).toUpperCase() + network.slice(1)}
                                                </Text>
                                            </SkeletonText>
                                        </HStack>
                                    </Box>
                                    <Skeleton isLoaded={!isLoading} w={150}>
                                        <Badge w={150} bg={Types.blockchainDictionary[network]?.color || 'black'}>
                                            <SkeletonText isLoaded={!isLoading} noOfLines={1}>
                                                <Text color="black" isTruncated flex="1" textAlign="right" fontSize={{ base: 16, md: 18 }}>
                                                    ${calculateBlockchainTotal(network)?.toFixed(2)}
                                                </Text>
                                            </SkeletonText>
                                        </Badge>
                                    </Skeleton>
                                </Flex>
                                <AccordionIcon />
                            </AccordionButton>
                            <AccordionPanel color="white" pb={4} w="100%">
                                <TableContainer>
                                    <Table variant="simple" size="sm">
                                        <Thead>
                                            <Tr>
                                                <Th></Th>
                                                <Th>Balance</Th>
                                                <Th isNumeric>in USD</Th>
                                            </Tr>
                                        </Thead>
                                        <Tbody>
                                            {groupedTokens[network].map((token) => (
                                                <Tr key={token.key}>
                                                    <Td>{token.token.symbol.split(" ")[0]}</Td>
                                                    <Td>{token.token.balance.toFixed(3)}</Td>
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
            )}
        </CollapsibleBox>
    );
}

export default EthBox;
