'use client'
import { useETHPrice } from '@/hooks/useETHprice';
import {
    Badge,
    Card,
    CardBody,
    CardHeader,
    Center,
    Divider,
    HStack,
    Text,
    Tooltip,
    VStack
} from "@chakra-ui/react";
import axios from 'axios';
import { useEffect, useState } from 'react';
import { mainnet } from 'viem/chains';
import { useBalance } from 'wagmi';

const HOT_ADDRESS = '0xB4964e1ecA55Db36a94e8aeFfBFBAb48529a2f6c';
const OLD_MULTISIG_ADDRESS = '0x5501838d869B125EFd90daCf45cDFAC4ea192c12' as `0x${string}`;
const NEW_MULTISIG_ADDRESS = '0xc1afa4c0a70b622d7b71d42241bb4d52b6f3e218' as `0x${string}`;
const BASE_USDC_TOKEN_ADDRESS = '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913' as `0x${string}`;

const DaoTreasure = () => {
    const multisigBalance = useBalance({
        address: OLD_MULTISIG_ADDRESS,
        chainId: mainnet.id,
    });
    const old_multisig_balance = useBalance({
        address: OLD_MULTISIG_ADDRESS,
        chainId: mainnet.id
    });
    const new_multisig_balance = useBalance({
        address: NEW_MULTISIG_ADDRESS,
        chainId: 8453
    });
    const new_multisig_usdc_balance = useBalance({
        address: NEW_MULTISIG_ADDRESS,
        chainId: 8453,
        token: BASE_USDC_TOKEN_ADDRESS
    });

    const [hotWalletbalance, setWalletbalance] = useState("0")
    const ethprice = useETHPrice() || 3400;
    const totalJazz =
        Number(hotWalletbalance) +
        Number(old_multisig_balance.data?.formatted) * ethprice +
        Number(new_multisig_balance.data?.formatted) * ethprice +
        Number(new_multisig_usdc_balance.data?.formatted);

    useEffect(() => {
        const fetchData = async () => {
            const Portfolio = await axios.get(`https://pioneers.dev/api/v1/portfolio/${HOT_ADDRESS}`);
            setWalletbalance(Portfolio.data.totalNetWorth);
        };
        fetchData();
    }, []);

    return (
        <Card
            bg="black"
            width={"100%"}
            border={"1px solid grey"}
            borderBottomRadius={'10px'}
            borderTopRadius={'0px'}
            borderTop={"0px"}
            color={"white"}
        >
            <Center>
                <CardHeader>DAO Treasure
                    <Tooltip
                        bg={"black"}
                        color={"white"}
                        border={"1px solid white"}
                        label={
                            <Center>
                                <VStack >
                                    <Text> {HOT_ADDRESS}</Text>
                                    <Text> {OLD_MULTISIG_ADDRESS}</Text>
                                    <Text>{NEW_MULTISIG_ADDRESS}</Text>
                                </VStack>

                            </Center>
                        }>
                        <Badge ml={2} bg={"black"} border={"1px solid #A5D6A7"} color='#A5D6A7' fontSize={"24px"} > {totalJazz.toFixed(2)} USD </Badge>
                    </Tooltip></CardHeader>
            </Center>

            <Divider border={"1px solid grey"} />
            <CardBody
                display="flex"
                flexDirection="column"
                alignItems="center"
            >
                <HStack width={"100%"}
                    justifyContent={"space-between"}
                >
                    <VStack m={5}>
                        <Text fontSize={"18px"} color={"white"}> For DIY </Text>
                        <Divider />
                        <Badge colorScheme='green' bg={"black"} border={"1px solid #A5D6A7"} color='#A5D6A7' fontWeight={"bold"} fontSize={"18px"}>{(totalJazz / 4).toFixed(2)} USD</Badge>
                    </VStack>
                    <VStack m={5}>
                        <Text fontSize={"18px"} color={"white"}>For Dev</Text>
                        <Divider />
                        <Badge colorScheme='green' bg={"black"} border={"1px solid #A5D6A7"} color='#A5D6A7' fontWeight={"bold"} fontSize={"18px"}>{(totalJazz / 2).toFixed(2)} USD</Badge>
                    </VStack>
                    <VStack m={5}>
                        <Text fontSize={"18px"} color={"white"}> Sponsors</Text>
                        <Divider />
                        <Badge colorScheme='green' bg={"black"} border={"1px solid #A5D6A7"} color='#A5D6A7' fontWeight={"bold"} fontSize={"18px"}>{(totalJazz / 4).toFixed(2)} USD </Badge>
                    </VStack>
                </HStack>
            </CardBody>
        </Card >
    );
}

export default DaoTreasure;
