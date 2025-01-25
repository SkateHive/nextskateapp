import { Box, Button, Text } from '@chakra-ui/react';
import LeaderboardPageClient from '@/components/Leaderboard/LeaderboardPageClient';

const LeaderboardPage = () => {

    return (
        <Box p={5}>
            <Text fontSize="2xl" mb={5}>
                Skatehive Leaderboard
            </Text>
            <LeaderboardPageClient />

        </Box>
    );
};

export default LeaderboardPage;
