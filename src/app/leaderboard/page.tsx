import { Box, Button, Center, HStack, Text } from '@chakra-ui/react';
import LeaderboardPageClient from '@/components/Leaderboard/LeaderboardPageClient';
import Link from 'next/link';
import { IoArrowBack } from 'react-icons/io5';

const LeaderboardPage = () => {
    return (
        <Box p={5} minH={'100vw'}>
            <HStack justifyContent="space-between" alignItems="center">
                <Link href="/" passHref>
                    <IoArrowBack size={30} />
                </Link>
                <Center flex="1">
                    <Text textAlign="center" fontSize="3xl" color="lightgreen" textShadow="0 0 10px green">                        Skatehive Leaderboard
                    </Text>
                </Center>
            </HStack>
            <LeaderboardPageClient />

        </Box>
    );
};

export default LeaderboardPage;
