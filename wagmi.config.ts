import AUCTION_ABI from '@/utils/abis/auction';
import GOVERNOR_ABI from '@/utils/abis/governor';
import TOKEN_ABI from '@/utils/abis/token';
import { defineConfig, loadEnv } from '@wagmi/cli';
import { react } from '@wagmi/cli/plugins';
import { Address } from 'viem';

export default defineConfig(() => {
  const env = loadEnv({
    mode: process.env.NODE_ENV,
    envDir: process.cwd(),
  });
  const DAO_ADDRESSES = {
    token: env.NEXT_PUBLIC_TOKEN as Address,
    metadata: env.NEXT_PUBLIC_METADATA as Address,
    auction: env.NEXT_PUBLIC_AUCTION as Address,
    treasury: env.NEXT_PUBLIC_TREASURY as Address,
    governor: env.NEXT_PUBLIC_GOVERNOR as Address,
  };

  return {
    out: 'src/hooks/wagmiGenerated.ts',
    contracts: [
      {
        name: 'Auction',
        abi: AUCTION_ABI,
        address: DAO_ADDRESSES.auction,
      },
      {
        name: 'Token',
        abi: TOKEN_ABI,
        address: DAO_ADDRESSES.token,
      },
      {
        name: 'Governor',
        abi: GOVERNOR_ABI,
        address: DAO_ADDRESSES.governor,
      },
    ],
    plugins: [react()],
  };
});