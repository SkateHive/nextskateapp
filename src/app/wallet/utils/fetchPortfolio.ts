import axios from "axios";

export const fetchPortfolio = async (address: string) => {
    try {
        const { data } = await axios.get(`https://pioneers.dev/api/v1/portfolio/${address}`);
        return data;
    } catch (error) {
        console.error("Failed to fetch portfolio", error);
        throw error;
    }
};
