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
import { useEffect, useState } from "react";
import { BsArrowDownCircle, BsArrowUpCircle } from "react-icons/bs";


import { FaEye, FaHive } from "react-icons/fa";
import { GiPiggyBank, GiReceiveMoney } from "react-icons/gi";
import HiveModals from "./HiveModals";


const HIVE_LOGO_URL = "https://cryptologos.cc/logos/hive-blockchain-hive-logo.png";
const HBD_LOGO_URL = "https://i.ibb.co/C6TPhs3/HBD.png";
const SAVINGS_LOGO_URL = "https://i.ibb.co/rMVdTYt/savings-hive.png";
const HIVE_POWER_LOGO_URL = "https://i.ibb.co/C9bCZBp/hive-power.png";
const DEFAULT_AVATAR_URL = "https://i.gifer.com/origin/f1/f1a737e4cfba336f974af05abab62c8f_w200.gif";

interface HiveBoxProps {
    onNetWorthChange: (value: number) => void;
}

function formatToTreDecimals(value: string | number | Asset | undefined): string {
    if (typeof value === "string") {
        const num = parseFloat(value);
        return isNaN(num) ? "0.00" : num.toFixed(3);
    }
    if (typeof value === "number") {
        return value.toFixed(2);
    }
    return "0.00";
}

const HiveBox: React.FC<HiveBoxProps> = ({ onNetWorthChange }) => {
    const { hiveUser } = useHiveUser();


    const balanceHive = hiveUser?.balance;
    const balanceHBD = hiveUser?.hbd_balance
    const balanceHivePower = hiveUser?.savings_balance;
    const DepositUSDvalue = hiveUser?.savings_hbd_balance;
    const WithdrawHbdValue = hiveUser?.vesting_withdraw_rate
    const HpDelegate = hiveUser?.delegated_vesting_shares

    const [isHiveModalOpened, setIsHiveModalOpened] = useState(false);
    const [isHbdModalOpened, setIsHbdModalOpened] = useState(false);
    const [isHivePowerModalOpened, setIsHivePowerModalOpened] = useState(false);
    const [isDepositHbdSavingsModalOpened, setIsDepositHbdSavingsModalOpened] = useState(false);
    const [isWithdrawHbdModalOpened, setIsWithdrawHbdModalOp] = useState(false);
    const [isHPPowerModalOpened, setIsHPPowerModalOpened] = useState(false);
    const [isHpDelegatesModalOpened, setIsHpDelegatesModalOpened] = useState(false);

    const [formattedAmountHive, setFormattedAmountHive] = useState("0.00");
    const [formattedAmountHivePower, setFormattedAmountHivePower] = useState("0.00");
    const [formattedAmountHbd, setFormattedAmountHbd] = useState("0.00");
    const [formattedDepositHbd, setFormattedDepositHbd] = useState("0.00");
    const [formattedWithdrawHbd, setFormattedWithdrawHbd] = useState("0.00");
    const [formattedHpDelegates, setFormattedHpDelegates] = useState('0.00')

    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpened, setIsOpened] = useState(false);

    const {
        hiveUsdValue,
        hivePower,
        HPthatUserDelegated,
        totalHP,
        HPUsdValue,
        delegatedHPUsdValue,
        HBDUsdValue,
        savingsUSDvalue,
        totalValue,
    } = useHiveBalance(hiveUser);

    useEffect(() => {
        onNetWorthChange(totalValue);
        setTimeout(() => setIsLoading(false), 1000);
    }, [totalValue, onNetWorthChange]);

    useEffect(() => {
        if (balanceHive) {
            setFormattedAmountHive(formatToTreDecimals(balanceHive));
        }
    }, [balanceHive]);

    useEffect(() => {
        if (balanceHBD) {
            setFormattedAmountHbd(formatToTreDecimals(balanceHBD));
        }
    }, [balanceHBD]);

    useEffect(() => {
        if (balanceHivePower) {
            setFormattedAmountHivePower(formatToTreDecimals(balanceHivePower));
        }
    }, [balanceHivePower]);

    useEffect(() => {
        if (DepositUSDvalue) {
            setFormattedDepositHbd(formatToTreDecimals(DepositUSDvalue));
        }
    }, [DepositUSDvalue])

    useEffect(() => {
        if (WithdrawHbdValue) {
            setFormattedWithdrawHbd(formatToTreDecimals(WithdrawHbdValue));
        }
    }, [WithdrawHbdValue]);

    useEffect(() => {
        if (HpDelegate) {
            setFormattedHpDelegates(formatToTreDecimals(HpDelegate));
        }
    }, [HpDelegate])

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
                onClick={() => setIsOpened(!isModalOpened)}
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
                                            ${formatToTreDecimals(totalValue)}
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
                                            _hover={{ bg: 'black', border: '1px solid yellow' }}
                                            _active={{ bg: 'black', border: '1px solid yellow' }}
                                            _focus={{ bg: 'black', border: '1px solid yellow' }}
                                        >
                                            <HStack justifyContent={"space-between"}>
                                                <Text ml={'10px'} fontSize={{ base: 12, md: 14 }}
                                                    textShadow="0 0 10px black, 0 0 20px black, 0 0 10px red"
                                                >
                                                    {formatToTreDecimals(hivePower)}</Text>
                                                <Text>
                                                    HP
                                                </Text>
                                                <Badge
                                                    colorScheme="green"
                                                    color={"green"}
                                                    variant="subtle">
                                                    <Text fontSize={{ base: 10, md: 12 }}>
                                                        (~${formatToTreDecimals(HPUsdValue)})</Text>
                                                </Badge>
                                            </HStack>
                                        </MenuButton>
                                    </Tooltip>
                                    <MenuList bg="black">
                                        <Tooltip display="none" label="Delegate HP (Hive Power) to another account. Use your HP to power another account. When updating an existing delegation the specified amount will replace the previous amount. If reducing a delegation to an account, it will take 5 days until the HP is available again in your account.">
                                            <MenuItem bg="black" icon={<SendIcon />} _hover={{ bg: "red" }} onClick={() => setIsHpDelegatesModalOpened(true)}>
                                                Delegate
                                            </MenuItem>
                                        </Tooltip>
                                        <Tooltip display="none" label="Un-stake your HIVE by Powering-down in 13 week chunks. i. e. if you power down 1300 HP, you will get 100 HIVE back per week, for 13 weeks.">
                                            <MenuItem bg="black" icon={<BsArrowDownCircle size="28px" />} _hover={{ bg: "red" }} onClick={() => setIsHPPowerModalOpened(true)}>
                                            <MenuItem bg="black" icon={<BsArrowDownCircle size="28px" />} _hover={{ bg: "red" }} onClick={() => setIsHPPowerModalOpened(true)}>
                                                Power Down
                                            </MenuItem>
                                        </Tooltip>
                                    </MenuList>
                                </Menu>
                                <Menu>
                                    <Tooltip display="none" label="The primary token of the Hive Blockchain. HIVE are tradeable tokens that may be transferred at anytime. HIVE can be converted to Hive Power in a process called powering up.">
                                        <MenuButton
                                            width="full"
                                            p={8}
                                            border="1px solid red"
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
                                                    {formatToTreDecimals(hiveUser?.balance)}
                                                </Text>
                                                <Text>
                                                    HIVE
                                                </Text>
                                                <Badge
                                                    colorScheme="green"
                                                    color={"green"}
                                                    variant="subtle">
                                                    <Text fontSize={{ base: 10, md: 12 }}> (${formatToTreDecimals(hiveUsdValue)})</Text>
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
                                <Menu>
                                    <Tooltip display="none" label="Another Hive token rewarded on posts. 1 HBD is worth ~$1 worth of Hive, regardless of the price of Hive. Moving HBD to your Savings will generate a 15.00% APR as defined by the witnesses">
                                        <MenuButton
                                            p={8}
                                            border="1px solid red"
                                            width="full"
                                            as={Button}
                                            leftIcon={<Avatar borderRadius="none" boxSize="30px" src={HBD_LOGO_URL} />}
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
                                                    {formatToTreDecimals(hiveUser?.hbd_balance)}
                                                </Text>
                                                <Text>
                                                    HBD
                                                </Text>
                                                <Badge
                                                    colorScheme="green"
                                                    color={"green"}
                                                    variant="subtle">
                                                    <Text fontSize={{ base: 10, md: 12 }}> (${formatToTreDecimals(HBDUsdValue)})</Text>
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
                                <Menu>
                                    <Tooltip display="none" label="Balance is subject to 3 days withdraw waiting period. HBD in savings increases at 15.00% APR as defined by the witnesses">
                                        <MenuButton
                                            p={8}
                                            border="1px solid red"
                                            width="full"
                                            as={Button}
                                            leftIcon={<Avatar borderRadius="none" boxSize="30px" src={SAVINGS_LOGO_URL} />}
                                            // leftIcon={<Box as="span" fontSize="24px">🐷</Box>}
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
                                                    {formatToTreDecimals(hiveUser?.savings_hbd_balance)}</Text>
                                                <Text>
                                                    Sav
                                                </Text>
                                                <Badge
                                                    colorScheme="green"
                                                    variant="subtle"
                                                    color={"green"}
                                                >

                                                    <Text fontSize={{ base: 10, md: 12 }}>
                                                        (~${formatToTreDecimals(savingsUSDvalue)})</Text>
                                                </Badge>
                                            </HStack>
                                        </MenuButton>
                                    </Tooltip>
                                    <MenuList bg="black">
                                        <MenuItem bg="black" icon={<GiPiggyBank size="32px" />} _hover={{ bg: "red" }} onClick={() => setIsDepositHbdSavingsModalOpened(true)}>
                                            Deposit HBD
                                        </MenuItem>
                                        <MenuItem bg="black" icon={<GiReceiveMoney size="32px" />} _hover={{ bg: "red" }} onClick={() => setIsWithdrawHbdModalOp(true)}>
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
                                    // border="1px solid black"
                                    border='1px solid yellow'

                                    _hover={{ color: 'yellow', bg: 'red', border: '1px solid black' }}
                                    _active={{ color: 'yellow', bg: 'red', border: '1px solid black' }}
                                    _focus={{ color: 'yellow', bg: 'red', border: '1px solid black' }}

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
