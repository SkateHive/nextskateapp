export const convertVestingSharesToHivePower = async (
    vestingShares: string,
    delegatedVestingShares: string,
    receivedVestingShares: string
) => {
    const vestingSharesFloat = parseFloat(vestingShares.split(" ")[0]);
    const delegatedVestingSharesFloat = parseFloat(delegatedVestingShares.split(" ")[0]);
    const receivedVestingSharesFloat = parseFloat(receivedVestingShares.split(" ")[0]);
    const availableVESTS = vestingSharesFloat - delegatedVestingSharesFloat;

    const response = await fetch('https://api.hive.blog', {
        method: 'POST',
        body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'condenser_api.get_dynamic_global_properties',
            params: [],
            id: 1,
        }),
        headers: { 'Content-Type': 'application/json' },
    });
    const result = await response.json();
    const vestHive =
        (parseFloat(result.result.total_vesting_fund_hive) * availableVESTS) /
        parseFloat(result.result.total_vesting_shares);

    const DelegatedToSomeoneHivePower =
        (parseFloat(result.result.total_vesting_fund_hive) * delegatedVestingSharesFloat) /
        parseFloat(result.result.total_vesting_shares);

    const delegatedToUserInUSD = (parseFloat(result.result.total_vesting_fund_hive) * receivedVestingSharesFloat) /
        parseFloat(result.result.total_vesting_shares);
    const HPdelegatedToUser = (parseFloat(result.result.total_vesting_fund_hive) * receivedVestingSharesFloat) /
        parseFloat(result.result.total_vesting_shares);
    return {
        hivePower: vestHive.toFixed(3),
        DelegatedToSomeoneHivePower: DelegatedToSomeoneHivePower.toFixed(3),
        delegatedToUserInUSD: delegatedToUserInUSD.toFixed(3),
        HPdelegatedToUser: HPdelegatedToUser.toFixed(3),
    };
};