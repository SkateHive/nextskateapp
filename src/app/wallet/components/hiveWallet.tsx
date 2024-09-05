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
import { use, useEffect, useMemo, useState } from "react";
import { AiOutlineThunderbolt } from "react-icons/ai";
import { BsArrowDownCircleFill } from "react-icons/bs";
import { BsArrowDownCircle, BsArrowUpCircle } from "react-icons/bs";
import { FaEye, FaHive } from "react-icons/fa";
import { GiPiggyBank, GiReceiveMoney } from "react-icons/gi";
import HiveModals from "./HiveModals";
import useHiveAccount from "@/hooks/useHiveAccount";


const HIVE_LOGO_URL = "https://cryptologos.cc/logos/hive-blockchain-hive-logo.png";
const HBD_LOGO_URL = "https://i.ibb.co/C6TPhs3/HBD.png";
const SAVINGS_LOGO_URL = "https://i.ibb.co/rMVdTYt/savings-hive.png";
const HIVE_POWER_LOGO_URL = "https://i.ibb.co/C9bCZBp/hive-power.png";
const DEFAULT_AVATAR_URL = "https://i.gifer.com/origin/f1/f1a737e4cfba336f974af05abab62c8f_w200.gif";

interface HiveBoxProps {
    onNetWorthChange: (value: number) => void;
}

const formatToThreeDecimals = (value: string | number | Asset | undefined): string => {
    const parsedValue = typeof value === "string" ? parseFloat(value) : typeof value === "number" ? value : 0;
    return parsedValue && !isNaN(parsedValue) ? parsedValue.toFixed(3) : "0.000";
};

const HiveBox: React.FC<HiveBoxProps> = ({ onNetWorthChange }) => {
    const { hiveUser } = useHiveUser();
    const hiveUserName = hiveUser?.name || '';
    const hiveAccount = useHiveAccount(hiveUserName);

    const {
        balance,
        hbd_balance,
        savings_balance,
        savings_hbd_balance,
        vesting_withdraw_rate,
        delegated_vesting_shares
    } = hiveAccount.hiveAccount || {};

    const {
        hiveUsdValue,
        hivePower,
        HPthatUserDelegated,
        totalHP,
        HPUsdValue,
        delegatedHPUsdValue,
        HBDUsdValue,
        savingsUSDvalue,
        totalValue
    } = useHiveBalance(hiveUser);

    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpened, setIsModalOpened] = useState(false);
    const [isHiveModalOpened, setIsHiveModalOpened] = useState(false);
    const [isHbdModalOpened, setIsHbdModalOpened] = useState(false);
    const [isHivePowerModalOpened, setIsHivePowerModalOpened] = useState(false);
    const [isDepositHbdSavingsModalOpened, setIsDepositHbdSavingsModalOpened] = useState(false);
    const [isWithdrawHbdModalOpened, setIsWithdrawHbdModalOpened] = useState(false);
    const [isHpDelegatesModalOpened, setIsHpDelegatesModalOpened] = useState(false);
    const [hive_power, setHivePower] = useState(0);

    useEffect(() => {
        setHivePower(totalHP);
    }, []);

    const formattedValues = useMemo(() => ({
        hive: formatToThreeDecimals(balance),
        hbd: formatToThreeDecimals(hbd_balance),
        hivePower: formatToThreeDecimals(hive_power),
        savingsHbd: formatToThreeDecimals(savings_hbd_balance),
        withdrawHbd: formatToThreeDecimals(vesting_withdraw_rate),
        hpDelegates: formatToThreeDecimals(delegated_vesting_shares)
    }), [balance, hbd_balance, savings_balance, savings_hbd_balance, vesting_withdraw_rate, delegated_vesting_shares]);

    useEffect(() => {
        onNetWorthChange(totalValue);
        const loadingTimer = setTimeout(() => setIsLoading(false), 1000);
        return () => clearTimeout(loadingTimer);
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
                onClick={() => setIsModalOpened(!isModalOpened)}
            >
                <SkeletonCircle size="48px" isLoaded={!isLoading}>
                    <Avatar
                        boxSize="48px"
                        name={hiveUserName}
                        src={hiveUser?.metadata?.profile.profile_image || DEFAULT_AVATAR_URL}
                    >
                        <AvatarBadge boxSize="1.25em" bg="transparent" border="none">
                            <Skeleton isLoaded={!isLoading}>
                                <FaHive size={20} color="white" />
                            </Skeleton>
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
                        {hiveUserName || "Loading..."}
                    </Text>
                </SkeletonText>
                <FaEye size={30} color="white" />
            </HStack>

            <Skeleton startColor='white' endColor='red.500' isLoaded={!isLoading} minWidth="100%">
                <Box
                    border="1px solid white"
                    bg="red.700"
                    onClick={() => setIsModalOpened(!isModalOpened)}
                    cursor="pointer"
                >
                    <Center>
                        <VStack m={5}>
                            <Tooltip label="Estimated Account Value: The estimated US dollars value is based on a 7-day average value of HIVE and HBD in your wallet.">
                                <Box padding="4px 8px">
                                    <SkeletonText isLoaded={!isLoading} noOfLines={1}>
                                        <Text
                                            color={"white"}
                                            fontWeight="bold"
                                            fontSize={{ base: 24, md: 34 }}
                                            textShadow="0 0 10px black, 0 0 20px black, 0 0 30px rgba(255, 255, 255, 0.4)"
                                        >
                                            ${formatToThreeDecimals(totalValue)}
                                        </Text>
                                    </SkeletonText>
                                </Box>
                            </Tooltip>
                        </VStack>
                    </Center>
                </Box>
            </Skeleton>

            {isModalOpened && (
                <Skeleton isLoaded={!isLoading} width="100%">
                    <Box>
                        <Center>
                            <VStack>
                                <Menu>
                                    <Tooltip display="none" label="Exchanging Hive for Hive Power is called 'Powering Up' or 'Staking'. Stake/Power up your HIVE tokens to have special abilities on the Skatehive: Larger voting power, increased curation rewards, and more resource credits to do transactions on Hive Blockchain. Hive Power increases at an APR of approximately 3.28%">
                                        <MenuButton
                                            p={8}
                                            border="1px solid red"
                                            width="full"
                                            as={Button}
                                            leftIcon={<Avatar boxSize="30px" src={HIVE_POWER_LOGO_URL} />}
                                            variant="outline"
                                            color={'white'}
                                            _hover={{ color: 'yellow', bg: 'black', border: '1px solid yellow' }}
                                            _active={{ color: 'yellow', bg: 'black', border: '1px solid yellow' }}
                                            _focus={{ color: 'yellow', bg: 'black', border: '1px solid yellow' }}
                                        >
                                            <HStack justifyContent={"space-between"}>
                                                <Text ml={'10px'} fontSize={{ base: 12, md: 14 }}
                                                    textShadow="0 0 10px black, 0 0 20px black, 0 0 10px red"
                                                >
                                                    {formattedValues.hivePower}
                                                </Text>
                                                <Text>
                                                    HP
                                                </Text>
                                                <Badge colorScheme="green" color={"green"} variant="subtle">
                                                    (~${formatToThreeDecimals(HPUsdValue)})
                                                </Badge>
                                            </HStack>
                                        </MenuButton>
                                    </Tooltip>
                                    <MenuList bg="black">
                                        <Tooltip label="Delegate HP to another account. It takes 5 days to retrieve delegated HP.">
                                            <MenuItem bg="black" icon={<SendIcon />} _hover={{ bg: "red" }} onClick={() => setIsHpDelegatesModalOpened(true)}>
                                                Delegate
                                            </MenuItem>
                                        </Tooltip>
                                        <Tooltip display="none" label="Un-stake your HIVE by Powering-down in 13 week chunks. i. e. if you power down 1300 HP, you will get 100 HIVE back per week, for 13 weeks.">
                                            <MenuItem bg="black" icon={<BsArrowDownCircle size="28px" />} _hover={{ bg: "red" }} onClick={() => setIsHivePowerModalOpened(true)}>
                                                Power Down
                                            </MenuItem>
                                        </Tooltip>
                                    </MenuList>
                                </Menu>

                                {/* Hive Balance Menu */}
                                <Menu>
                                    <Tooltip label="The primary token of the Hive Blockchain. Convert to Hive Power to gain influence.">
                                        <MenuButton
                                            p={8}
                                            border="1px solid red"
                                            width="full"
                                            as={Button}
                                            leftIcon={<Avatar boxSize="30px" src={HIVE_LOGO_URL} />}
                                            variant="outline"
                                            color={'white'}
                                            _hover={{ color: 'yellow', bg: 'black', border: '1px solid yellow' }}
                                            _active={{ color: 'yellow', bg: 'black', border: '1px solid yellow' }}
                                            _focus={{ color: 'yellow', bg: 'black', border: '1px solid yellow' }}
                                        >
                                            <HStack justifyContent={"space-between"}>
                                                <Text ml={'10px'} fontSize={{ base: 12, md: 14 }}
                                                    textShadow="0 0 10px black, 0 0 20px black, 0 0 10px red"
                                                >
                                                    {formattedValues.hive}
                                                </Text>
                                                <Text>
                                                    HIVE
                                                </Text>
                                                <Badge colorScheme="green" color={"green"} variant="subtle">
                                                    (${formatToThreeDecimals(hiveUsdValue)})
                                                </Badge>
                                            </HStack>
                                        </MenuButton>
                                    </Tooltip>
                                    <MenuList bg="black">
                                        <MenuItem bg="black" icon={<SendIcon />} _hover={{ bg: "red" }} onClick={() => setIsHiveModalOpened(true)}>
                                            Send HIVE
                                        </MenuItem>
                                        <MenuItem bg="black" icon={<BsArrowUpCircle size="28px" />} _hover={{ bg: "red" }} onClick={() => setIsHivePowerModalOpened(true)}>
                                            Power Up
                                        </MenuItem>
                                    </MenuList>
                                </Menu>

                                {/* HBD Balance Menu */}
                                <Menu>
                                    <Tooltip label="Another Hive token with a value of $1. Moving HBD to savings generates 15.00% APR.">
                                        <MenuButton
                                            p={8}
                                            border="1px solid red"
                                            width="full"
                                            as={Button}
                                            leftIcon={<Avatar boxSize="30px" src={HBD_LOGO_URL} />}
                                            variant="outline"
                                            color={'white'}
                                            _hover={{ color: 'yellow', bg: 'black', border: '1px solid yellow' }}
                                            _active={{ color: 'yellow', bg: 'black', border: '1px solid yellow' }}
                                            _focus={{ color: 'yellow', bg: 'black', border: '1px solid yellow' }}
                                        >
                                            <HStack justifyContent={"space-between"}>
                                                <Text ml={'10px'} fontSize={{ base: 12, md: 14 }}
                                                    textShadow="0 0 10px black, 0 0 20px black, 0 0 10px red"
                                                >
                                                    {formattedValues.hbd}
                                                </Text>
                                                <Text>
                                                    HBD
                                                </Text>
                                                <Badge colorScheme="green" color={"green"} variant="subtle">
                                                    (${formatToThreeDecimals(HBDUsdValue)})
                                                </Badge>
                                            </HStack>
                                        </MenuButton>
                                    </Tooltip>
                                    <MenuList bg="black">
                                        <MenuItem bg="black" icon={<SendIcon />} _hover={{ bg: "red" }} onClick={() => setIsHbdModalOpened(true)}>
                                            Send HBD
                                        </MenuItem>
                                    </MenuList>
                                </Menu>

                                {/* Savings HBD Menu */}
                                <Menu>
                                    <Tooltip label="Balance is subject to a 3-day withdrawal period. HBD in savings earns 15.00% APR.">
                                        <MenuButton
                                            p={8}
                                            border="1px solid red"
                                            width="full"
                                            as={Button}
                                            leftIcon={<Avatar boxSize="30px" src={SAVINGS_LOGO_URL} />}
                                            variant="outline"
                                            color={'white'}
                                            _hover={{ color: 'yellow', bg: 'black', border: '1px solid yellow' }}
                                            _active={{ color: 'yellow', bg: 'black', border: '1px solid yellow' }}
                                            _focus={{ color: 'yellow', bg: 'black', border: '1px solid yellow' }}
                                        >
                                            <HStack justifyContent={"space-between"}>
                                                <Text ml={'10px'} fontSize={{ base: 12, md: 14 }}
                                                    textShadow="0 0 10px black, 0 0 20px black, 0 0 10px red"
                                                >
                                                    {formattedValues.savingsHbd}
                                                </Text>
                                                <Text>
                                                    Sav
                                                </Text>
                                                <Badge colorScheme="green" variant="subtle" color={"green"}>
                                                    (~${formatToThreeDecimals(savingsUSDvalue)})
                                                </Badge>
                                            </HStack>
                                        </MenuButton>
                                    </Tooltip>
                                    <MenuList bg="black">
                                        <MenuItem bg="black" icon={<GiPiggyBank size="32px" />} _hover={{ bg: "red" }} onClick={() => setIsDepositHbdSavingsModalOpened(true)}>
                                            Deposit HBD
                                        </MenuItem>
                                        <MenuItem bg="black" icon={<GiReceiveMoney size="32px" />} _hover={{ bg: "red" }} onClick={() => setIsWithdrawHbdModalOpened(true)}>
                                            Withdraw HBD
                                        </MenuItem>
                                    </MenuList>
                                </Menu>
                                <Button
                                    leftIcon={<BsArrowUpCircle size="28px" />}
                                    w={'full'}
                                    flex={1}
                                    colorScheme="red"
                                    onClick={() => setIsHivePowerModalOpened(true)}
                                    mt={'20px'}
                                    border="1px solid black"
                                    _hover={{ color: 'yellow', bg: 'black', border: '1px solid yellow' }}
                                    _active={{ color: 'yellow', bg: 'black', border: '1px solid yellow' }}
                                    _focus={{ color: 'yellow', bg: 'black', border: '1px solid yellow' }}

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
                isHPPowerModalOpened={isHivePowerModalOpened}
                setIsHPPowerModalOpened={setIsHivePowerModalOpened}
                isHpDelegatesModalOpened={isHpDelegatesModalOpened}
                setIsHpDelegatesModalOpened={setIsHpDelegatesModalOpened}
                setIsWithdrawHbdModalOp={setIsWithdrawHbdModalOpened}
            />
        </VStack>
    );
};

export default HiveBox;
