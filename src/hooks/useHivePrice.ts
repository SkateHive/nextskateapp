import axios from "axios";
import { useEffect, useState } from "react";

export const useHivePrice = () => {
    const [hivePrice, setHivePrice] = useState<number | null>(null);

    useEffect(() => {
        axios
            .get("https://api.coingecko.com/api/v3/simple/price?ids=hive&vs_currencies=usd")
            .then((response) => {
                setHivePrice(response.data.hive.usd);
            })
            .catch((error) => {
                console.error("Error fetching Hive price: ", error);
            });

    }, []);

    return hivePrice;
};