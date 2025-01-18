'use client'
import { useHiveUser } from "@/contexts/UserContext";
import useHiveBalance from "@/hooks/useHiveBalance";
import {
    Avatar,
    Badge,
    Box,
    Button,
    HStack,
    Menu,
    MenuButton,
    MenuItem,
    MenuList,
    Text,
    Tooltip,
    VStack
} from "@chakra-ui/react";
import { Asset } from "@hiveio/dhive";
import { SendIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { BsArrowDownCircle, BsArrowUpCircle } from "react-icons/bs";

import { GiPiggyBank, GiReceiveMoney } from "react-icons/gi";
import CollapsibleBox from "./CollapsibleBox";
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
                w={{ base: "100%", sm: "95%" }} 
                gap={4}
                p={4}
                borderRadius="10px"
                bg="#201d21"
                color="white"
                fontSize={{ base: "sm", md: "md", lg: "lg" }}
                mx="auto"
            >
                <Menu>
                    <Tooltip display="none" label="Exchanging Hive for Hive Power is called 'Powering Up' or 'Staking'. Stake/Power up your HIVE tokens to have special abilities on the Skatehive: Larger voting power, increased curation rewards, and more resource credits to do transactions on Hive Blockchain. Hive Power increases at an APR of approximately 3.28%">
                        <MenuButton
                            p={{ base: 4, md: 6 }}
                            border="1px solid red"
                            width="100%"
                            as={Button}
                            leftIcon={<Avatar boxSize={{ base: "24px", md: "30px" }} src={HIVE_POWER_LOGO_URL} />}
                            variant="outline"
                            color="white"
                            _hover={{ bg: "red.700", border: "1px solid yellow" }}
                            _active={{ bg: "red.800", border: "1px solid yellow" }}
                            _focus={{ bg: "red.800", border: "1px solid yellow" }}
                        >
                            <HStack justifyContent="space-between">
                                <Text
                                    ml="10px"
                                    fontSize={{ base: "14px", md: "16px", lg: "20px" }}
                                    textShadow="0 0 10px black, 0 0 20px black, 0 0 10px red"
                                >
                                    {formatToOneDecimal(hivePower)}
                                </Text>
                                <Text>HP</Text>
                                <Badge colorScheme="green" color="green" variant="subtle">
                                    <Text fontSize={{ base: "12px", md: "14px", lg: "18px" }}>
                                        (${formatToOneDecimal(HPUsdValue)})
                                    </Text>
                                </Badge>
                            </HStack>
                        </MenuButton>
                    </Tooltip>
                    <MenuList bg="black">
                        <Tooltip
                            display="none"
                            label="Delegate HP (Hive Power) to another account. Use your HP to power another account. When updating an existing delegation the specified amount will replace the previous amount. If reducing a delegation to an account, it will take 5 days until the HP is available again in your account."
                        >
                            <MenuItem
                                bg="black"
                                icon={<SendIcon />}
                                _hover={{ bg: "red" }}
                                onClick={() => setIsHpDelegatesModalOpened(true)}
                            >
                                Delegate
                            </MenuItem>
                        </Tooltip>
                        <Tooltip
                            display="none"
                            label="Un-stake your HIVE by Powering-down in 13 week chunks. i.e., if you power down 1300 HP, you will get 100 HIVE back per week, for 13 weeks."
                        >
                            <MenuItem
                                bg="black"
                                _hover={{ bg: "red" }}
                                onClick={() => setIsHPPowerModalOpened(true)}
                            >
                                <Box
                                    as={BsArrowDownCircle}
                                    size="28px"
                                    boxSize={{ base: "24px", md: "28px" }}
                                />
                                Power Down
                            </MenuItem>

                        </Tooltip>
                    </MenuList>
                </Menu>
                <Menu>
                    <Tooltip display="none" label="The primary token of the Hive Blockchain. HIVE are tradeable tokens that may be transferred at anytime. HIVE can be converted to Hive Power in a process called powering up.">
                        <MenuButton
                            p={{ base: 4, md: 6 }}
                            border="1px solid red"
                            width="100%"
                            as={Button}
                            leftIcon={<Avatar boxSize={{ base: "24px", md: "30px" }} src={HIVE_LOGO_URL} />}
                            variant="outline"
                            color={'white'}
                            _hover={{ bg: "red.700", border: "1px solid yellow" }}
                            _active={{ bg: "red.800", border: "1px solid yellow" }}
                            _focus={{ bg: "red.800", border: "1px solid yellow" }}
                        >
                            <HStack justifyContent={"space-between"}>
                                <Text ml="10px"
                                    fontSize={{ base: "14px", md: "16px", lg: "20px" }}
                                    textShadow="0 0 10px black, 0 0 20px black, 0 0 10px red"
                                >
                                    {formatToOneDecimal(hiveUser?.balance)}
                                </Text>
                                <Text>
                                    HIVE
                                </Text>
                                <Badge
                                    colorScheme="green"
                                    color={"green"}
                                    variant="subtle">
                                    <Text fontSize={{ base: "12px", md: "14px", lg: "18px" }}> (${formatToOneDecimal(hiveUsdValue)})</Text>
                                </Badge>
                            </HStack>
                        </MenuButton>
                    </Tooltip>
                    <MenuList bg="black">
                        <MenuItem bg="black" icon={<SendIcon />} _hover={{ bg: "red" }} onClick={() => setIsHiveModalOpened(true)}>
                            Send HIVE
                        </MenuItem>
                        <MenuItem
                            bg="black"
                            _hover={{ bg: "red" }}
                            onClick={() => setIsHPPowerModalOpened(true)}
                        >
                            <Box
                                as={BsArrowUpCircle}
                                size="28px"
                                boxSize={{ base: "24px", md: "28px" }}
                            />
                            Power Up
                        </MenuItem>
                    </MenuList>

                </Menu>
                <Menu>
                    <Tooltip display="none" label="Another Hive token rewarded on posts. 1 HBD is worth $1 worth of Hive, regardless of the price of Hive. Moving HBD to your Savings will generate a 15.00% APR as defined by the witnesses">
                        <MenuButton
                            p={{ base: 4, md: 6 }}
                            border="1px solid red"
                            width="100%"
                            as={Button}
                            leftIcon={<Avatar borderRadius="none" boxSize={{ base: "24px", md: "30px" }} src={HBD_LOGO_URL} />}
                            variant="outline"
                            color={'white'}
                            _hover={{ bg: "red.700", border: "1px solid yellow" }}
                            _active={{ bg: "red.800", border: "1px solid yellow" }}
                            _focus={{ bg: "red.800", border: "1px solid yellow" }}
                        >
                            <HStack justifyContent={"space-between"}>
                                <Text ml="10px"
                                    fontSize={{ base: "14px", md: "16px", lg: "20px" }}
                                    textShadow="0 0 10px black, 0 0 20px black, 0 0 10px red"
                                >
                                    {formatToOneDecimal(hiveUser?.hbd_balance)}
                                </Text>
                                <Text>
                                    HBD
                                </Text>
                                <Badge
                                    colorScheme="green"
                                    color={"green"}
                                    variant="subtle">
                                    <Text fontSize={{ base: "12px", md: "14px", lg: "18px" }}> (${formatToOneDecimal(HBDUsdValue)})</Text>
                                </Badge>
                            </HStack>
                        </MenuButton>
                    </Tooltip>
                    <MenuList bg="black">
                        <MenuItem
                            bg="black"
                            _hover={{ bg: "red" }}
                            onClick={() => setIsHPPowerModalOpened(true)}
                        >
                            <Box
                                as={SendIcon}
                                size="28px"
                                boxSize={{ base: "24px", md: "28px" }}
                            />
                            Send HBD
                        </MenuItem>
                    </MenuList>
                </Menu>
                <Menu>
                    <Tooltip
                        display="none"
                        label="Balance is subject to 3 days withdraw waiting period. HBD in savings increases at 15.00% APR as defined by the witnesses"
                    >
                        <MenuButton
                            p={{ base: 4, md: 6 }}
                            border="1px solid red"
                            width="100%"
                            as={Button}
                            leftIcon={
                                <Avatar
                                    borderRadius="none"
                                    boxSize={{ base: "24px", md: "30px" }}
                                    src={SAVINGS_LOGO_URL}
                                />
                            }
                            variant="outline"
                            color={"white"}
                            _hover={{ bg: "red.700", border: "1px solid yellow" }}
                            _active={{ bg: "red.800", border: "1px solid yellow" }}
                            _focus={{ bg: "red.800", border: "1px solid yellow" }}
                        >
                            <HStack justifyContent={"space-between"}>
                                <Text
                                    ml="10px"
                                    fontSize={{ base: "14px", md: "16px", lg: "20px" }}
                                    textShadow="0 0 10px black, 0 0 20px black, 0 0 10px red"
                                >
                                    {formatToOneDecimal(hiveUser?.savings_hbd_balance)}
                                </Text>
                                <Text>Sav</Text>
                                <Badge
                                    colorScheme="green"
                                    variant="subtle"
                                    color={"green"}
                                    w={{ base: "auto", md: "fit-content" }}
                                    maxW={{ base: "50%", md: "auto" }}
                                    isTruncated
                                >
                                    <Text fontSize={{ base: "12px", md: "14px", lg: "18px" }} isTruncated>
                                        (${formatToOneDecimal(savingsUSDvalue)})
                                    </Text>
                                </Badge>
                            </HStack>
                        </MenuButton>
                    </Tooltip>
                    <MenuList bg="black">
                        <MenuItem
                            bg="black"
                            _hover={{ bg: "red" }}
                            onClick={() => setIsHPPowerModalOpened(true)}
                        >
                            <Box
                                as={GiPiggyBank}
                                size="28px"
                                boxSize={{ base: "24px", md: "28px" }}
                            />
                            Deposit HBD
                        </MenuItem>
                        <MenuItem
                            bg="black"
                            _hover={{ bg: "red" }}
                            onClick={() => setIsWithdrawHbdModalOp(true)}
                        >
                            <Box
                                as={GiReceiveMoney}
                                size="28px"
                                boxSize={{ base: "24px", md: "28px" }}
                            />
                            Withdraw HBD
                        </MenuItem>
                    </MenuList>
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
    )
};

export default HiveBox;