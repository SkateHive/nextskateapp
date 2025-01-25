import useSWR from 'swr';
import { useHiveUser } from '@/contexts/UserContext';

const fetcher = async (url: string) => {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch data from ${url}: ${response.statusText}`);
    }
    return response.json();
};

const useLeaderboardData = () => {
    const { data, error, isValidating, mutate } = useSWR(
        'https://api.skatehive.app/api/skatehive',
        fetcher
    );

    const sortedData = data?.sort((a: any, b: any) => b.points - a.points);

    const hiveUser = useHiveUser();
    const connectedUser = hiveUser?.hiveUser?.name;
    const userRanking = sortedData?.findIndex((user: any) => user.hive_author === connectedUser) + 1;

    return {
        leaderboardData: sortedData,
        isLoading: isValidating && !data,
        error,
        refresh: mutate,
        userRanking,
        connectedUser
    };
};

export default useLeaderboardData;
