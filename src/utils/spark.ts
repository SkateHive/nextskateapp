import { formatEther, parseEther } from 'viem';

const SPARK_TO_ETH_MULTIPLIER = 1e6; // 1 Spark = 10^-6 ETH

export const convertSparksToEth = (sparks: string) => {
  const eth = (parseFloat(sparks) / SPARK_TO_ETH_MULTIPLIER).toFixed(6);
  return eth;
};

export const convertEthToSparks = (eth: string) => {
  const sparks = (parseFloat(eth) * SPARK_TO_ETH_MULTIPLIER).toFixed(0);
  return sparks;
};

function sparksToWei(sparks: number): bigint {
  return parseEther(convertSparksToEth(sparks.toString()));
}

export function weiToSparks(wei: bigint): string {
  return convertEthToSparks(formatEther(wei));
}
