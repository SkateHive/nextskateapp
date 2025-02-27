import HiveClient from "@/lib/hive/hiveclient";

export const rewardFund = async () => {
    const client = HiveClient;
    return await client.database.call('get_reward_fund', ['post']);
}

export const getFeedHistory = async () => {
    const client = HiveClient;
    return await client.database.call('get_feed_history', []);
}

export const voting_value2 = async (user: any) => {
    const { voting_power = 0, vesting_shares = 0, received_vesting_shares = 0, delegated_vesting_shares = 0 } =
        user || {};

    const reward_fund = await rewardFund();
    const feed_history = await getFeedHistory();

    const { reward_balance, recent_claims } = reward_fund;
    const { base, quote } = feed_history.current_median_history;

    const baseNumeric = parseFloat(base.split(' ')[0]);
    const quoteNumeric = parseFloat(quote.split(' ')[0]);

    const hbdMedianPrice = baseNumeric / quoteNumeric;

    const rewardBalanceNumeric = parseFloat(reward_balance.split(' ')[0]);
    const recentClaimsNumeric = parseFloat(recent_claims);

    const vestingSharesNumeric = parseFloat(String(vesting_shares).split(' ')[0]);
    const receivedVestingSharesNumeric = parseFloat(String(received_vesting_shares).split(' ')[0]);
    const delegatedVestingSharesNumeric = parseFloat(String(delegated_vesting_shares).split(' ')[0]);

    const total_vests = vestingSharesNumeric + receivedVestingSharesNumeric - delegatedVestingSharesNumeric;
    const final_vest = total_vests * 1e6;

    const power = (voting_power * 10000 / 10000) / 50;
    const rshares = power * final_vest / 10000;

    const estimate = rshares / recentClaimsNumeric * rewardBalanceNumeric * hbdMedianPrice;
    console.log('estimate', estimate);
    return estimate;
}

