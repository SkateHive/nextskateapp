'use client'
import { useHiveUser } from "@/contexts/UserContext";
import useHiveBalance from "@/hooks/useHiveBalance";
import {
    Avatar,
    AvatarBadge,
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
import { FaEye, FaHive } from "react-icons/fa";
import { GiPiggyBank, GiReceiveMoney } from "react-icons/gi";
import HiveModals from "./HiveModals";

const HIVE_LOGO_URL = "/logos/hiveLogo.png";
const HBD_LOGO_URL = "https://i.ibb.co/C6TPhs3/HBD.png";
const SAVINGS_LOGO_URL = "https://i.ibb.co/rMVdTYt/savings-hive.png";
const HIVE_POWER_LOGO_URL = "https://i.ibb.co/C9bCZBp/hive-power.png";
const DEFAULT_AVATAR_URL = "https://i.gifer.com/origin/f1/f1a737e4cfba336f974af05abab62c8f_w200.gif";

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
    <Tooltip display="none" label={tooltip}>
        <MenuButton
            p={8}
            border="1px solid red"
            width="100%" // Ensure full width
            as={Button}
            leftIcon={<Avatar boxSize="30px" src={icon} />}
            variant="outline"
            color={'white'}
            _hover={{ bg: 'black', border: '1px solid yellow' }}
            _active={{ bg: 'black', border: '1px solid yellow' }}
            _focus={{ bg: 'black', border: '1px solid yellow' }}
            fontSize={{ base: "sm", md: "md", lg: "lg" }}
            onClick={onClick}
        >
            <HStack justifyContent={"space-between"}>
                <Text ml={'10px'} fontSize={{ base: 20, md: 22 }} textShadow="0 0 10px black, 0 0 20px black, 0 0 10px red">
                    {value}
                </Text>
                <Text>{label}</Text>
                <Badge colorScheme="green" color={"green"} variant="subtle">
                    <Text fontSize={{ base: 18, md: 20 }}> (~${usdValue})</Text>
                </Badge>
            </HStack>
        </MenuButton>
    </Tooltip>
);


const HiveBox: React.FC<HiveBoxProps> = ({ onNetWorthChange }) => {
    const { hiveUser } = useHiveUser();
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpened, setIsOpened] = useState(false);
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
        <VStack
            w={"100%"}
            gap={6}
            flex="1"
            p={4}
            border="1px solid red"
            borderRadius="10px"
            bg="#201d21"
            m={2}
            color={"white"}
            fontSize={{ base: "sm", md: "md", lg: "lg" }}
        >
            <HStack
                w="100%"
                border="1px solid white"
                p={5}
                borderTopRadius={10}
                mb={-6}
                justifyContent="space-between"
                bg="red.900"
                cursor="pointer"
                onClick={() => setIsOpened(!isModalOpened)}
                fontSize={{ base: "sm", md: "md", lg: "lg" }}
            >
                <SkeletonCircle fitContent size="48px" isLoaded={!isLoading}>
                    <Avatar
                        boxSize="48px"
                        name={hiveUser?.name}
                        src={hiveUser?.metadata?.profile.profile_image || DEFAULT_AVATAR_URL}
                    >
                        <AvatarBadge boxSize="1.25em" bg="transparent" border="none">
                            <Skeleton fitContent isLoaded={!isLoading}>
                                <FaHive size={20} color="white" />
                            </Skeleton >
                        </AvatarBadge>
                    </Avatar>
                </SkeletonCircle>
                <SkeletonText isLoaded={!isLoading} noOfLines={1}>
                    <Text
                        fontSize={14}
                        maxWidth="200px"
                        whiteSpace="nowrap"
                        overflow="hidden"
                        textOverflow="ellipsis"
                        textAlign="center"
                    >
                        {hiveUser?.name || "Loading..."}
                    </Text>
                </SkeletonText>
                <FaEye size={30} color="white" />
            </HStack>

            <Skeleton startColor='white' endColor='red.500' fitContent isLoaded={!isLoading} minWidth="100%">
                <Box
                    border="1px solid white"
                    bg="red.700"
                    onClick={() => setIsOpened(!isModalOpened)}
                    cursor="pointer"
                    fontSize={{ base: "sm", md: "md", lg: "lg" }}
                >
                    <Center>
                        <VStack m={5}>
                            <Tooltip display="none" label="Estimated Account Value: The estimated US dollars value is based on a 7 day average value of HIVE and HBD in your wallet.">
                                <Box padding="4px 8px">
                                    <SkeletonText isLoaded={!isLoading} noOfLines={1}>
                                        <Text
                                            color={"white"}
                                            fontWeight="bold"
                                            fontSize={{ base: 24, md: 34 }}
                                            textShadow="0 0 10px black, 0 0 20px black, 0 0 30px rgba(255, 255, 255, 0.4)"
                                        >
                                            ${formatToOneDecimal(totalValue)}
                                        </Text>
                                    </SkeletonText>
                                </Box>
                            </Tooltip>
                        </VStack>
                    </Center>
                </Box>
            </Skeleton>
            {isModalOpened && (
                <Skeleton fitContent isLoaded={!isLoading} width="100%">
                    <Box fontSize={{ base: "sm", md: "md", lg: "lg" }}>
                        <Center>
                            <VStack
                                w="100%" // Parent container defines width
                                gap={6}
                                flex="1"
                                p={4}
                                border="1px solid red"
                                borderRadius="10px"
                                bg="#201d21"
                                m={2}
                                color="white"
                                fontSize={{ base: "sm", md: "md", lg: "lg" }}
                            >                                <Menu>
                                    <WalletItem
                                        icon={HIVE_POWER_LOGO_URL}
                                        label="HP"
                                        value={formatToOneDecimal(hivePower)}
                                        usdValue={formatToOneDecimal(HPUsdValue)}
                                        onClick={() => setIsHivePowerModalOpened(true)}
                                        tooltip="Exchanging Hive for Hive Power is called 'Powering Up' or 'Staking'. Stake/Power up your HIVE tokens to have special abilities on the Skatehive: Larger voting power, increased curation rewards, and more resource credits to do transactions on Hive Blockchain. Hive Power increases at an APR of approximately 3.28%"
                                    />
                                    <MenuList bg="black">
                                        <MenuItem bg="black" icon={<SendIcon />} _hover={{ bg: "red" }} onClick={() => setIsHpDelegatesModalOpened(true)}>
                                            Delegate
                                        </MenuItem>
                                        <MenuItem bg="black" icon={<BsArrowDownCircle size="28px" />} _hover={{ bg: "red" }} onClick={() => setIsHPPowerModalOpened(true)}>
                                            Power Down
                                        </MenuItem>
                                    </MenuList>
                                </Menu>
                                <Menu>
                                    <WalletItem
                                        icon={HIVE_LOGO_URL}
                                        label="HIVE"
                                        value={formatToOneDecimal(hiveUser?.balance)}
                                        usdValue={formatToOneDecimal(hiveUsdValue)}
                                        onClick={() => setIsHiveModalOpened(true)}
                                        tooltip="The primary token of the Hive Blockchain. HIVE are tradeable tokens that may be transferred at anytime. HIVE can be converted to Hive Power in a process called powering up."
                                    />
                                    <MenuList bg="black">
                                        <MenuItem bg="black" icon={<SendIcon />} _hover={{ bg: "red" }} onClick={() => setIsHiveModalOpened(true)}>
                                            Send HIVE
                                        </MenuItem>
                                        <MenuItem bg="black" icon={<BsArrowUpCircle size="28px" />} _hover={{ bg: "red" }} onClick={() => setIsHivePowerModalOpened(true)}>
                                            Power Up
                                        </MenuItem>
                                    </MenuList>
                                </Menu>
                                <Menu>
                                    <WalletItem
                                        icon={HBD_LOGO_URL}
                                        label="HBD"
                                        value={formatToOneDecimal(hiveUser?.hbd_balance)}
                                        usdValue={formatToOneDecimal(HBDUsdValue)}
                                        onClick={() => setIsHbdModalOpened(true)}
                                        tooltip="Another Hive token rewarded on posts. 1 HBD is worth ~$1 worth of Hive, regardless of the price of Hive. Moving HBD to your Savings will generate a 15.00% APR as defined by the witnesses"
                                    />
                                    <MenuList bg="black">
                                        <MenuItem bg="black" icon={<SendIcon />} _hover={{ bg: "red" }} onClick={() => setIsHbdModalOpened(true)}>
                                            Send HBD
                                        </MenuItem>
                                    </MenuList>
                                </Menu>
                                <Menu>
                                    <WalletItem
                                        icon={SAVINGS_LOGO_URL}
                                        label="Sav"
                                        value={formatToOneDecimal(hiveUser?.savings_hbd_balance)}
                                        usdValue={formatToOneDecimal(savingsUSDvalue)}
                                        onClick={() => setIsDepositHbdSavingsModalOpened(true)}
                                        tooltip="Balance is subject to 3 days withdraw waiting period. HBD in savings increases at 15.00% APR as defined by the witnesses"
                                    />
                                    <MenuList bg="black">
                                        <MenuItem bg="black" icon={<GiPiggyBank size="32px" />} _hover={{ bg: "red" }} onClick={() => setIsDepositHbdSavingsModalOpened(true)}>
                                            Deposit HBD
                                        </MenuItem>
                                        <MenuItem bg="black" icon={<GiReceiveMoney size="32px" />} _hover={{ bg: "red" }} onClick={() => setIsWithdrawHbdModalOp(true)}>
                                            Withdraw HBD
                                        </MenuItem>
                                    </MenuList>
                                </Menu>
                                <Button
                                    leftIcon={<BsArrowUpCircle size="28px" />}
                                    w={'full'}
                                    flex={1}
                                    colorScheme="black"
                                    onClick={() => setIsHivePowerModalOpened(true)}
                                    mt={'20px'}
                                    border='1px solid yellow'
                                    _hover={{ color: 'yellow', bg: 'red', border: '1px solid black' }}
                                    _active={{ color: 'yellow', bg: 'red', border: '1px solid black' }}
                                    _focus={{ color: 'yellow', bg: 'red', border: '1px solid black' }}
                                    fontSize={{ base: "sm", md: "md", lg: "lg" }}
                                >
                                    <Text fontSize={{ base: 26, md: 40 }} >POWER UP !</Text>
                                </Button>
                            </VStack >
                        </Center>
                    </Box>
                </Skeleton>
            )}

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
        </VStack>
    )
};

export default HiveBox;
