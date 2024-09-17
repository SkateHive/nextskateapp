'use client';
import { useETHPrice } from '@/hooks/useETHprice';
import {
    Badge,
    Box,
    Card,
    CardBody,
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
import { useEffect, useState, useMemo } from 'react';
import { FaEthereum } from 'react-icons/fa';
import { mainnet } from 'viem/chains';
import { useBalance } from 'wagmi';

const HOT_ADDRESS = '0xB4964e1ecA55Db36a94e8aeFfsBFBAb48529a2f6c' as `0x${string}`;
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

    const [hotWalletBalance, setHotWalletBalance] = useState("0");
    const ethPrice = useETHPrice() || 3400;

    // Fetch the hot wallet balance
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`https://pioneers.dev/api/v1/portfolio/${HOT_ADDRESS}`);
                console.log(response.data);
                setHotWalletBalance(response.data.totalNetWorth || "0");
            } catch (error) {
                console.error("Error fetching hot wallet balance:", error);
            }
        };
        fetchData();
    }, []);

    // Memoize totalJazz calculation for efficiency
    const totalJazz = useMemo(() => {
        const oldMultisigValue = Number(oldMultisigBalance?.formatted || 0) * ethPrice;
        const newMultisigValue = Number(newMultisigBalance?.formatted || 0) * ethPrice;
        const newUsdcValue = Number(newMultisigUsdcBalance?.formatted || 0);
        const hotWalletValue = Number(hotWalletBalance);
        console.log(hotWalletValue, oldMultisigValue, newMultisigValue, newUsdcValue);
        console.log(hotWalletBalance)
        return hotWalletValue + oldMultisigValue + newMultisigValue + newUsdcValue;
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
                    <HStack spacing={10} >
                        <Box>
                            <VStack>
                                <Text>
                                    Total:
                                </Text>
                                <Tooltip
                                    bg="black"
                                    color="white"
                                    border="1px solid white"
                                    label={
                                        <Center>
                                            <VStack>
                                                <Text>{HOT_ADDRESS}</Text>
                                                <Text>{OLD_MULTISIG_ADDRESS}</Text>
                                                <Text>{NEW_MULTISIG_ADDRESS}</Text>
                                            </VStack>
                                        </Center>
                                    }
                                >
                                    <Badge
                                        ml={2}
                                        bg="black"
                                        border="1px solid #A5D6A7"
                                        color="#A5D6A7"
                                        fontSize="22px"
                                    >
                                        {totalJazz.toFixed(2)} USD
                                    </Badge>
                                </Tooltip>
                            </VStack>
                        </Box>
                        {!isMobile && (
                            <Box>
                                <HStack justifyContent="space-between">
                                    {["For DIY", "For Dev", "Sponsors"].map((label, index) => (
                                        <VStack m={2} key={index}>
                                            <Text fontSize="12px" color="white">{label}</Text>
                                            <Divider />
                                            <Badge
                                                colorScheme="green"
                                                bg="black"
                                                border="1px solid #A5D6A7"
                                                color="#A5D6A7"
                                                fontWeight="bold"
                                                fontSize="12px"
                                            >
                                                {(totalJazz / (index === 1 ? 2 : 4)).toFixed(2)} USD
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
