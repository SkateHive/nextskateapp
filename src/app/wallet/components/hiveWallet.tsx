'use client'
import { useHiveUser } from "@/contexts/UserContext"
import { useHivePrice } from "@/hooks/useHivePrice"
import { claimRewards } from "@/components/Navbar/utils/claimRewards"
import {
    Avatar,
    Box,
    Button,
    Center,
    Divider,
    HStack,
    Menu,
    MenuButton,
    MenuItem,
    MenuList,
    Text,
    Tooltip,
    VStack
} from "@chakra-ui/react"
import { SendIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { AiOutlineThunderbolt } from "react-icons/ai"
import { BsArrowDownCircleFill } from "react-icons/bs"
import { FaGift, FaHive } from "react-icons/fa"
import { convertVestingSharesToHivePower } from "../utils/calculateHP"
const HIVE_LOGO_URL = "https://cryptologos.cc/logos/hive-blockchain-hive-logo.png";
const HBD_LOGO_URL = "https://i.ibb.co/C6TPhs3/HBD.png";
const SAVINGS_LOGO_URL = "https://i.ibb.co/rMVdTYt/savings-hive.png";
const HIVE_POWER_LOGO_URL = "https://i.ibb.co/C9bCZBp/hive-power.png";
const DEFAULT_AVATAR_URL = "https://i.gifer.com/origin/f1/f1a737e4cfba336f974af05abab62c8f_w200.gif";

interface HiveBoxProps {
    onNetWorthChange: (value: number) => void;
}

const HiveBox: React.FC<HiveBoxProps> = ({ onNetWorthChange }) => {
    const { hiveUser } = useHiveUser()
    const hivePrice = useHivePrice()

    const [hiveUsdValue, setHiveUsdValue] = useState(0)

    const vestingShares = hiveUser?.vesting_shares
    const delegatedVestingShares = hiveUser?.delegated_vesting_shares
    const receivedVestingShares = hiveUser?.received_vesting_shares
    const [hivePower, setHivePower] = useState(0)
    const [delegatedToUserInUSD, setDelegatedToUserInUSD] = useState('')
    const [HPthatUserDelegated, setHPthatUserDelegated] = useState(0)
    const [totalHP, setTotalHP] = useState(0)
    const [HPUsdValue, setHPUsdValue] = useState(0)
    const [delegatedHPUsdValue, setDelegatedHPUsdValue] = useState(0)

    const [HBDUsdValue, setHBDUsdValue] = useState(0)

    const [savingsUSDvalue, setSavingsUSDvalue] = useState(0)

    const [totalValue, setTotalValue] = useState(0)

    useEffect(() => {
        const calculateHP = async () => {
            const HP = await convertVestingSharesToHivePower(String(vestingShares), String(delegatedVestingShares), String(receivedVestingShares)).then((res) => {
                setDelegatedToUserInUSD(res.delegatedToUserInUSD)
                setHPthatUserDelegated(Number(res.DelegatedToSomeoneHivePower))
                const sum = Number(res.DelegatedToSomeoneHivePower) + Number(res.hivePower)
                setTotalHP(sum)
                setHivePower(sum)

            })
        }
        const calculateHiveUsdValue = () => {
            if (hivePrice && hiveUser) {
                const hiveUsd = hivePrice * Number(String(hiveUser.balance).split(" ")[0]);
                const HPUsd = hivePrice * Number(hivePower);
                const delegatedHPUsd = hivePrice * Number(delegatedHPUsdValue);
                const savingsValue = 1 * Number(String(hiveUser.savings_hbd_balance).split(" ")[0]);
                const HBDUsd = 1 * Number(String(hiveUser.hbd_balance).split(" ")[0]);
                const total = hiveUsd + HPUsd + HBDUsd + savingsValue;
                setHiveUsdValue(hiveUsd);
                setDelegatedHPUsdValue(delegatedHPUsd);
                setTotalValue(total);
                onNetWorthChange(total);
            }
        };

        calculateHP();
        calculateHiveUsdValue();
    }, [hiveUser, hivePrice, vestingShares, delegatedVestingShares, receivedVestingShares, hivePower, HPthatUserDelegated, delegatedHPUsdValue, onNetWorthChange]);

    const [isOpened, setIsOpened] = useState(false);


    return (
        <VStack
            w={"100%"}
            gap={6} 
            align={"normal"}
            p={4}
            flex="1"
            bg="#201d21"
            borderRadius="10px"
            border="1px solid red"
        >
            <Center onClick={() => setIsOpened(!isOpened)}>
                <HStack cursor="pointer">
                    <FaHive />
                    <Text align="center" fontSize={{ base: 24, md: 28 }}>
                       
                    </Text>
                    {hiveUser && (
                        <Text fontSize={{ base: 18, md: 22 }}>
                            {hiveUser.name}
                        </Text>
                    )}
                </HStack>
            </Center>
            <Divider mt={-6} />
            {hiveUser ? (
                <VStack align="normal">
                    <Center>
                        <Box w="100%" paddingBottom={4}>
                            <HStack
                                minWidth="100%"
                                border="1px solid white"
                                p={5}
                                borderTopRadius={10}
                                mb={-6}
                                justifyContent="center"
                                bg="red.900"
                            >
                                <Avatar
                                    name={hiveUser.name}
                                    src={hiveUser.metadata?.profile.profile_image || DEFAULT_AVATAR_URL}
                                    borderRadius="100%"
                                    boxSize="48px"
                                    bg="gray.200"
                                />
                                <Tooltip
                                    border="1px solid red"
                                    color="black"
                                    bg="white"
                                    placement="right-start"
                                    label={
                                        <Text>
                                            Rewards to Claim: <br />
                                            HBD: {String(hiveUser.reward_hbd_balance)}<br />
                                            Hive: {String(hiveUser.reward_hive_balance)}<br />
                                            HP: {String(hiveUser.reward_vesting_hive)}
                                        </Text>
                                    }
                                >
                                    <FaGift onClick={() => claimRewards(hiveUser)} />
                                </Tooltip>
                            </HStack>
                        </Box>
                    </Center>
                    <Box
                        minWidth="100%"
                        border="1px solid white"
                        bg="red.700"
                        onClick={() => setIsOpened(!isOpened)}
                        cursor="pointer"
                    >
                        <Center>
                            <VStack m={5}>
                                <Box bg="#b32227" borderRadius="8px" padding="4px 8px">
                                    <Text fontWeight="bold" fontSize={{ base: 24, md: 34 }} color="#33000a">
                                        ${totalValue.toFixed(2)}
                                    </Text>
                                </Box>
                            </VStack>
                        </Center>
                    </Box>
                    {isOpened && (
                        <Box>
                            <Center>
                                <VStack width="100%">
                                    <Menu>
                                        <MenuButton
                                            width="full"
                                            p={8}
                                            border="1px solid red"
                                            as={Button}
                                            leftIcon={<Avatar boxSize="30px" src={HIVE_LOGO_URL} />}
                                            variant="outline"
                                        >
                                            <Center>
                                                <VStack>
                                                    <Text fontSize={{ base: 18, md: 24 }}>{String(hiveUser.balance)}</Text>
                                                    <Text fontSize={{ base: 10, md: 12 }}> (~${hiveUsdValue.toFixed(2)})</Text>
                                                </VStack>
                                            </Center>
                                        </MenuButton>
                                        <MenuList bg="black" minWidth="100%">
                                            <MenuItem bg="black" icon={<SendIcon />} _hover={{ bg: "red" }}>
                                                Send Hive
                                            </MenuItem>
                                            <MenuItem bg="black" icon={<AiOutlineThunderbolt size="28px" />} _hover={{ bg: "red" }}>
                                                Power Up
                                            </MenuItem>
                                        </MenuList>
                                    </Menu>
                                    <Menu>
                                        <MenuButton
                                            p={8}
                                            border="1px solid red"
                                            width="full"
                                            as={Button}
                                            leftIcon={<Avatar borderRadius="none" boxSize="30px" src={HBD_LOGO_URL} />}
                                            variant="outline"
                                        >
                                            <Center>
                                                <VStack>
                                                    <Text fontSize={{ base: 18, md: 24 }}>{String(hiveUser.hbd_balance)}</Text>
                                                    <Text fontSize={{ base: 10, md: 12 }}> (~${HBDUsdValue.toFixed(2)})</Text>
                                                </VStack>
                                            </Center>
                                        </MenuButton>
                                        <MenuList bg="black">
                                            <MenuItem bg="black" icon={<SendIcon />} _hover={{ bg: "red" }}>
                                                Send HBD
                                            </MenuItem>
                                            <MenuItem bg="black" icon={<BsArrowDownCircleFill size="28px" />} _hover={{ bg: "red" }}>
                                                Deposit HBD
                                            </MenuItem>
                                        </MenuList>
                                    </Menu>
                                    <Menu>
                                        <MenuButton
                                            p={8}
                                            border="1px solid red"
                                            width="full"
                                            as={Button}
                                            leftIcon={<Avatar borderRadius="none" boxSize="30px" src={SAVINGS_LOGO_URL} />}
                                            variant="outline"
                                        >
                                            <Center>
                                                <Tooltip label="20% APR">
                                                    <VStack>
                                                        <Text fontSize={{ base: 18, md: 24 }}>{String(hiveUser.savings_hbd_balance)}</Text>
                                                        <Text fontSize={{ base: 10, md: 12 }}> (~${savingsUSDvalue.toFixed(2)})</Text>
                                                    </VStack>
                                                </Tooltip>
                                            </Center>
                                        </MenuButton>
                                        <MenuList bg="black">
                                            <MenuItem bg="black" icon={<SendIcon />} _hover={{ bg: "red" }}>
                                                Withdraw HBD
                                            </MenuItem>
                                            <MenuItem bg="black" icon={<AiOutlineThunderbolt size="28px" />} _hover={{ bg: "red" }}>
                                                Deposit HBD
                                            </MenuItem>
                                        </MenuList>
                                    </Menu>
                                    <Menu>
                                        <MenuButton
                                            p={8}
                                            border="1px solid red"
                                            width="full"
                                            as={Button}
                                            leftIcon={<Avatar boxSize="30px" src={HIVE_POWER_LOGO_URL} />}
                                            variant="outline"
                                        >
                                            <Center>
                                                <VStack>
                                                    <Text fontSize={{ base: 18, md: 24 }}>{hivePower.toFixed(2)} HP</Text>
                                                    <Text fontSize={{ base: 10, md: 12 }}> (~${HPUsdValue.toFixed(2)})</Text>
                                                </VStack>
                                            </Center>
                                        </MenuButton>
                                        <MenuList bg="black">
                                            <MenuItem bg="black" icon={<SendIcon />} _hover={{ bg: "red" }}>
                                                Delegate
                                            </MenuItem>
                                            <MenuItem bg="black" icon={<AiOutlineThunderbolt size="28px" />} _hover={{ bg: "red" }}>
                                                Power Down
                                            </MenuItem>
                                        </MenuList>
                                    </Menu>
                                </VStack>
                            </Center>
                        </Box>
                    )}
                </VStack>
            ) : null}
        </VStack>
    );
};


export default HiveBox;