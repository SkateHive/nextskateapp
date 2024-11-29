import { useEffect, useState } from 'react';

const useHiveData = (voteWeight: number, hiveUserName: string) => {
    const [rshares, setRshares] = useState(0);
    const [estimatedPayout, setEstimatedPayout] = useState(0);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchHiveData = async () => {
            try {
                const rewardFundResponse = await fetch('https://api.hive.blog', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        jsonrpc: '2.0',
                        method: 'condenser_api.get_reward_fund',
                        params: ['post'],
                        id: 1,
                    }),
                });
                const rewardFundData = await rewardFundResponse.json();
                const rewardBalance = parseFloat(rewardFundData.result.reward_balance.replace(' HIVE', ''));
                const recentClaims = rewardFundData.result.recent_claims;

                const accountResponse = await fetch('https://api.hive.blog', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        jsonrpc: '2.0',
                        method: 'condenser_api.get_accounts',
                        params: [[hiveUserName]],
                        id: 1,
                    }),
                });
                const accountData = await accountResponse.json();
                const account = accountData.result[0];
                const vestingShares = parseFloat(account.vesting_shares.replace(' VESTS', ''));
                const delegatedVestingShares = parseFloat(account.delegated_vesting_shares.replace(' VESTS', ''));
                const receivedVestingShares = parseFloat(account.received_vesting_shares.replace(' VESTS', ''));
                const votingPower = account.voting_power;

                const priceResponse = await fetch('https://api.hive.blog', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        jsonrpc: '2.0',
                        method: 'condenser_api.get_current_median_history_price',
                        params: [],
                        id: 1,
                    }),
                });
                const priceData = await priceResponse.json();
                const hbdMedianPrice = parseFloat(priceData.result.base.replace(' HBD', ''));

                const totalVests = vestingShares + receivedVestingShares - delegatedVestingShares;
                const finalVest = totalVests * 1e6;

                const power = (votingPower * voteWeight / 10000) / 50;
                const calculatedRshares = power * finalVest / 10000;

                // Atualiza o estado de rshares
                setRshares(calculatedRshares);

                const estimate = (calculatedRshares / recentClaims) * rewardBalance * hbdMedianPrice;
                setEstimatedPayout(estimate);
            } catch (err) {
                console.error('Erro ao obter dados da API Hive:', err);
                setError('Erro ao buscar dados da Hive');
            }
        };

        fetchHiveData();
    }, [voteWeight, hiveUserName]);

    return { rshares, estimatedPayout, error };
};

export default useHiveData;
