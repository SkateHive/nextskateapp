import { useEffect, useState } from 'react';

const useHiveData = (voteWeight: number, hiveUserName: string) => {
    const [rshares, setRshares] = useState<number | null>(null);
    const [estimatedPayout, setEstimatedPayout] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    // Cache data to avoid repeated calls
    const cacheKey = `${hiveUserName}_${voteWeight}`;
    const cacheExpirationKey = `${cacheKey}_timestamp`;

    useEffect(() => {
        const fetchHiveData = async () => {
            setLoading(true);
            
            try {
                // Check if there's valid cache
                const cachedData = localStorage.getItem(cacheKey);
                const cachedTimestamp = localStorage.getItem(cacheExpirationKey);
                const cacheIsExpired = cachedTimestamp && Date.now() - parseInt(cachedTimestamp) > 3600000; // 1 hour expiration

                // If the cache exists and is not expired, use the stored data
                if (cachedData && !cacheIsExpired) {
                    const cache = JSON.parse(cachedData);
                    setRshares(cache.rshares);
                    setEstimatedPayout(cache.estimatedPayout);
                    setLoading(false);
                    return; // Return without making a new request
                }

                // Otherwise, make the API request
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
                    throw new Error('Error fetching reward fund data');
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
                    throw new Error('Error fetching account data');
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
                    throw new Error('Error fetching HBD price');
                }

                const priceData = await priceResponse.json();
                const hbdMedianPrice = parseFloat(priceData.result.base.replace(' HBD', ''));

                // Calculate rshares and estimatedPayout
                const totalVests = vestingShares + receivedVestingShares - delegatedVestingShares;
                const finalVest = totalVests * 1e6;

                const power = (votingPower * voteWeight / 10000) / 50;
                const calculatedRshares = power * finalVest / 10000;
                const estimate = (calculatedRshares / recentClaims) * rewardBalance * hbdMedianPrice;

                // Save to cache and set the expiration time
                const dataToCache = { rshares: calculatedRshares, estimatedPayout: estimate };
                localStorage.setItem(cacheKey, JSON.stringify(dataToCache));
                localStorage.setItem(cacheExpirationKey, Date.now().toString());

                // Update state
                setRshares(calculatedRshares);
                setEstimatedPayout(estimate);
                setLoading(false);

            } catch (err) {
                console.error('Error fetching Hive API data:', err);
                setError('Error fetching Hive data');
                setLoading(false);
            }
        };

        if (hiveUserName && voteWeight) {
            fetchHiveData(); // Only fetch data if hiveUserName and voteWeight are available
        } else {
            setLoading(false); // If there's no username or vote weight, don't make the request
        }

    }, [cacheExpirationKey, cacheKey, hiveUserName, voteWeight]); // Runs only when `hiveUserName` or `voteWeight` changes

    return { rshares, estimatedPayout, error, loading };
};

export default useHiveData;
