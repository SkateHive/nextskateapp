import useSWR from 'swr';
import { useHiveUser } from '@/contexts/UserContext';

// Define the LeaderboardData type
type LeaderboardData = {
    eth_address: string;
    giveth_donations_amount: number;
    giveth_donations_usd: number;
    gnars_balance: number;
    gnars_votes: number;
    has_voted_in_witness: boolean;
    hbd_balance: number;
    hbd_savings_balance: number;
    hive_author: string;
    hive_balance: number;
    hp_balance: number;
    id: number;
    last_post: string;
    last_updated: string;
    max_voting_power_usd: number;
    points: number;
    post_count: number;
    skatehive_nft_balance: number;
};

const fetcher = async (url: string) => {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch data from ${url}: ${response.statusText}`);
    }
    return response.json();
};

const useLeaderboardData = (hiveAuthor?: string) => {
    const { data, error, isValidating, mutate } = useSWR<LeaderboardData[]>(
        'https://api.skatehive.app/api/skatehive',
        fetcher
    );

    const sortedData = data?.sort((a, b) => b.points - a.points);

    const hiveUser = useHiveUser();
    const connectedUser = hiveUser?.hiveUser?.name;
    const targetUser = hiveAuthor || connectedUser;
    const userRanking = sortedData ? sortedData.findIndex((user) => user.hive_author === targetUser) + 1 : undefined;
    const userInfo = sortedData ? sortedData.find((user) => user.hive_author === targetUser) : undefined;

    return {
        leaderboardData: sortedData,
        isLoading: isValidating && !data,
        error,
        refresh: mutate,
        userRanking,
        userInfo,
        connectedUser
    };
};

export default useLeaderboardData;
