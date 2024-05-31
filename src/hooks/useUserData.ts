import HiveClient from "@/lib/hive/hiveclient";
import { useEffect, useState } from "react";

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
