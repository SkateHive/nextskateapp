'use client'
import { getENSavatar } from "@/app/dao/utils/getENSavatar";
import { getENSnamefromAddress } from "@/app/dao/utils/getENSfromAddress";
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
    Divider,
    Flex,
    HStack,
    Image,
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
import { FaEthereum } from "react-icons/fa";
import { useAccount } from "wagmi";
import * as Types from "../types";

interface EthBoxProps {
    onNetWorthChange: (value: number) => void;
}

const EthBox: React.FC<EthBoxProps> = ({ onNetWorthChange }) => {
    const account = useAccount();
    const [portfolio, setPortfolio] = useState<Types.PortfolioData>();
    const [userENSavatar, SetUserENSAvatar] = useState<string | null>(null);
    const [userENSname, SetUserENSName] = useState<string | null>(null);
    const [groupedTokens, setGroupedTokens] = useState<{ [key: string]: Types.TokenDetail[] }>({});

    useEffect(() => {
        const getPortfolio = async () => {
            const Portfolio = await axios.get(`https://pioneers.dev/api/v1/portfolio/${account.address}`);
            setPortfolio(Portfolio.data);
            onNetWorthChange(Portfolio.data.totalNetWorth);
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

    useEffect(() => {
        const getUserENSAvatar = async () => {
            const avatar = await getENSavatar(String(account.address));
            SetUserENSAvatar(avatar);
        };

        const getUserENSname = async () => {
            const name = await getENSnamefromAddress(String(account.address));
            SetUserENSName(name);
        };

        if (account.address) {
            getUserENSAvatar();
            getUserENSname();
        }
    }, [account.address]);
    
    const formatEthWallet = (address: string) => {
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };
    const calculateBlockchainTotal = (network: string) => {
        return portfolio?.tokens
            .filter((token) => token.network === network)
            .reduce((acc, token) => acc + token.token.balanceUSD, 0);
    }

    const [isOpened, setIsOpened] = useState(false);

    return (
        <VStack
            w="100%"
            gap={6}
            align="normal"
            flex="1"
            p={4}
            border="1px solid #0fb9fc"
            borderRadius="10px"
            bg="blue.800"
        >
            <Center onClick={() => setIsOpened(!isOpened)}>
                <HStack cursor="pointer">
                    <FaEthereum />
                    <Text align="center" fontSize={{ base: 24, md: 28 }}>
                    <Text fontSize={{ base: 18, md: 18 }}>{userENSname || formatEthWallet(String(account.address))}</Text>

                    </Text>
                </HStack>
            </Center>
            <Divider mt={-6} />
            <Center>
                <HStack
                    minWidth="100%"
                    border="1px solid white"
                    p={5}
                    borderTopRadius={10}
                    mb={-6}
                    justifyContent="center"
                    bg="blue.900"
                >
                    <Avatar
                        boxSize="48px"
                        src={String(userENSavatar)}
                        bg="transparent"
                    >
                        <AvatarBadge boxSize="1.25em" bg="transparent" border="none">
                            <Image
                                src={Types.blockchainDictionary[account.chain?.name.toLowerCase() ?? '']?.logo || 'logos/ethereum_logo.png'}
                                boxSize="24px"
                                alt={`${account.chain?.name} logo`}
                            />
                        </AvatarBadge>
                    </Avatar>
                </HStack>
            </Center>
            <Box minWidth="100%" border="1px solid white">
                <Center>
                    <VStack m={5}>
                        <Box bg="#0fb9fc48" borderRadius="8px" padding="4px 8px">
                            <Text fontWeight="bold" fontSize={{ base: 24, md: 34 }}>
                                ${portfolio?.totalNetWorth?.toFixed(2) || 0}
                            </Text>
                        </Box>
                    </VStack>
                </Center>
            </Box>
            {isOpened && (
                <Accordion allowMultiple>
                    {groupedTokens && Object.keys(groupedTokens).map((network) => (
                        <AccordionItem key={network}>
                            <AccordionButton>
                                <Flex justifyContent="space-between" w="100%">
                                    <Box>
                                        <HStack flex="1" textAlign="left">
                                            <Image
                                                src={Types.blockchainDictionary[network]?.logo || '/path/to/default_logo.png'}
                                                boxSize="24px"
                                                alt={`${network} logo`}
                                            />
                                            <Text color={Types.blockchainDictionary[network]?.color || 'white'} fontSize={{ base: 16, md: 18 }}>
                                                {network.charAt(0).toUpperCase() + network.slice(1)}
                                            </Text>
                                        </HStack>
                                    </Box>
                                    <Box>
                                        <Badge bg={Types.blockchainDictionary[network]?.color || 'black'}>
                                            <Text color="black" isTruncated flex="1" textAlign="right" fontSize={{ base: 16, md: 18 }}>
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
                                            <Tr color="red">
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
            )}
        </VStack>
    );
}

export default EthBox;

