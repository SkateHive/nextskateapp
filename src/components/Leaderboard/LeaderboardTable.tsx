import React from 'react';
import { Box, Table, Thead, Tbody, Tr, Th, Td, useBreakpointValue, Text } from '@chakra-ui/react';
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

    return (
        <Box mt={10} p={5} bg="gray.700" borderRadius="md" boxShadow="lg" overflowX="auto">
            {!isMobile ? (
                <Table colorScheme="gray" fontSize="sm" whiteSpace="nowrap">
                    <Thead>
                        <Tr>
                            <Th color="white" textAlign="center">Rank</Th>
                            <Th color="white">Author</Th>
                            <Th color="white" textAlign="center">Points</Th>
                            <Th color="white" textAlign="center">Power</Th>

                            <Th color="white" textAlign="center">Voted</Th>
                            <Th color="white">ETH Address</Th>
                            <Th color="white" textAlign="center">Gnars Votes</Th>
                            <Th color="white" textAlign="center">Skatehive NFTs</Th>
                            <Th color="white" textAlign="center">Last Post</Th>
                            <Th color="white" textAlign="center">HBD</Th>
                            <Th color="white" textAlign="center">HBD Savings</Th>
                            <Th color="white" textAlign="center">Hive</Th>

                        </Tr>
                    </Thead>
                    <Tbody>
                        {data.slice(0, 40).map((item: DataBaseAuthor, index: number) => (
                            <Tr key={item.hive_author} bg={index < 20 ? 'gray.600' : 'transparent'}>
                                <Td textAlign="center" color="white">{index + 1}</Td>
                                <Td color="white">
                                    <AuthorAvatar username={item.hive_author} borderRadius={9999} />
                                    <Text>
                                        {item.hive_author}
                                    </Text>
                                </Td>
                                <Td textAlign="center" color="white">{formatNumber(Math.ceil(item.points ?? 0))}</Td>
                                <Td textAlign="center" color={(item.hive_balance ?? 0) > 500 ? 'lightgreen' : (item.hive_balance ?? 0) >= 100 ? 'khaki' : 'lightcoral'}>
                                    {formatNumber(item.hive_balance)}
                                </Td>
                                <Td textAlign="center" color={item.has_voted_in_witness ? 'lightgreen' : 'lightcoral'}>
                                    {item.has_voted_in_witness ? 'Yes' : 'No'}
                                </Td>
                                <Td color={item.eth_address && item.eth_address !== '0x0000000000000000000000000000000000000000' ? 'lightgreen' : 'lightcoral'}>
                                    <FormattedAddress address={item.eth_address} />
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
                            </Tr>
                        ))}
                    </Tbody>
                </Table>
            ) : (
                <Table variant="simple" fontSize="sm">
                    <Thead>
                        <Tr>
                            <Th color="white">Rank</Th>
                            <Th color="white">Points</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {data.slice(0, 40).map((item: DataBaseAuthor, index: number) => (
                            <Tr key={item.hive_author} bg={index < 20 ? 'gray.600' : 'transparent'}>
                                <Td color="white">{index + 1}</Td>
                                <Td color="white">{formatNumber(Math.ceil(item.points ?? 0))}</Td>
                            </Tr>
                        ))}
                    </Tbody>
                </Table>
            )}
        </Box>
    );
};

export default LeaderboardTable;
