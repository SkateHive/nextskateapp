'use client';

import React, { useState } from 'react';
import { Box, Table, Tbody, Td, Text, Thead, Tr, Button, Th, HStack } from '@chakra-ui/react';
import LeaderboardTable, { formatNumber } from '@/components/Leaderboard/LeaderboardTable';
import useLeaderboardData from '@/hooks/useLeaderboardData';
import ModalComponent from '../ModalComponent';
import { formatDate } from '@/lib/utils';
import { FormattedAddress } from '../NNSAddress';
import AuthorAvatar from '../AuthorAvatar';
import { useRouter } from 'next/navigation';

const getColorByValue = (value: number, highThreshold: number, lowThreshold: number): string => {
    if (value >= highThreshold) {
        return 'lightgreen';
    } else if (value >= lowThreshold) {
        return 'yellow';
    } else {
        return 'lightcoral';
    }
};

const LeaderboardPageClient = () => {
    const { leaderboardData, userRanking, connectedUser, isLoading, error } = useLeaderboardData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalProps, setModalProps] = useState({
        title: '',
        content: '',
        actionText: '',
        onAction: () => { },
    });

    const openModal = (title: string, content: string, actionText: string, onAction: () => void) => {
        setModalProps({ title, content, actionText, onAction });
        setIsModalOpen(true);
    };

    const router = useRouter();
    const handleNavigate = () => {
        router.push('https://api.skatehive.app');
    };

    if (isLoading) {
        return (
            <Box textAlign="center" mt={10}>
                <Text color="white">Loading...</Text>
            </Box>
        );
    }

    if (error) {
        return (
            <Box textAlign="center" mt={10}>
                <Text color="red.500">Failed to load leaderboard data.</Text>
            </Box>
        );
    }

    return (
        <Box
            p={5}
            maxWidth="1200px"
            mx="auto"
            bg="gray.800"
            borderRadius="md"
            boxShadow="lg"
            overflowX="auto"
        >
            {connectedUser && (
                <Box
                    mb={5}
                    p={5}
                    bg="gray.700"
                    borderRadius="md"
                    boxShadow="lg"
                >
                    <HStack spacing={4} alignItems="center">
                        <AuthorAvatar username={connectedUser} borderRadius={9999} />
                        <Text fontSize="xl" fontWeight="bold" color="white">
                            {connectedUser}
                        </Text>
                        <Text fontSize="md" color="white">
                            {`Ranking: ${userRanking}`}
                        </Text>
                    </HStack>
                    <Box overflowX="auto">
                        <Table size="sm" variant="simple" colorScheme="gray" whiteSpace="nowrap">
                            <Thead>
                                <Tr>
                                    <Th color="white">Points</Th>
                                    <Th color="white">HP Balance</Th>
                                    <Th color="white">Voted Witness</Th>
                                    <Th color="white">ETH Address</Th>
                                    <Th color="white">Gnars Votes</Th>
                                    <Th color="white">Skatehive NFTs</Th>
                                    <Th color="white">Last Post</Th>
                                    <Th color="white">HBD Balance</Th>
                                    <Th color="white">HBD Savings</Th>
                                    <Th color="white">Hive Balance</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                <Tr>
                                    <Td color="white">{formatNumber(leaderboardData[userRanking - 1]?.points)}</Td>

                                    <Td color={getColorByValue(leaderboardData[userRanking - 1]?.hp_balance, 2000, 500)}>
                                        {formatNumber(leaderboardData[userRanking - 1]?.hp_balance)}
                                    </Td>
                                    <Td color={leaderboardData[userRanking - 1]?.has_voted_in_witness ? 'lightgreen' : 'lightcoral'}>
                                        {leaderboardData[userRanking - 1]?.has_voted_in_witness ? 'Yes' : 'No'}
                                    </Td>
                                    <Td>
                                        <FormattedAddress address={leaderboardData[userRanking - 1]?.eth_address} />
                                    </Td>
                                    <Td color={getColorByValue(leaderboardData[userRanking - 1]?.gnars_votes, 10, 0)}>
                                        {formatNumber(leaderboardData[userRanking - 1]?.gnars_votes)}
                                    </Td>
                                    <Td color={getColorByValue(leaderboardData[userRanking - 1]?.skatehive_nft_balance, 10, 0)}>
                                        {formatNumber(leaderboardData[userRanking - 1]?.skatehive_nft_balance)}
                                    </Td>
                                    <Td color={new Date(leaderboardData[userRanking - 1]?.last_post) < new Date() ? 'lightcoral' : 'lightgreen'}>
                                        {formatDate(String(leaderboardData[userRanking - 1]?.last_post))}
                                    </Td>
                                    <Td color={getColorByValue(leaderboardData[userRanking - 1]?.hive_balance, 500, 100)}>
                                        {formatNumber(leaderboardData[userRanking - 1]?.hive_balance)}
                                    </Td>
                                    <Td color={getColorByValue(leaderboardData[userRanking - 1]?.hbd_balance, 500, 100)}>
                                        {formatNumber(leaderboardData[userRanking - 1]?.hbd_balance)}
                                    </Td>
                                    <Td color={getColorByValue(leaderboardData[userRanking - 1]?.hbd_savings_balance, 500, 100)}>
                                        {formatNumber(leaderboardData[userRanking - 1]?.hbd_savings_balance)}
                                    </Td>
                                </Tr>
                            </Tbody>
                        </Table>
                    </Box>
                </Box>
            )}
            <LeaderboardTable data={leaderboardData} />
            <Button onClick={handleNavigate} colorScheme="red" variant="solid" mt={5}>
                Check the Complete List
            </Button>
            <ModalComponent
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={modalProps.title}
                content={modalProps.content}
                actionText={modalProps.actionText}
                onAction={modalProps.onAction}
            />
        </Box>
    );
};

export default LeaderboardPageClient;
