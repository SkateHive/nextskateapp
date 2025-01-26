import { Box, Button, Center, HStack, Text } from '@chakra-ui/react';
import LeaderboardPageClient from '@/components/Leaderboard/LeaderboardPageClient';
import Link from 'next/link';

const LeaderboardPage = () => {
    return (
        <Box p={5}>
            <HStack justifyContent="space-between">
                <Text fontSize="2xl">
                    Skatehive Leaderboard
                </Text>
                <Link href="/"
                    passHref
                >
                    Go Back
                </Link>
            </HStack>
            <LeaderboardPageClient />

        </Box>
    );
};

export default LeaderboardPage;
