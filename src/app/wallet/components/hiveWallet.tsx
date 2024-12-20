'use client';

import { useHiveUser } from "@/contexts/UserContext";
import useHiveBalance from "@/hooks/useHiveBalance";
import {
    Avatar,
    Badge,
    Box,
    Button,
    Center,
    HStack,
    Menu,
    MenuButton,
    MenuItem,
    MenuList,
    Skeleton,
    SkeletonCircle,
    SkeletonText,
    Text,
    Tooltip,
    VStack
} from "@chakra-ui/react";
import { Asset } from "@hiveio/dhive";
import { SendIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { BsArrowDownCircle, BsArrowUpCircle } from "react-icons/bs";
import { GiPiggyBank, GiReceiveMoney } from "react-icons/gi";
import HiveModals from "./HiveModals";
import CollapsibleBox from "./CollapsibleBox";

const HIVE_LOGO_URL = "/logos/hiveLogo.png";
const HBD_LOGO_URL = "https://i.ibb.co/C6TPhs3/HBD.png";
const SAVINGS_LOGO_URL = "https://i.ibb.co/rMVdTYt/savings-hive.png";
const HIVE_POWER_LOGO_URL = "https://i.ibb.co/C9bCZBp/hive-power.png";

interface HiveBoxProps {
    onNetWorthChange: (value: number) => void;
}

function formatToOneDecimal(value: string | number | Asset | undefined): string {
    if (typeof value === "string") {
        const num = parseFloat(value);
        return isNaN(num) ? "0.0" : num.toFixed(1);
    }
    if (typeof value === "number") {
        return value.toFixed(1);
    }
    return "0.0";
}

interface WalletItemProps {
    icon: string;
    label: string;
    value: string;
    usdValue: string;
    onClick: () => void;
    tooltip: string;
}

const WalletItem: React.FC<WalletItemProps> = ({ icon, label, value, usdValue, onClick, tooltip }) => (
    <Tooltip label={tooltip} hasArrow>
        <MenuButton
            p={6}
            border="1px solid red"
            width="100%"
            as={Button}
            leftIcon={<Avatar borderRadius={0} boxSize="30px" src={icon} />}
            variant="outline"
            color="white"
            _hover={{ bg: "red.700", border: "1px solid yellow" }}
            _active={{ bg: "red.800", border: "1px solid yellow" }}
            _focus={{ bg: "red.800", border: "1px solid yellow" }}
            onClick={onClick}
        >
            <HStack justifyContent="space-between" w="100%">
                <Text
                    ml="10px"
                    fontSize={{ base: 16, md: 20 }}
                    textShadow="0 0 10px black, 0 0 20px black, 0 0 10px red"
                >
                    {value}
                </Text>
                <Text>{label}</Text>
                <Badge colorScheme="green" variant="subtle">
                    <Text fontSize={{ base: 14, md: 18 }}>~${usdValue}</Text>
                </Badge>
            </HStack>
        </MenuButton>
    </Tooltip>
);

const HiveBox: React.FC<HiveBoxProps> = ({ onNetWorthChange }) => {
    const { hiveUser } = useHiveUser();
    const [isLoading, setIsLoading] = useState(true);
    const [isHiveModalOpened, setIsHiveModalOpened] = useState(false);
    const [isHbdModalOpened, setIsHbdModalOpened] = useState(false);
    const [isHivePowerModalOpened, setIsHivePowerModalOpened] = useState(false);
    const [isDepositHbdSavingsModalOpened, setIsDepositHbdSavingsModalOpened] = useState(false);
    const [isWithdrawHbdModalOpened, setIsWithdrawHbdModalOp] = useState(false);
    const [isHPPowerModalOpened, setIsHPPowerModalOpened] = useState(false);
    const [isHpDelegatesModalOpened, setIsHpDelegatesModalOpened] = useState(false);

    const {
        hiveUsdValue,
        hivePower,
        HPUsdValue,
        HBDUsdValue,
        savingsUSDvalue,
        totalValue,
    } = useHiveBalance(hiveUser);

    useEffect(() => {
        onNetWorthChange(totalValue);
        setTimeout(() => setIsLoading(false), 1000);
    }, [totalValue, onNetWorthChange]);

    return (
        <CollapsibleBox
            title="Hive Wallet"
            isLoading={isLoading}
            netWorth={totalValue}
            iconSrc={HIVE_LOGO_URL}
            address={hiveUser?.name}
            color="red"
            maxHeight="666px"
        >
            <VStack
                w="95%"
                gap={4}
                p={4}
                borderRadius="10px"
                bg="#201d21"
                color="white"
                fontSize={{ base: "sm", md: "md", lg: "lg" }}
                mx="auto"
            >
                <Menu>
                    <WalletItem
                        icon={HIVE_POWER_LOGO_URL}
                        label="HP"
                        value={formatToOneDecimal(hivePower)}
                        usdValue={formatToOneDecimal(HPUsdValue)}
                        onClick={() => setIsHivePowerModalOpened(true)}
                        tooltip="Stake/Power up your HIVE tokens for increased voting power, curation rewards, and resource credits."
                    />
                </Menu>
                <Menu>
                    <WalletItem
                        icon={HIVE_LOGO_URL}
                        label="HIVE"
                        value={formatToOneDecimal(hiveUser?.balance)}
                        usdValue={formatToOneDecimal(hiveUsdValue)}
                        onClick={() => setIsHiveModalOpened(true)}
                        tooltip="Tradeable tokens on the Hive Blockchain that can be powered up to Hive Power."
                    />
                </Menu>
                <Menu>
                    <WalletItem
                        icon={HBD_LOGO_URL}
                        label="HBD"
                        value={formatToOneDecimal(hiveUser?.hbd_balance)}
                        usdValue={formatToOneDecimal(HBDUsdValue)}
                        onClick={() => setIsHbdModalOpened(true)}
                        tooltip="HBD is pegged to ~$1 worth of Hive. Earn a 15% APR by moving HBD to Savings."
                    />
                </Menu>
                <Menu>
                    <WalletItem
                        icon={SAVINGS_LOGO_URL}
                        label="Savings"
                        value={formatToOneDecimal(hiveUser?.savings_hbd_balance)}
                        usdValue={formatToOneDecimal(savingsUSDvalue)}
                        onClick={() => setIsDepositHbdSavingsModalOpened(true)}
                        tooltip="Earn 15% APR on HBD in Savings. Withdrawals require a 3-day waiting period."
                    />
                </Menu>
                <Button
                    leftIcon={<BsArrowUpCircle size="24px" />}
                    w="full"
                    colorScheme="red"
                    onClick={() => setIsHivePowerModalOpened(true)}
                    mt={4}
                    border="1px solid yellow"
                    _hover={{ bg: "red.600", color: "yellow" }}
                    fontSize={{ base: "md", lg: "lg" }}
                >
                    Power Up!
                </Button>
            </VStack>
            <HiveModals
                isHiveModalOpened={isHiveModalOpened}
                setIsHiveModalOpened={setIsHiveModalOpened}
                isHbdModalOpened={isHbdModalOpened}
                setIsHbdModalOpened={setIsHbdModalOpened}
                isHivePowerModalOpened={isHivePowerModalOpened}
                setIsHivePowerModalOpened={setIsHivePowerModalOpened}
                isDepositHbdSavingsModalOpened={isDepositHbdSavingsModalOpened}
                setIsDepositHbdSavingsModalOpened={setIsDepositHbdSavingsModalOpened}
                isWithdrawHbdModalOpened={isWithdrawHbdModalOpened}
                setIsWithdrawHbdModalOp={setIsWithdrawHbdModalOp}
                isHPPowerModalOpened={isHPPowerModalOpened}
                setIsHPPowerModalOpened={setIsHPPowerModalOpened}
                isHpDelegatesModalOpened={isHpDelegatesModalOpened}
                setIsHpDelegatesModalOpened={setIsHpDelegatesModalOpened}
            />
        </CollapsibleBox>
    );
};

export default HiveBox;
