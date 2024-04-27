// lets create a hool that returns the user data on hive using a custom hook and a username prop 

import { useEffect, useState } from "react";
import * as dhive from "@hiveio/dhive";
import HiveClient from "@/lib/hive/hiveclient";

export const useUserData = (username: string) => {
    const [userData, setUserData] = useState<any | null>(null);

    useEffect(() => {
        const client = HiveClient;
        client.database.getAccounts([username]).then((result) => {
            setUserData(result[0]);
        });
    }, [username]);

    return userData;
};
