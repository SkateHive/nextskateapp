'use client';
import { useEffect, useMemo, useState } from 'react';
import {
    Badge,
    Box,
    Card,
    CardHeader,
    Center,
    Divider,
    HStack,
    Text,
    Tooltip,
    useMediaQuery,
    VStack,
    Menu,
    MenuButton,
    MenuList,
    MenuItem
} from "@chakra-ui/react";
import axios from 'axios';
import { useETHPrice } from '@/hooks/useETHprice';
import { Address } from 'viem';
import { mainnet, base } from 'viem/chains';
import { formatUnits } from 'viem/utils';
import { useBalance } from 'wagmi';

const HOT_ADDRESS = '0xB4964e1ecA55Db36a94e8aeFfBFBAb48529a2f6c' as Address
const OLD_MULTISIG_ADDRESS = '0x5501838d869B125EFd90daCf45cDFAC4ea192c12' as Address
const NEW_MULTISIG_ADDRESS = '0xc1afa4c0a70b622d7b71d42241bb4d52b6f3e218' as Address
const BASE_USDC_TOKEN_ADDRESS = '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913' as Address
const BUILDER_ADDRESS = '0x4c5086086fda01fb8fcffe491862e7504984a75f' as Address

const DaoTreasure = () => {
    const { data: oldMultisigBalance } = useBalance({
        address: OLD_MULTISIG_ADDRESS,
        chainId: mainnet.id
    });

    const { data: newMultisigBalance } = useBalance({
        address: NEW_MULTISIG_ADDRESS,
        chainId: base.id
    });

    const { data: newMultisigUsdcBalance } = useBalance({
        address: NEW_MULTISIG_ADDRESS,
        chainId: base.id,
        token: BASE_USDC_TOKEN_ADDRESS
    });

    const { data: BuilderBalance } = useBalance({
        address: BUILDER_ADDRESS,
        chainId: base.id
    });

    const [hotWalletBalance, setHotWalletBalance] = useState<number>(0);
    const ethPrice = useETHPrice() || 2400;

    const toEther = (balanceInWei: bigint): number => Number(formatUnits(balanceInWei, 18));

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`https://pioneers.dev/api/v1/portfolio/${HOT_ADDRESS}`);
                setHotWalletBalance(parseFloat(response.data.totalNetWorth) || 0);
            } catch (error) {
                console.error("Error fetching hot wallet balance:", error);
            }
        };
        fetchData();
    }, []);

    const totalJazz = useMemo(() => {
        const oldMultisigValue: number = oldMultisigBalance?.value ? toEther(oldMultisigBalance.value) * ethPrice : 0;
        const newMultisigValue: number = newMultisigBalance?.value ? toEther(newMultisigBalance.value) * ethPrice : 0;
        const newUsdcValue: number = newMultisigUsdcBalance?.value ? Number(formatUnits(newMultisigUsdcBalance.value, 6)) : 0;
        const builderValue: number = BuilderBalance?.value ? toEther(BuilderBalance.value) * ethPrice : 0;
        return Number(hotWalletBalance + oldMultisigValue + newMultisigValue + newUsdcValue + builderValue);
    }, [hotWalletBalance, oldMultisigBalance, newMultisigBalance, newMultisigUsdcBalance, ethPrice, BuilderBalance]);

    const isMobile = useMediaQuery("(max-width: 768px)")[0];

    const zapperLinks = {
        HOT_ADDRESS: `https://zapper.fi/account/${HOT_ADDRESS}`,
        OLD_MULTISIG_ADDRESS: `https://zapper.fi/account/${OLD_MULTISIG_ADDRESS}`,
        NEW_MULTISIG_ADDRESS: `https://zapper.fi/account/${NEW_MULTISIG_ADDRESS}`,
        BUILDER_ADDRESS: `https://zapper.fi/account/${BUILDER_ADDRESS}`
    };

    return (
        <Card
            bg="black"
            border="1px solid grey"
            borderBottomRadius="10px"
            borderTopRadius="0px"
            borderTop="0px"
            color="white"
            mb={2}
        >
            <Center>
                <CardHeader>
                    <HStack spacing={10} align="center" wrap={isMobile ? "wrap" : "nowrap"}>
                        <Box>
                            <VStack>
                                <Menu>
                                    Treasure
                                    <MenuButton
                                        as={Badge}
                                        bg="#1E1E1E"
                                        border="1px solid lime"
                                        color="lime"
                                        fontSize="xl"
                                        px={2}
                                        py={1}
                                        borderRadius="md"
                                        cursor={"pointer"}
                                    >
                                        ${Number(totalJazz).toFixed(2)}
                                    </MenuButton>
                                    <MenuList bg="#1E1E1E" border="1px solid white" >
                                        <MenuItem as="a" href={zapperLinks.HOT_ADDRESS} target="_blank" color="white" bg={"#1E1E1E"} _hover={{ bg: "black" }}>
                                            Hot Wallet: ${hotWalletBalance.toFixed(2)}
                                        </MenuItem>
                                        <MenuItem as="a" href={zapperLinks.OLD_MULTISIG_ADDRESS} target="_blank" color="white" bg={"#1E1E1E"} _hover={{ bg: "black" }}>
                                            Old Multisig: ${oldMultisigBalance?.value ? (toEther(oldMultisigBalance.value) * ethPrice).toFixed(2) : '0.00'}
                                        </MenuItem>
                                        <MenuItem as="a" href={zapperLinks.NEW_MULTISIG_ADDRESS} target="_blank" color="white" bg={"#1E1E1E"} _hover={{ bg: "black" }}>
                                            New Multisig: ${newMultisigBalance?.value ? (toEther(newMultisigBalance.value) * ethPrice).toFixed(2) : '0.00'}
                                        </MenuItem>
                                        <MenuItem as="a" href={zapperLinks.NEW_MULTISIG_ADDRESS} target="_blank" color="white" bg={"#1E1E1E"} _hover={{ bg: "black" }}>
                                            New Multisig USDC: ${newMultisigUsdcBalance?.value ? Number(formatUnits(newMultisigUsdcBalance.value, 6)).toFixed(2) : '0.00'}
                                        </MenuItem>
                                        <MenuItem as="a" href={zapperLinks.BUILDER_ADDRESS} target="_blank" color="white" bg={"#1E1E1E"} _hover={{ bg: "black" }}>
                                            Builder: ${BuilderBalance?.value ? (toEther(BuilderBalance.value) * ethPrice).toFixed(2) : '0.00'}
                                        </MenuItem>
                                    </MenuList>
                                </Menu>
                            </VStack>
                        </Box>
                        {!isMobile && (
                            <Box>
                                <HStack spacing={4} justifyContent="space-between">
                                    {["For DIY", "For Dev", "Sponsors"].map((label, index) => (
                                        <VStack m={2} key={index} spacing={1}>
                                            <Text fontSize="sm" color="white">{label}</Text>
                                            <Divider />
                                            <Badge
                                                colorScheme="green"
                                                bg="#1E1E1E"
                                                border="1px solid lime"
                                                color="lime"
                                                fontWeight="bold"
                                                fontSize="md"
                                                px={2}
                                                py={1}
                                                borderRadius="md"
                                            >
                                                ${(Number(totalJazz) / (index === 1 ? 2 : 4)).toFixed(2)}
                                            </Badge>
                                        </VStack>
                                    ))}
                                </HStack>
                            </Box>
                        )}
                    </HStack>
                </CardHeader>
            </Center>
        </Card>
    );
};

export default DaoTreasure;
