'use client';

import React, { useState } from 'react';
import { Box, Table, Tbody, Td, Text, Thead, Tr, Button, Th, HStack, VStack, Badge, Image, Center, Divider } from '@chakra-ui/react';
import LeaderboardTable, { formatNumber } from '@/components/Leaderboard/LeaderboardTable';
import useLeaderboardData from '@/hooks/useLeaderboardData';
import ModalComponent from '../ModalComponent';
import { formatDate } from '@/lib/utils';
import { FormattedAddress } from '../NNSAddress';
import AuthorAvatar from '../AuthorAvatar';
import { useRouter } from 'next/navigation';
import { FaPencil } from 'react-icons/fa6';
import { FaServer } from 'react-icons/fa';
import LoginModal from '../Hive/Login/LoginModal';

const getColorByValue = (value: number, highThreshold: number, lowThreshold: number): string => {
    if (value >= highThreshold) {
        return 'lightgreen';
    } else if (value >= lowThreshold) {
        return 'yellow';
    } else {
        return 'lightcoral';
    }
};

interface ThComponentProps {
    title: string;
    icon?: JSX.Element;
    imageSrc?: string;
    onClick: () => void;
}

const ThComponent: React.FC<ThComponentProps> = ({ title, icon, imageSrc, onClick }) => (
    <Th color="white" textAlign="center" display={['none', 'table-cell']}
        _hover={{ cursor: 'pointer' }}
        onClick={onClick}
    >
        <VStack _hover={{ transform: 'scale(1.1)' }} >
            {icon ? icon : <Image src={imageSrc} alt={title} boxSize={6} _hover={{ transform: 'scale(1.1)' }} />}
            <Text fontSize="xs">{title}</Text>
        </VStack>
    </Th>
);

const LeaderboardPageClient = () => {
    const { leaderboardData, userRanking, connectedUser, isLoading, error } = useLeaderboardData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalProps, setModalProps] = useState({
        title: '',
        content: '',
        actionText: '',
        onAction: () => { },
    });
    const [isOpen, setIsOpen] = useState(false);

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
    const handleLoginModal = () => {
        setIsOpen(true);
    }
    return (
        <Box
            p={2}
            w={['100%']}
            bg="black"
            borderRadius="md"
            boxShadow="lg"
            overflowX="auto"
        >
            {connectedUser ? (
                <Box
                    mb={5}
                    p={5}
                    bg="gray.900"
                    borderRadius="md"
                    border="2px solid"
                    borderColor='green.500'
                    boxShadow='0 0 10px green'
                >
                    <HStack spacing={4} alignItems="center" mb={4} justifyContent={['center', 'space-between']}>
                        <HStack>
                            <AuthorAvatar username={connectedUser} borderRadius={9999} />
                            <VStack align="start" spacing={-2}>
                                <Box position="relative">
                                    <Badge
                                        position="absolute"
                                        top={7}
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
                                        {`#${userRanking}`}
                                    </Badge>
                                </Box>
                                <Box ml={1} color="lightgreen">
                                    <Text fontSize="xl" fontWeight="bold" color="white">
                                        {connectedUser}
                                    </Text>
                                    <FormattedAddress address={leaderboardData[userRanking - 1]?.eth_address} />
                                </Box>
                            </VStack>
                        </HStack>
                        <Text fontSize="xl" color="white">
                            {formatNumber(leaderboardData[userRanking - 1]?.points)} 🔥
                        </Text>
                    </HStack>
                    {/* <Divider mb={3} /> */}
                    <Box overflowX="auto">
                        <Table size="sm" variant="ghost" colorScheme="gray" whiteSpace="nowrap">
                            <Thead>
                                <Tr>
                                    <ThComponent
                                        title="HP Balance"
                                        imageSrc="/logos/hp_logo.png"
                                        onClick={() => openModal(
                                            'HP Balance',
                                            'HP Balance is the total amount of Hive Power (HP) owned by the user.',
                                            'Power UP', () => setIsModalOpen(false))}
                                    />
                                    <ThComponent
                                        title="Voted Witness"
                                        icon={<FaServer size={20} />}
                                        onClick={() => openModal(
                                            'Voted Witness',
                                            'Voted Witness is a boolean value indicating whether the user has voted for a witness or not.',
                                            'Vote Witness', () => setIsModalOpen(false))}
                                    />
                                    <ThComponent
                                        title="Gnars Votes"
                                        imageSrc="/logos/gnars_logo.png"
                                        onClick={() => openModal(
                                            'Gnars Votes',
                                            'Gnars Votes is the total amount of Gnars Votes owned by the user.',
                                            'Vote Gnars', () => setIsModalOpen(false))}
                                    />
                                    <ThComponent
                                        title="SKTHV NFTs"
                                        imageSrc="/skatehive_square_green.png"
                                        onClick={() => openModal(
                                            'SKTHV NFTs',
                                            'SKTHV NFTs is the total amount of Skatehive NFTs owned by the user.',
                                            'View NFTs', () => setIsModalOpen(false))}
                                    />
                                    <ThComponent
                                        title="Last Post"
                                        icon={<FaPencil size={20} />}
                                        onClick={() => openModal(
                                            'Last Post',
                                            'Last Post is the date of the last post made by the user.',
                                            'View Post', () => setIsModalOpen(false))}
                                    />
                                    <ThComponent
                                        title="HBD Balance"
                                        imageSrc="/logos/hbd_logo.png"
                                        onClick={() => openModal(
                                            'HBD Balance',
                                            'HBD Balance is the total amount of HBD owned by the user.',
                                            'View Wallet', () => setIsModalOpen(false))}
                                    />
                                    <ThComponent
                                        title="HBD Savings"
                                        imageSrc="https://i.ibb.co/rMVdTYt/savings-hive.png"
                                        onClick={() => openModal(
                                            'HBD Savings',
                                            'HBD Savings is the total amount of HBD Savings owned by the user.',
                                            'View Savings', () => setIsModalOpen(false))}
                                    />
                                    <ThComponent
                                        title="Hive Balance"
                                        imageSrc="/logos/hiveLogo.png"
                                        onClick={() => openModal(
                                            'Hive Balance',
                                            'Hive Balance is the total amount of Hive owned by the user.',
                                            'View Wallet', () => setIsModalOpen(false))}
                                    />
                                </Tr>
                            </Thead>
                            <Tbody>
                                <Tr>
                                    <Td color={getColorByValue(leaderboardData[userRanking - 1]?.hp_balance, 2000, 500)} textAlign="center">
                                        {formatNumber(leaderboardData[userRanking - 1]?.hp_balance)}
                                    </Td>
                                    <Td color={leaderboardData[userRanking - 1]?.has_voted_in_witness ? 'lightgreen' : 'lightcoral'} textAlign="center" display={['none', 'table-cell']}>
                                        {leaderboardData[userRanking - 1]?.has_voted_in_witness ? 'Yes' : 'No'}
                                    </Td>
                                    <Td color={getColorByValue(leaderboardData[userRanking - 1]?.gnars_votes, 10, 0)} textAlign="center" display={['none', 'table-cell']}>
                                        {formatNumber(leaderboardData[userRanking - 1]?.gnars_votes)}
                                    </Td>
                                    <Td color={getColorByValue(leaderboardData[userRanking - 1]?.skatehive_nft_balance, 10, 0)} textAlign="center" display={['none', 'table-cell']}>
                                        {formatNumber(leaderboardData[userRanking - 1]?.skatehive_nft_balance)}
                                    </Td>
                                    <Td color={new Date(leaderboardData[userRanking - 1]?.last_post) < new Date() ? 'lightcoral' : 'lightgreen'} textAlign="center" display={['none', 'table-cell']}>
                                        {formatDate(String(leaderboardData[userRanking - 1]?.last_post))}
                                    </Td>
                                    <Td color={getColorByValue(leaderboardData[userRanking - 1]?.hbd_balance, 500, 100)} textAlign="center" display={['none', 'table-cell']}>
                                        {formatNumber(leaderboardData[userRanking - 1]?.hbd_balance)}
                                    </Td>
                                    <Td color={getColorByValue(leaderboardData[userRanking - 1]?.hbd_savings_balance, 500, 100)} textAlign="center" display={['none', 'table-cell']}>
                                        {formatNumber(leaderboardData[userRanking - 1]?.hbd_savings_balance)}
                                    </Td>
                                    <Td color={getColorByValue(leaderboardData[userRanking - 1]?.hive_balance, 500, 100)} textAlign="center" display={['none', 'table-cell']}>
                                        {formatNumber(leaderboardData[userRanking - 1]?.hive_balance)}
                                    </Td>
                                </Tr>
                            </Tbody>
                        </Table>
                    </Box>
                </Box>
            ) : (
                <Box textAlign="center" mt={10}>
                    <Button onClick={handleLoginModal} colorScheme="green" variant="solid">
                        Login with Hive
                    </Button>
                </Box>
            )}
            {isOpen && (
                <LoginModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
            )}
            <Text textAlign="center" fontSize="xl" color="lightgreen" textShadow="0 0 10px green">
                We are {leaderboardData.length} skaters supporting ourselves. 🛹
            </Text>
            <LeaderboardTable data={leaderboardData} />
            <Center>
                <Button onClick={handleNavigate} colorScheme="green" variant="solid" mt={5}>
                    Check the Complete List
                </Button>
            </Center>
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
