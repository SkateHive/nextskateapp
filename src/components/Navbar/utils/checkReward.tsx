import HiveClient from "@/lib/hive/hiveclient";

interface Asset {
    toString(): string;
}

interface ExtendedAccount {
    reward_hbd_balance: string | Asset;
    reward_hive_balance: string | Asset;
    reward_vesting_hive: string | Asset;
}

export default async function checkRewards(username: string): Promise<boolean> {
    const client = HiveClient;
    try {
        const result: ExtendedAccount[] = await client.database.getAccounts([username]);

        if (result && result.length > 0) {
            const account = result[0];
            const getBalance = (balance: string | Asset): number => {
                const balanceStr = typeof balance === 'string' ? balance : balance.toString();
                return Number(balanceStr.split(' ')[0]);
            };

            const hbdBalance = getBalance(account.reward_hbd_balance);
            const hiveBalance = getBalance(account.reward_hive_balance);
            const vestingHive = getBalance(account.reward_vesting_hive);

            const hasRewards = hbdBalance > 0 || hiveBalance > 0 || vestingHive > 0;
            console.log(hasRewards ? "User has rewards" : "User has no rewards");
            return hasRewards;
        } else {
            console.error("Account data not found.");
            return false;
        }
    } catch (error) {
        console.error("Error fetching account data:", error);
        return false;
    }
}
