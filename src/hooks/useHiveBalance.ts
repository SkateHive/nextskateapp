import { convertVestingSharesToHivePower } from "@/app/wallet/utils/calculateHP";
import { useHiveUser } from "@/contexts/UserContext";
import { useHivePrice } from "@/hooks/useHivePrice";
import { useEffect, useState } from "react";

interface HiveBalance {
    hiveUsdValue: number;
    hivePower: number;
    delegatedToUserInUSD: string;
    HPthatUserDelegated: number;
    totalHP: number;
    HPUsdValue: number;
    delegatedHPUsdValue: number;
    HBDUsdValue: number;
    savingsUSDvalue: number;
    totalValue: number;
}

const useHiveBalance = (): HiveBalance => {
    const { hiveUser } = useHiveUser();
    const hivePrice = useHivePrice();
    const [hiveUsdValue, setHiveUsdValue] = useState(0);
    const vestingShares = hiveUser?.vesting_shares;
    const delegatedVestingShares = hiveUser?.delegated_vesting_shares;
    const receivedVestingShares = hiveUser?.received_vesting_shares;
    const [hivePower, setHivePower] = useState(0);
    const [delegatedToUserInUSD, setDelegatedToUserInUSD] = useState('');
    const [HPthatUserDelegated, setHPthatUserDelegated] = useState(0);
    const [totalHP, setTotalHP] = useState(0);
    const [HPUsdValue, setHPUsdValue] = useState(0);
    const [delegatedHPUsdValue, setDelegatedHPUsdValue] = useState(0);
    const [HBDUsdValue, setHBDUsdValue] = useState(0);
    const [savingsUSDvalue, setSavingsUSDvalue] = useState(0);
    const [totalValue, setTotalValue] = useState(0);

    useEffect(() => {
        const calculateHP = async () => {
            try {
                const res = await convertVestingSharesToHivePower(
                    String(vestingShares),
                    String(delegatedVestingShares),
                    String(receivedVestingShares)
                );
                setDelegatedToUserInUSD(res.delegatedToUserInUSD);
                setHPthatUserDelegated(Number(res.DelegatedToSomeoneHivePower));
                const sum = Number(res.hivePower) + Number(res.DelegatedToSomeoneHivePower);
                setTotalHP(sum);
                setHivePower(Number(res.hivePower)); // Ensure to set hivePower correctly
                if (hivePrice !== null) {
                    setHPUsdValue(hivePrice * sum);
                }
            } catch (error) {
                console.error("Failed to calculate Hive Power:", error);
            }
        };

        const calculateHiveUsdValue = () => {
            try {
                if (hivePrice !== null && hiveUser) {
                    const hiveUsd = hivePrice * Number(String(hiveUser.balance).split(" ")[0]);
                    const delegatedHPUsd = hivePrice * HPthatUserDelegated;
                    const savingsValue = 1 * Number(String(hiveUser.savings_hbd_balance).split(" ")[0]);
                    const HBDUsd = 1 * Number(String(hiveUser.hbd_balance).split(" ")[0]);
                    const total = hiveUsd + HPUsdValue + HBDUsd + savingsValue;
                    setHiveUsdValue(hiveUsd);
                    setDelegatedHPUsdValue(delegatedHPUsd);
                    setHBDUsdValue(HBDUsd);
                    setSavingsUSDvalue(savingsValue);
                    setTotalValue(total);
                }
            } catch (error) {
                console.error("Failed to calculate Hive USD value:", error);
            }
        };

        calculateHP();
        calculateHiveUsdValue();
    }, [hiveUser, hivePrice, vestingShares, delegatedVestingShares, receivedVestingShares, HPthatUserDelegated, HPUsdValue]);

    return {
        hiveUsdValue,
        hivePower,
        delegatedToUserInUSD,
        HPthatUserDelegated,
        totalHP,
        HPUsdValue,
        delegatedHPUsdValue,
        HBDUsdValue,
        savingsUSDvalue,
        totalValue,
    };
};

export default useHiveBalance;
