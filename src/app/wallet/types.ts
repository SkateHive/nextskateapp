export interface Token {
    address: string;
    balance: number;
    balanceRaw: string;
    balanceUSD: number;
    canExchange: boolean;
    coingeckoId: string;
    createdAt: string;
    dailyVolume: number;
    decimals: number;
    externallyVerified: boolean;
    hide: boolean;
    holdersEnabled: boolean;
    id: string;
    label: string | null;
    marketCap: number;
    name: string;
    networkId: number;
    price: number;
    priceUpdatedAt: string;
    status: string;
    symbol: string;
    totalSupply: string;
    updatedAt: string;
    verified: boolean;
}
export interface TokenDetail {
    address: string;
    assetCaip: string;
    key: string;
    network: string;
    token: Token;
    updatedAt: string;
}
export interface PortfolioData {
    nftUsdNetWorth: Record<string, string>;
    nfts: TokenDetail[]; // Assuming nfts follow a similar detailed structure.
    tokens: TokenDetail[];
    totalBalanceUSDApp: number;
    totalBalanceUsdTokens: number;
    totalNetWorth: number;
}

export interface BlockchainInfo {
    color: string;
    logo: string;
}

export const blockchainDictionary: Record<string, BlockchainInfo> = {
    arbitrum: {
        color: "#28A0F0",
        logo: "/logos/arbitrum_logo.png",
    },
    base: {
        color: "blue.200",
        logo: "/logos/base_logo.png",
    },
    "binance-smart-chain": {
        color: "#F0B90B",
        logo: "/logos/binance_smart_chain_logo.png",
    },
    ethereum: {
        color: "#627EEA",
        logo: "/logos/ethereum_logo.png",
    },
    fantom: {
        color: "#13B5EC",
        logo: "/logos/fantom_logo.png",
    },
    gnosis: {
        color: "green",
        logo: "/logos/gnosis_logo.png",
    },
    optimism: {
        color: "red.200",
        logo: "/logos/optimism_logo.png",
    },
    polygon: {
        color: "#8247E5",
        logo: "/logos/polygon_logo.png",
    },
};
