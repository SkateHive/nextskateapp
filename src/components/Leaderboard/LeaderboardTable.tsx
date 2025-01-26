import React from 'react';
import { Box, Table, Thead, Tbody, Tr, Th, Td, useBreakpointValue, Text, HStack, VStack, Badge, Image } from '@chakra-ui/react';
import { FormattedAddress } from '../NNSAddress';
import { formatDate } from '@/lib/utils';
import AuthorAvatar from '../AuthorAvatar';

export interface DataBaseAuthor {
    hive_author: string;
    hive_balance?: number;
    hp_balance?: number;
    hbd_balance?: number;
    hbd_savings_balance?: number;
    has_voted_in_witness?: boolean;
    eth_address?: string;
    gnars_balance?: number;
    gnars_votes?: number;
    skatehive_nft_balance?: number;
    delegated_hive_power?: number;
    last_post?: string;
    points?: number;
    post_count?: number;
    max_voting_power_usd?: number;
}

export const formatNumber = (value?: number): string => {
    return value !== undefined && value !== null
        ? value.toLocaleString(undefined, { maximumFractionDigits: 2 })
        : 'N/A';
};

const LeaderboardTable = ({ data }: { data: DataBaseAuthor[] }) => {
    const isMobile = useBreakpointValue({ base: true, md: false });
    const isTablet = useBreakpointValue({ base: false, md: true, lg: false });

    return (
        <Box
            mt={4}
            borderRadius="md"
            overflowX="auto"
            border="2px solid"
            borderColor='green.500'
            bg="gray.900"
            boxShadow='0 0 10px green'>

            <Table fontSize="sm" whiteSpace="nowrap" variant={'ghost'}>
                <Thead>
                    <Tr>
                        <Th color="white">Author</Th>
                        <Th color="white" textAlign="center">Points</Th>
                        {!isMobile && <Th color="white" textAlign="center">Power</Th>}
                        {!isMobile && <Th color="white" textAlign="center">Voted</Th>}
                        {!isMobile && <Th color="white" textAlign="center">Gnars Votes</Th>}
                        {!isMobile && <Th color="white" textAlign="center">Skatehive NFTs</Th>}
                        {!isMobile && <Th color="white" textAlign="center">Last Post</Th>}
                        {!isMobile && <Th color="white" textAlign="center">HBD</Th>}
                        {!isMobile && <Th color="white" textAlign="center">HBD Savings</Th>}
                        {!isMobile && <Th color="white" textAlign="center">Hive</Th>}
                    </Tr>
                </Thead>
                <Tbody>
                    {data.slice(0, 40).map((item: DataBaseAuthor, index: number) => (
                        <Tr key={item.hive_author}>
                            <Td p={2}>
                                <HStack>
                                    <AuthorAvatar username={item.hive_author} borderRadius={9999} boxSize={9} />
                                    <VStack align="start" gap={-2}>
                                        <Box position="relative">
                                            <Badge
                                                position="absolute"
                                                top={5}
                                                right={-1}
                                                bg="gold"
                                                borderRadius={9999}
                                                color="black"
                                                px={1}
                                                py={0.5}
                                                fontSize="xs"
                                                fontWeight="bold"
                                                shadow="md"
                                            >
                                                #{index + 1}
                                            </Badge>
                                        </Box>
                                        <HStack>
                                            <Text ml={2}>
                                                {item.hive_author}
                                            </Text>
                                            {index === 0 && (
                                                <Image
                                                    src="/crown.png"
                                                    alt="Crown"
                                                    boxSize={6}
                                                />
                                            )}
                                        </HStack>
                                        <Box ml={1} color={item.eth_address && item.eth_address !== '0x0000000000000000000000000000000000000000' ? 'lightgreen' : 'lightcoral'}>
                                            <FormattedAddress address={item.eth_address} />
                                        </Box>
                                    </VStack>
                                </HStack>
                            </Td>
                            <Td textAlign="center" >{formatNumber(Math.ceil(item.points ?? 0))}</Td>
                            {!isMobile && (
                                <>
                                    <Td textAlign="center" color={item.has_voted_in_witness ? 'lightgreen' : 'lightcoral'}>
                                        {item.has_voted_in_witness ? 'Yes' : 'No'}
                                    </Td>
                                    <Td textAlign="center" color={(item.gnars_votes ?? 0) > 10 ? 'lightgreen' : (item.gnars_votes ?? 0) > 0 ? 'khaki' : 'lightcoral'}>
                                        {formatNumber(item.gnars_votes)}
                                    </Td>
                                    <Td textAlign="center" color={(item.skatehive_nft_balance ?? 0) > 10 ? 'lightgreen' : (item.skatehive_nft_balance ?? 0) > 0 ? 'khaki' : 'lightcoral'}>
                                        {formatNumber(item.skatehive_nft_balance)}
                                    </Td>
                                    <Td textAlign="center" color={item.last_post && new Date(item.last_post) < new Date(new Date().setFullYear(new Date().getFullYear() - 1)) ? 'lightcoral' : 'lightgreen'}>
                                        {formatDate(String(item.last_post))}
                                    </Td>
                                    <Td textAlign="center" color={(item.hbd_balance ?? 0) > 500 ? 'lightgreen' : (item.hbd_balance ?? 0) >= 100 ? 'khaki' : 'lightcoral'}>
                                        {formatNumber(item.hbd_balance)}
                                    </Td>
                                    <Td textAlign="center" color={(item.hbd_savings_balance ?? 0) > 500 ? 'lightgreen' : (item.hbd_savings_balance ?? 0) >= 100 ? 'khaki' : 'lightcoral'}>
                                        {formatNumber(item.hbd_savings_balance)}
                                    </Td>
                                    <Td textAlign="center" color={(item.hp_balance ?? 0) > 2000 ? 'lightgreen' : (item.hp_balance ?? 0) >= 500 ? 'khaki' : 'lightcoral'}>
                                        {formatNumber(item.hp_balance)}
                                    </Td>
                                    <Td textAlign="center" color={(item.hive_balance ?? 0) > 500 ? 'lightgreen' : (item.hive_balance ?? 0) >= 100 ? 'khaki' : 'lightcoral'}>
                                        {formatNumber(item.hive_balance)}
                                    </Td>
                                </>
                            )}
                        </Tr>
                    ))}
                </Tbody>
            </Table>
        </Box>
    );
};

export default LeaderboardTable;
