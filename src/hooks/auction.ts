import { Auction, fetchAuction } from '@/services/auction';
import AUCTION_ABI from '@/utils/abis/auction';
import { DAO_ADDRESSES } from '@/utils/constants';
import { getConfig } from '@/utils/wagmi';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { readContract } from 'wagmi/actions';

export function useLastAuction(initialData?: Auction) {
  return useQuery({
    queryKey: ['auction'],
    queryFn: async () => {
      const auctions = await fetchAuction(
        DAO_ADDRESSES.token,
        'endTime',
        'desc',
        1
      );
      return auctions.length > 0 ? auctions[0] : undefined;
    },
    refetchOnMount: true,
    staleTime: 0,
    initialData: initialData,
  });
}

export const useAuction = () => {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const contractData = await readContract(getConfig(), {
          address: DAO_ADDRESSES.auction,
          abi: AUCTION_ABI,
          functionName: 'auction',
        });
        setData(contractData);
      } catch (error: any) {
        setError(error.message);
      }
    };

    fetchData();
  }, []);

  return { data, error };
};