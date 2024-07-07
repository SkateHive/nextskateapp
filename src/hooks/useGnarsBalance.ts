import { useEffect, useState } from "react";
import axios from "axios";
import { PortfolioData } from "@/app/wallet/types";
import { set } from "lodash";

const useGnarsBalance = (userWallet: string) => {
    const [userPortfolio, setUserPortfolio] = useState<PortfolioData | null>(null);
    const [gnarsNFTs, setGnarsNFTs] = useState<any>(null);
    const [gnarsBalance, setGnarsBalance] = useState<number>(0);
    const fetchGnarsBalanceData = async (userWallet: string) => {
        try {
            const portfolioResponse = await axios.get(`https://pioneers.dev/api/v1/portfolio/${userWallet.toUpperCase()}`);
            const portfolioData: PortfolioData = portfolioResponse.data;

            setUserPortfolio(portfolioData);

            // Extract Gnars NFTs from the nfts array
            const gnarsNFTs = portfolioData.nfts.filter((nft: any) => nft.token.collection.name === "Gnars");
            const gnarsNFTsLenght = gnarsNFTs.length;
            setGnarsNFTs(gnarsNFTs);
            setGnarsBalance(gnarsNFTsLenght);
        } catch (error) {
            console.error("Failed to fetch Gnars balance:", error);
        }
    }

    useEffect(() => {
        if (userWallet) {
            fetchGnarsBalanceData(userWallet);
        }
    }, [userWallet]);

    return { userPortfolio, gnarsNFTs, gnarsBalance };
}

export default useGnarsBalance;
