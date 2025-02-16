'use client'
import { Button, Icon, useToast } from "@chakra-ui/react";
import { FaHive } from "react-icons/fa";
import { useState, useEffect } from "react";
import Confetti from 'react-confetti';
import HiveClient from "@/lib/hive/hiveclient";
import { HiveAccount } from "@/lib/useHiveAuth";
import { claimRewards } from "./utils/claimRewards";
import { keyframes } from "@emotion/react";

const blink = keyframes`
  0% { color: gold; opacity: 1; }
  50% { opacity: 0.1; }
  100% { opacity: 1; }
`;

interface ClaimRewardsButtonProps {
    hiveAccount: HiveAccount;
}

const ClaimRewardsButton: React.FC<ClaimRewardsButtonProps> = ({ hiveAccount }) => {
    const [showConfetti, setShowConfetti] = useState(false);
    const [globalProps, setGlobalProps] = useState<any>(null);
    const toast = useToast();
    const client = HiveClient;

    useEffect(() => {
        const fetchGlobalProps = async () => {
            try {
                const props = await client.database.getDynamicGlobalProperties();
                setGlobalProps(props);
            } catch (error) {
                console.error("Failed to fetch global properties:", error);
            }
        };

        fetchGlobalProps();
    }, []);

    const handleClaimRewards = async () => {
        if (hiveAccount && globalProps) {
            const { reward_hive_balance, reward_hbd_balance, reward_vesting_balance } = hiveAccount;

            try {
                const totalVestingShares = parseFloat(globalProps.total_vesting_shares.split(" ")[0]);
                const totalVestingFundHive = parseFloat(globalProps.total_vesting_fund_hive.split(" ")[0]);

                // Convert reward_vesting_balance to Hive Power
                const vestingShares = parseFloat(reward_vesting_balance.toString().split(" ")[0]);
                const hivePower = (vestingShares / totalVestingShares) * totalVestingFundHive;

                // Claim rewards
                await claimRewards(hiveAccount);

                // Display a success toast with the claimed amounts
                toast({
                    title: "Rewards Claimed!",
                    description: `You claimed ${reward_hive_balance}, ${reward_hbd_balance}, and ${hivePower.toFixed(3)} HP.`,
                    status: "success",
                    duration: 5000,
                    isClosable: true,
                });

                // Show confetti
                setShowConfetti(true);
                setTimeout(() => setShowConfetti(false), 7000);
            } catch (error) {
                console.error("Failed to claim rewards:", error);

                // Display an error toast
                toast({
                    title: "Error Claiming Rewards",
                    description: "There was an issue claiming your rewards. Please try again.",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
            }
        }
    };

    return (
        <>
            {showConfetti && <Confetti />}
            <Button
                gap={0}
                leftIcon={<Icon as={FaHive} />}
                ml={-2}
                p={2}
                justifyContent={"center"}
                color="gold"
                variant="outline"
                border="1px dashed yellow"
                animation={`${blink} 5s linear infinite`}
                onClick={handleClaimRewards}
                _hover={{
                    animation: "none",
                }}
            >
                Rewards
            </Button>
        </>
    );
};

export default ClaimRewardsButton;
