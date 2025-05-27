'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Box, Text, Button, Th, VStack, Image, Center, Container, HStack, Select } from '@chakra-ui/react';
import LeaderboardTable from '@/components/Leaderboard/LeaderboardTable';
import useLeaderboardData from '@/hooks/useLeaderboardData';
import LoginModal from '../Hive/Login/LoginModal';
import ConnectedUserBanner from './ConnectedUserBanner';
import { useRouter } from 'next/navigation';
import LeaderboardModal from '../ModalComponent';
import AirdropModal from '@/app/mainFeed/components/airdropModal';
import AirdropFilterModal from './AirdropFilterModal';
import { DataBaseAuthor } from './LeaderboardTable';
import { useAirdropManager } from './AirdropManager';
import { AirdropDebugStats } from './AirdropDebugStats';

interface ThComponentProps {
    title: string;
    icon?: JSX.Element;
    imageSrc?: string;
    onClick: () => void;
}

const LeaderboardPageClient = () => {
    const { leaderboardData, userRanking, connectedUser, isLoading, error } = useLeaderboardData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalProps, setModalProps] = useState({
        title: '',
        content: '',
        actionText: '',
        onAction: () => { },
        data: { hive_author: '' },
    });
    const [isOpen, setIsOpen] = useState(false);
    const [isHPPowerModalOpened, setIsHPPowerModalOpened] = useState(false);
    const [isAirdropFilterModalOpen, setIsAirdropFilterModalOpen] = useState(false);
    const [isAirdropModalOpen, setIsAirdropModalOpen] = useState(false);
    const [airdropSortOption, setAirdropSortOption] = useState<string>('points');
    const [airdropLimit, setAirdropLimit] = useState<number>(50);

    const openModal = (title: string, content: string, actionText: string, onAction: () => void, data: any) => {
        setModalProps({ title, content, actionText, onAction, data });
        setIsModalOpen(true);
    };

    const router = useRouter();
    const handleNavigate = useCallback(() => {
        router.push('https://api.skatehive.app');
    }, [router]);

    const handleLoginModal = useCallback(() => {
        setIsOpen(true);
    }, []);

    const handleAirdropConfirm = useCallback(() => {
        setIsAirdropFilterModalOpen(false);
        setIsAirdropModalOpen(true);
    }, []);

    const handleSetSortOption = useCallback((value: string) => {
        setAirdropSortOption(value);
    }, []);

    const handleSetLimit = useCallback((value: number) => {
        setAirdropLimit(value);
    }, []);

    const handleCloseFilterModal = useCallback(() => {
        setIsAirdropFilterModalOpen(false);
    }, []);

    // Only calculate airdrop data when filter modal is open or airdrop modal is open
    const shouldCalculateAirdrop = isAirdropFilterModalOpen || isAirdropModalOpen;
    
    // Use the new AirdropManager hook - MUST be called before any conditional returns
    const { airdropUsers, airdropStats, userCount } = useAirdropManager({
        leaderboardData: shouldCalculateAirdrop ? (leaderboardData || []) : [],
        sortOption: airdropSortOption,
        limit: airdropLimit
    });

    useEffect(() => {
        if (error) {
            console.error('Failed to load leaderboard data:', error);
        }
    }, [error]);

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
        <Container maxW="container.lg" mx="auto">
            <Box
                p={2}
                w="full"
                bg="black"
                borderRadius="md"
                boxShadow="lg"
                overflowX="hidden"
            >

                {connectedUser && userRanking !== undefined ? (
                    <ConnectedUserBanner
                        connectedUser={connectedUser}
                        userRanking={userRanking}
                        userData={leaderboardData && leaderboardData[userRanking - 1] ? leaderboardData[userRanking - 1] as DataBaseAuthor : { hive_author: '' }}
                        openModal={openModal}
                    />
                ) : (
                    <Box textAlign="center" m={10}>
                        <Button onClick={handleLoginModal} colorScheme="red" variant="solid">
                            Log in to see your stats
                        </Button>
                    </Box>
                )}
                {isOpen && (
                    <LoginModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
                )}
                <Text textAlign="center" fontSize="xl" color="lightgreen" textShadow="0 0 10px green">
                    We are {leaderboardData ? leaderboardData.length : 0} skaters supporting ourselves. 🛹
                </Text>
                <Center>
                    <Button
                        onClick={() => setIsAirdropFilterModalOpen(true)}
                        colorScheme="green"
                        variant="solid"
                        size="lg"
                        disabled={!leaderboardData}
                    >
                        🎯 Create Airdrop
                    </Button>
                </Center>

                {/* Uncomment the line below to see detailed airdrop processing stats */}
                {/* <AirdropDebugStats stats={airdropStats} sortOption={airdropSortOption} limit={airdropLimit} /> */}

                <LeaderboardTable data={leaderboardData || []} />

                <Button onClick={handleNavigate} colorScheme="green" variant="solid" size="lg">
                    Check the Complete List
                </Button>

                <LeaderboardModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    title={modalProps.title}
                    content={modalProps.content}
                    actionText={modalProps.actionText}
                    onAction={modalProps.onAction}
                    data={{ ...modalProps.data, hive_author: modalProps.data.hive_author || '' }}
                />

                <AirdropFilterModal
                    isOpen={isAirdropFilterModalOpen}
                    onClose={handleCloseFilterModal}
                    sortOption={airdropSortOption}
                    setSortOption={handleSetSortOption}
                    limit={airdropLimit}
                    setLimit={handleSetLimit}
                    userCount={userCount}
                    onConfirm={handleAirdropConfirm}
                />

                <AirdropModal
                    isOpen={isAirdropModalOpen}
                    onClose={() => setIsAirdropModalOpen(false)}
                    sortedComments={airdropUsers}
                />
            </Box>
        </Container>
    );
};

export default LeaderboardPageClient;
