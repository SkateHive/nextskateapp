import axios from "axios";
import { useEffect, useState } from "react";


export const useETHPrice = () => {
    const [EthPrice, setEthPrice] = useState<number | null>(null);

    useEffect(() => {
        axios
            .get("https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd")
            .then((response) => {
                setEthPrice(response.data.ethereum.usd);
            })
            .catch((error) => {
                console.error("Error fetching Hive price: ", error);
            });

    }, []);

    return EthPrice;
};