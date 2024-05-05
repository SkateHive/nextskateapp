import { HiveAccount } from "@/lib/useHiveAuth";
import HiveClient from "@/lib/hiveclient";

export default async function checkRewards(setHasRewards: any, user: HiveAccount) {
    const hiveUser = user;
    const client = HiveClient;
    const result = await client.database.getAccounts([hiveUser.name]);

    if (hiveUser) {
        const hbdBalance = Number((result[0].reward_hbd_balance as string).split(' ')[0]);
        const hiveBalance = Number((result[0].reward_hive_balance as string).split(' ')[0]);
        const vestingHive = Number((result[0].reward_vesting_hive as string).split(' ')[0]);

        if (hbdBalance > 0 || hiveBalance > 0 || vestingHive > 0) {
            setHasRewards(true);
        }
    }
}