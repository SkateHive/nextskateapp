'use client'

import {
    Accordion,
    AccordionButton,
    AccordionIcon,
    AccordionItem,
    AccordionPanel,
    Avatar,
    AvatarBadge,
    Badge,
    Box,
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
import axios from "axios";
import { useEffect, useState } from "react";
import { FaEye } from "react-icons/fa";
import { useAccount } from "wagmi";
import * as Types from "../types";
import { FormattedAddress } from "@/components/NNSAddress";
interface EthBoxProps {
    onNetWorthChange: (value: number) => void;
}

const EthBox: React.FC<EthBoxProps> = ({ onNetWorthChange }) => {
    const account = useAccount();
    const [portfolio, setPortfolio] = useState<Types.PortfolioData>();
    const [groupedTokens, setGroupedTokens] = useState<{ [key: string]: Types.TokenDetail[] }>({});
    const [isLoading, setIsLoading] = useState(true);
    const [isOpened, setIsOpened] = useState(false);

    useEffect(() => {
        const getPortfolio = async () => {
            const Portfolio = await axios.get(`https://pioneers.dev/api/v1/portfolio/${account.address}`);
            setPortfolio(Portfolio.data);
            onNetWorthChange(Portfolio.data.totalNetWorth);
            setIsLoading(false);
        };
        if (account.address) {
            getPortfolio();
        }
    }, [account.address, onNetWorthChange]);

    useEffect(() => {
        if (portfolio?.tokens) {
            const newGroupedTokens = portfolio.tokens.reduce((acc, tokenDetail) => {
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
        if (!portfolio?.tokens) {
            return 0;
        }

        return portfolio.tokens
            .filter((token) => token.network === network)
            .reduce((acc, token) => acc + token.token.balanceUSD, 0);
    };

    const sortedNetworks = Object.keys(groupedTokens).sort((a, b) => {
        const totalA = calculateBlockchainTotal(a) || 0;
        const totalB = calculateBlockchainTotal(b) || 0;
        return totalB - totalA;
    });

    return (
        <VStack
            w="100%"
            gap={6}
            align="normal"
            flex="1"
            p={4}
            border="1px solid #0fb9fc"
            borderRadius="10px"
            bg="#201d21"
            m={2}
            color={"white"}
        >
            <HStack
                w="100%"
                border="1px solid white"
                p={5}
                borderTopRadius={10}
                mb={-6}
                justifyContent="space-between"
                bg="blue.900"
                cursor="pointer"
                onClick={() => setIsOpened(!isOpened)}
            >

                <SkeletonCircle isLoaded={!isLoading} size="48px">
                    <Avatar
                        boxSize="48px"
                        src={'logos/ethereum_logo.png'}
                        bg="transparent"
                    >
                    </Avatar>
                </SkeletonCircle>
                <SkeletonText isLoaded={!isLoading} noOfLines={1}>
                    <Text
                        fontSize={14}
                        maxWidth="200px"
                        whiteSpace="nowrap"
                        overflow="hidden"
                        textOverflow="ellipsis"
                        textAlign="center"
                    >
                        <FormattedAddress address={account.address} />
                    </Text>
                </SkeletonText>
                <FaEye size={30} color="white" />
            </HStack>

            <Skeleton startColor='white' endColor='blue.200' isLoaded={!isLoading} fitContent minWidth="100%">
                <Box
                    border="1px solid white"
                    bg="blue.700"
                    onClick={() => setIsOpened(!isOpened)}
                    cursor="pointer"
                >
                    <Center>
                        <VStack m={5}>
                            <Box padding="4px 8px">
                                <SkeletonText isLoaded={!isLoading} noOfLines={1}>
                                    <Text
                                        color={"white"}
                                        fontWeight="bold"
                                        fontSize={{ base: 24, md: 34 }}
                                        textShadow="0 0 10px black, 0 0 20px black, 0 0 30px rgba(255, 255, 255, 0.4)"
                                    >
                                        ${portfolio?.totalNetWorth?.toFixed(2) || 0}
                                    </Text>
                                </SkeletonText>
                            </Box>
                        </VStack>
                    </Center>
                </Box>
            </Skeleton>
            {isOpened && (
                <Accordion allowMultiple w="100%">
                    {groupedTokens && sortedNetworks.map((network) => (
                        <AccordionItem key={network}>
                            <AccordionButton>
                                <Flex justifyContent="space-between" w="100%">
                                    <Box>
                                        <HStack flex="1" textAlign="left">
                                            <SkeletonCircle isLoaded={!isLoading} boxSize="24px">
                                                <Image
                                                    src={Types.blockchainDictionary[network]?.logo || '/path/to/default_logo.png'}
                                                    boxSize="24px"
                                                    alt={`${network} logo`}
                                                />
                                            </SkeletonCircle>
                                            <SkeletonText isLoaded={!isLoading} noOfLines={1}>
                                                <Text color={Types.blockchainDictionary[network]?.color || 'white'} fontSize={{ base: 12, md: 14 }}>
                                                    {Types.blockchainDictionary[network]?.alias
                                                        ? Types.blockchainDictionary[network].alias
                                                        : network.charAt(0).toUpperCase() + network.slice(1)}
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
                            <AccordionPanel color={"white"} pb={4}>
                                <TableContainer>
                                    <Table variant="simple" size="sm">
                                        <Thead>
                                            <Tr color="red">
                                                <Th></Th>
                                                <Th>Balance</Th>
                                                <Th isNumeric>in USD</Th>
                                            </Tr>
                                        </Thead>
                                        <Tbody>
                                            {groupedTokens[network].map((token) => (
                                                <Tr key={token.key}>
                                                    <Td>{token.token.symbol}</Td>
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
        </VStack>
    );
}

export default EthBox;
