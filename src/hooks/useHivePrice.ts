// lets create a useHivePrice hook that will fetch the current price of HIVE from coingecko API.

import { useEffect, useState } from "react";
import axios from "axios";

// Define the hook
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

        console.log(hivePrice);
    }, []);

    return hivePrice;
};