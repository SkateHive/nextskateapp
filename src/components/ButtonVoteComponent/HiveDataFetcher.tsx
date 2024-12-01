import { useEffect, useState } from 'react';

const useHiveData = (voteWeight: number, hiveUserName: string) => {
    const [rshares, setRshares] = useState(0);
    const [estimatedPayout, setEstimatedPayout] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // Cache data to avoid repeated calls
    const cacheKey = `${hiveUserName}_${voteWeight}`;
    const cacheExpirationKey = `${cacheKey}_timestamp`;

    useEffect(() => {
        const fetchHiveData = async () => {
            setLoading(true);

            try {
                // Check if a cache already exists and if it has not expired
                const cachedData = localStorage.getItem(cacheKey);
                const cachedTimestamp = localStorage.getItem(cacheExpirationKey);
                const cacheIsExpired = cachedTimestamp && Date.now() - parseInt(cachedTimestamp) > 3600000;

                if (cachedData && !cacheIsExpired) {
                    const cache = JSON.parse(cachedData);
                    setRshares(cache.rshares);
                    setEstimatedPayout(cache.estimatedPayout);
                    setLoading(false);
                    return;
                }

                // If it is not in the cache or the cache has expired, make a request to the API
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

                if (!rewardFundResponse.ok) {
                    throw new Error('Erro ao obter os dados do fundo de recompensa');
                }

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

                if (!accountResponse.ok) {
                    throw new Error('Erro ao obter os dados da conta');
                }

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

                if (!priceResponse.ok) {
                    throw new Error('Erro ao obter o preço HBD');
                }

                const priceData = await priceResponse.json();
                const hbdMedianPrice = parseFloat(priceData.result.base.replace(' HBD', ''));

                // Cálculos de rshares e estimatedPayout
                const totalVests = vestingShares + receivedVestingShares - delegatedVestingShares;
                const finalVest = totalVests * 1e6;

                const power = (votingPower * voteWeight / 10000) / 50;
                const calculatedRshares = power * finalVest / 10000;
                const estimate = (calculatedRshares / recentClaims) * rewardBalance * hbdMedianPrice;

                // Salvar no cache e definir a data de expiração
                const dataToCache = { rshares: calculatedRshares, estimatedPayout: estimate };
                localStorage.setItem(cacheKey, JSON.stringify(dataToCache));
                localStorage.setItem(cacheExpirationKey, Date.now().toString());

                // Atualiza o estado
                setRshares(calculatedRshares);
                setEstimatedPayout(estimate);
                setLoading(false);

            } catch (err) {
                console.error('Erro ao obter dados da API Hive:', err);
                setError('Erro ao buscar dados da Hive');
                setLoading(false);
            }
        };

        if (hiveUserName) {
            fetchHiveData(); // Só faz a requisição se o hiveUserName estiver disponível
        }
    }, [hiveUserName, voteWeight]); // Reexecuta apenas quando `hiveUserName` ou `voteWeight` mudam

    return { rshares, estimatedPayout, error, loading };
};

export default useHiveData;
