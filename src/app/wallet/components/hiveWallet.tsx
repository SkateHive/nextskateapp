'use client'
import { useHiveUser } from "@/contexts/UserContext";
import useHiveBalance from "@/hooks/useHiveBalance";
import {
    Avatar,
    AvatarBadge,
    Box,
    Button,
    Center,
    HStack,
    Image,
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
import { SendIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { AiOutlineThunderbolt } from "react-icons/ai";
import { BsArrowDownCircleFill } from "react-icons/bs";
import { FaEye, FaHive } from "react-icons/fa";

const HIVE_LOGO_URL = "https://cryptologos.cc/logos/hive-blockchain-hive-logo.png";
const HBD_LOGO_URL = "https://i.ibb.co/C6TPhs3/HBD.png";
const SAVINGS_LOGO_URL = "https://i.ibb.co/rMVdTYt/savings-hive.png";
const HIVE_POWER_LOGO_URL = "https://i.ibb.co/C9bCZBp/hive-power.png";
const DEFAULT_AVATAR_URL = "https://i.gifer.com/origin/f1/f1a737e4cfba336f974af05abab62c8f_w200.gif";

interface HiveBoxProps {
    onNetWorthChange: (value: number) => void;
}

const HiveBox: React.FC<HiveBoxProps> = ({ onNetWorthChange }) => {
    const { hiveUser } = useHiveUser();
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
    const [isModalOpened, setIsOpened] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        onNetWorthChange(totalValue);
        setTimeout(() => setIsLoading(false), 1000); // Simulate loading time
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
                onClick={() => setIsOpened(!isModalOpened)}
            >
                <SkeletonCircle size="48px" isLoaded={!isLoading}>
                    <Avatar
                        boxSize="48px"
                        name={hiveUser?.name}
                        src={hiveUser?.metadata?.profile.profile_image || DEFAULT_AVATAR_URL}
                    >
                        <AvatarBadge boxSize="1.25em" bg="transparent" border="none">
                            <Skeleton isLoaded={!isLoading}>
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
                        {hiveUser?.name}
                    </Text>
                </SkeletonText>
                <FaEye size={30} color="white" />
            </HStack>


            <Skeleton isLoaded={!isLoading} minWidth="100%">
                <Box
                    minWidth="100%"
                    border="1px solid white"
                    bg="red.700"
                    onClick={() => setIsOpened(!isModalOpened)}
                    cursor="pointer"
                >
                    <Center>
                        <VStack m={5}>
                            <SkeletonText isLoaded={!isLoading} noOfLines={1}>
                                <Box padding="4px 8px">
                                    <Text
                                        color={"white"}
                                        fontWeight="bold"
                                        fontSize={{ base: 24, md: 34 }}
                                        textShadow="0 0 10px black, 0 0 20px black, 0 0 30px rgba(255, 255, 255, 0.4)"
                                    >
                                        ${totalValue.toFixed(2)}
                                    </Text>
                                </Box>
                            </SkeletonText>
                        </VStack>
                    </Center>
                </Box>
            </Skeleton>

            {isModalOpened && (
                <Skeleton isLoaded={!isLoading} width="100%">
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
                                        color={'white'}
                                    >
                                        <Center>
                                            <VStack>
                                                <Text fontSize={{ base: 16, md: 20 }}>{String(hiveUser?.balance)}</Text>
                                                <Text fontSize={{ base: 10, md: 12 }}> (~${hiveUsdValue?.toFixed(2)})</Text>
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
                                        color={'white'}
                                    >
                                        <Center>
                                            <VStack>
                                                <Text fontSize={{ base: 16, md: 20 }}>{String(hiveUser?.hbd_balance)}</Text>
                                                <Text fontSize={{ base: 10, md: 12 }}> (~${HBDUsdValue?.toFixed(2)})</Text>
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
                                        color={'white'}
                                    >
                                        <Center>
                                            <Tooltip label="20% APR">
                                                <VStack>
                                                    <Text fontSize={{ base: 16, md: 20 }}>{String(hiveUser?.savings_hbd_balance)}</Text>
                                                    <Text fontSize={{ base: 10, md: 12 }}> (~${savingsUSDvalue?.toFixed(2)})</Text>
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
                                        color={'white'}
                                    >
                                        <Center>
                                            <VStack>
                                                <Text fontSize={{ base: 16, md: 20 }}>{hivePower?.toFixed(2)} HP</Text>
                                                <Text fontSize={{ base: 10, md: 12 }}> (~${HPUsdValue?.toFixed(2)})</Text>
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
                                <Button
                                    leftIcon={<AiOutlineThunderbolt size="28px" />}
                                    w={'full'}
                                    flex={1}
                                    colorScheme="red"
                                    onClick={() => setIsOpened(false)}
                                    mt={'20px'}
                                >
                                    <Text fontSize={{ base: 26, md: 40 }}>POWER UP !</Text>
                                </Button>

                            </VStack>
                        </Center>
                    </Box>
                </Skeleton>
            )}
        </VStack>
    );
};

export default HiveBox;
