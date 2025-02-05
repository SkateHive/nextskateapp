'use client';

import React, { useState, useEffect } from 'react';
import { Box, Text, Button, Th, VStack, Image, Center } from '@chakra-ui/react';
import LeaderboardTable from '@/components/Leaderboard/LeaderboardTable';
import useLeaderboardData from '@/hooks/useLeaderboardData';
import LoginModal from '../Hive/Login/LoginModal';
import ConnectedUserBanner from './ConnectedUserBanner';
import { useRouter } from 'next/navigation';
import LeaderboardModal from '../ModalComponent';

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

    const openModal = (title: string, content: string, actionText: string, onAction: () => void, data: any) => {
        setModalProps({ title, content, actionText, onAction, data });
        setIsModalOpen(true);
    };

    const router = useRouter();
    const handleNavigate = () => {
        router.push('https://api.skatehive.app');
    };

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
                <ConnectedUserBanner
                    connectedUser={connectedUser}
                    userRanking={userRanking}
                    userData={leaderboardData[userRanking - 1]}
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
                We are {leaderboardData.length} skaters supporting ourselves. 🛹
            </Text>
            <LeaderboardTable data={leaderboardData} />
            <Center>
                <Button onClick={handleNavigate} colorScheme="green" variant="solid" mt={5}>
                    Check the Complete List
                </Button>
            </Center>
            <LeaderboardModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={modalProps.title}
                content={modalProps.content}
                actionText={modalProps.actionText}
                onAction={modalProps.onAction}
                data={{ ...modalProps.data, hive_author: modalProps.data.hive_author || '' }}
            />
        </Box>
    );
};

export default LeaderboardPageClient;
