import React, { useState } from 'react';
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
    giveth_donations_usd?: number;
    giveth_donations_amount?: number;
}

export const formatNumber = (value?: number): string => {
    return value !== undefined && value !== null
        ? value.toLocaleString(undefined, { maximumFractionDigits: 2 })
        : 'N/A';
};

const LeaderboardTable = ({ data }: { data: DataBaseAuthor[] }) => {
    const isMobile = useBreakpointValue({ base: true, md: false });
    // Add sorting state
    const [sortKey, setSortKey] = useState<keyof DataBaseAuthor | null>(null);
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    // Compute rank mapping based on points (always descending)
    const rankMap = new Map<string, number>();
    [...data]
        .sort((a, b) => (b.points ?? 0) - (a.points ?? 0))
        .forEach((item, index) => rankMap.set(item.hive_author, index + 1));

    // Sorting handler for clicking column headers
    const handleSort = (column: keyof DataBaseAuthor) => {
        if (sortKey === column) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(column);
            setSortOrder('asc');
        }
    };

    // Compute sorted data for display if a sortKey is selected
    const sortedData = sortKey
        ? [...data].sort((a, b) => {
            let aVal = a[sortKey];
            let bVal = b[sortKey];
            if (sortKey === 'last_post') {
                return sortOrder === 'asc'
                    ? new Date(aVal as string | number || 0).getTime() - new Date(bVal as string | number || 0).getTime()
                    : new Date(bVal as string | number || 0).getTime() - new Date(aVal as string | number || 0).getTime();
            }
            if (typeof aVal === 'number' || typeof bVal === 'number') {
                return sortOrder === 'asc'
                    ? (Number(aVal) ?? 0) - (Number(bVal) ?? 0)
                    : (Number(bVal) ?? 0) - (Number(aVal) ?? 0);
            }
            if (typeof aVal === 'boolean' || typeof bVal === 'boolean') {
                return sortOrder === 'asc'
                    ? (aVal ? 1 : 0) - (bVal ? 1 : 0)
                    : (bVal ? 1 : 0) - (aVal ? 1 : 0);
            }
            aVal = aVal ? aVal.toString() : '';
            bVal = bVal ? bVal.toString() : '';
            return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        })
        : data;

    if (!data) {
        return (
            <Box textAlign="center" mt={10}>
                <Text color="white">No data available.</Text>
            </Box>
        );
    }

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
                        <Th color="white" onClick={() => handleSort('hive_author')} style={{ cursor: 'pointer' }}>
                            Author {sortKey === 'hive_author' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
                        </Th>
                        <Th color="white" textAlign="center" onClick={() => handleSort('points')} style={{ cursor: 'pointer' }}>
                            Points {sortKey === 'points' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
                        </Th>
                        {!isMobile && (
                            <Th color="white" textAlign="center" onClick={() => handleSort('hp_balance')} style={{ cursor: 'pointer' }}>
                                Power {sortKey === 'hp_balance' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
                            </Th>
                        )}
                        {!isMobile && (
                            <Th color="white" textAlign="center" onClick={() => handleSort('has_voted_in_witness')} style={{ cursor: 'pointer' }}>
                                Voted {sortKey === 'has_voted_in_witness' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
                            </Th>
                        )}
                        {!isMobile && (
                            <Th color="white" textAlign="center" onClick={() => handleSort('gnars_votes')} style={{ cursor: 'pointer' }}>
                                Gnars Votes {sortKey === 'gnars_votes' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
                            </Th>
                        )}
                        {!isMobile && (
                            <Th color="white" textAlign="center" onClick={() => handleSort('skatehive_nft_balance')} style={{ cursor: 'pointer' }}>
                                Skatehive NFTs {sortKey === 'skatehive_nft_balance' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
                            </Th>
                        )}
                        {!isMobile && (
                            <Th color="white" textAlign="center" onClick={() => handleSort('last_post')} style={{ cursor: 'pointer' }}>
                                Last Post {sortKey === 'last_post' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
                            </Th>
                        )}
                        {!isMobile && (
                            <Th color="white" textAlign="center" onClick={() => handleSort('giveth_donations_usd')} style={{ cursor: 'pointer' }}>
                                Donations {sortKey === 'giveth_donations_usd' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
                            </Th>
                        )}
                        {/* {!isMobile && <Th color="white" textAlign="center">HBD</Th>} */}
                        {!isMobile && (
                            <Th color="white" textAlign="center" onClick={() => handleSort('hbd_savings_balance')} style={{ cursor: 'pointer' }}>
                                HBD Savings {sortKey === 'hbd_savings_balance' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
                            </Th>
                        )}
                        {!isMobile && (
                            <Th color="white" textAlign="center" onClick={() => handleSort('hive_balance')} style={{ cursor: 'pointer' }}>
                                Hive {sortKey === 'hive_balance' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
                            </Th>
                        )}
                    </Tr>
                </Thead>
                <Tbody>
                    {sortedData.slice(0, 40).map((item: DataBaseAuthor) => (
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
                                                {rankMap.get(item.hive_author)}
                                            </Badge>
                                        </Box>
                                        <HStack>
                                            <Text ml={2}>
                                                {item.hive_author}
                                            </Text>
                                            {rankMap.get(item.hive_author) === 1 && (
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
                                    <Td textAlign="center" color={(item.hp_balance ?? 0) > 2000 ? 'lightgreen' : (item.hp_balance ?? 0) >= 500 ? 'khaki' : 'lightcoral'}>
                                        {formatNumber(item.hp_balance)}
                                    </Td>
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
                                    <Td textAlign="center" color={(item.giveth_donations_usd ?? 0) > 10 ? 'lightgreen' : (item.giveth_donations_usd ?? 0) > 0 ? 'khaki' : 'lightcoral'}>
                                        {formatNumber(item.giveth_donations_usd)}
                                    </Td>
                                    {/* <Td textAlign="center" color={(item.hbd_balance ?? 0) > 500 ? 'lightgreen' : (item.hbd_balance ?? 0) >= 100 ? 'khaki' : 'lightcoral'}>
                                        {formatNumber(item.hbd_balance)}
                                    </Td> */}
                                    <Td textAlign="center" color={(item.hbd_savings_balance ?? 0) > 500 ? 'lightgreen' : (item.hbd_savings_balance ?? 0) >= 100 ? 'khaki' : 'lightcoral'}>
                                        {formatNumber(item.hbd_savings_balance)}
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
