import { convertVestingSharesToHivePower } from "@/app/wallet/utils/calculateHP";
import { useHivePrice } from "@/hooks/useHivePrice";
import { use, useEffect, useState } from "react";
import useHiveAccount from "./useHiveAccount";
import { HiveAccount } from "@/lib/useHiveAuth";

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

const useHiveBalance = (hiveUser: HiveAccount | null): HiveBalance => {
    const hivePrice = useHivePrice();
    const [hiveUsdValue, setHiveUsdValue] = useState(0);
    const hiveAccount = useHiveAccount(String(hiveUser?.name));
    const vestingShares = hiveAccount?.hiveAccount?.vesting_shares;
    const delegatedVestingShares = hiveAccount?.hiveAccount?.delegated_vesting_shares;
    const receivedVestingShares = hiveAccount?.hiveAccount?.received_vesting_shares;
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
                if (hivePrice !== null && hiveAccount?.hiveAccount) {
                    const hiveUsd = hivePrice * Number(String(hiveAccount?.hiveAccount?.balance).split(" ")[0]);
                    const delegatedHPUsd = hivePrice * HPthatUserDelegated;
                    const savingsValue = 1 * Number(String(hiveAccount.hiveAccount?.savings_hbd_balance).split(" ")[0]);
                    const HBDUsd = 1 * Number(String(hiveAccount.hiveAccount?.hbd_balance).split(" ")[0]);
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
