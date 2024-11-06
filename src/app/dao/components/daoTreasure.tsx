'use client';
import { useETHPrice } from '@/hooks/useETHprice';
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
    VStack
} from "@chakra-ui/react";
import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';
import { mainnet } from 'viem/chains';
import { formatUnits } from 'viem/utils';
import { useBalance } from 'wagmi';

const HOT_ADDRESS = '0xB4964e1ecA55Db36a94e8aeFfBFBAb48529a2f6c'
const OLD_MULTISIG_ADDRESS = '0x5501838d869B125EFd90daCf45cDFAC4ea192c12' as `0x${string}`;
const NEW_MULTISIG_ADDRESS = '0xc1afa4c0a70b622d7b71d42241bb4d52b6f3e218' as `0x${string}`;
const BASE_USDC_TOKEN_ADDRESS = '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913' as `0x${string}`;

const DaoTreasure = () => {
    const { data: oldMultisigBalance } = useBalance({
        address: OLD_MULTISIG_ADDRESS,
        chainId: mainnet.id
    });

    const { data: newMultisigBalance } = useBalance({
        address: NEW_MULTISIG_ADDRESS,
        chainId: 8453
    });

    const { data: newMultisigUsdcBalance } = useBalance({
        address: NEW_MULTISIG_ADDRESS,
        chainId: 8453,
        token: BASE_USDC_TOKEN_ADDRESS
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
        return Number(hotWalletBalance + oldMultisigValue + newMultisigValue + newUsdcValue);
    }, [hotWalletBalance, oldMultisigBalance, newMultisigBalance, newMultisigUsdcBalance, ethPrice]);

    const isMobile = useMediaQuery("(max-width: 768px)")[0];

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
                                <Text fontSize="xl" fontWeight="bold">
                                    Total Assets:
                                </Text>
                                <Tooltip
                                    bg="gray.800"
                                    color="white"
                                    border="1px solid white"
                                    label={
                                        <Center>
                                            <VStack spacing={1}>
                                                <Text>{HOT_ADDRESS}</Text>
                                                <Text>{OLD_MULTISIG_ADDRESS}</Text>
                                                <Text>{NEW_MULTISIG_ADDRESS}</Text>
                                            </VStack>
                                        </Center>
                                    }
                                >
                                    <Badge
                                        bg="gray.800"
                                        border="1px solid lime"
                                        color="lime"
                                        fontSize="xl"
                                        px={2}
                                        py={1}
                                        borderRadius="md"
                                    >
                                        ${Number(totalJazz).toFixed(2)}
                                    </Badge>
                                </Tooltip>
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
                                                bg="gray.800"
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
