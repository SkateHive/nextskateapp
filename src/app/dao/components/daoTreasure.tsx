// path: src/app/dao/components/DaoTreasure.tsx
'use client'
import React, { useEffect, useState } from 'react';
import {
    Box,
    Text,
    Button,
    Card,
    CardBody,
    CardHeader,
    CardFooter,
    Center,
    Divider,
    Flex,
    VStack,
    HStack,
    Tooltip,
    Badge
} from "@chakra-ui/react";
import axios from 'axios';
import * as Types from "../../wallet/types";
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet } from 'viem/chains';
import { http } from 'viem';
import { useBalance } from 'wagmi';
import { useETHPrice } from '@/hooks/useETHprice';

const HOT_ADDRESS = '0xB4964e1ecA55Db36a94e8aeFfBFBAb48529a2f6c';
const MULTISIG_ADDRESS = '0x5501838d869B125EFd90daCf45cDFAC4ea192c12' as `0x${string}`;
const DaoTreasure = () => {

    const multisigBalance = useBalance({
        address: MULTISIG_ADDRESS,
        chainId: mainnet.id,
    });
    console.log(multisigBalance)
    const balance = useBalance({ address: MULTISIG_ADDRESS });
    const [hotWalletbalance, setWalletbalance] = useState("0")
    const ethprice = useETHPrice() || 3400;
    const multiSigETHvalue = Number(multisigBalance.data?.formatted) * ethprice;
    const totalJazz = Number(hotWalletbalance) + multiSigETHvalue;

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
        >
            <Center>
                <CardHeader>DAO Treasure
                    <Tooltip
                        bg={"black"}
                        color={"white"}
                        border={"1px solid white"}
                        label={
                            <center>
                                <VStack >

                                    <Text color="white">ETH Multisig Wallet </Text>
                                    <Text fontSize={"28px"}>
                                        {Number(multisigBalance.data?.formatted)} ETH
                                    </Text>
                                </VStack>
                                <VStack >
                                    <Text color={"white"}>skatehive.eth</Text>
                                    <Text fontSize={"28px"}>{Number(hotWalletbalance).toFixed(2)} USD</Text>
                                </VStack>
                            </center>
                        }>
                        <Badge ml={2} border={"1px solid limegreen"} color='limegreen' fontSize={"24px"} > {totalJazz.toFixed(2)} USD </Badge>
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

                        <Badge border={"1px solid limegreen"} color='limegreen' fontWeight={"bold"} fontSize={"18px"}>{(totalJazz / 4).toFixed(2)} USD</Badge>
                    </VStack>
                    <VStack m={5}>
                        <Text fontSize={"18px"} color={"white"}>For Dev</Text>
                        <Divider />

                        <Badge border={"1px solid limegreen"} color='limegreen' fontWeight={"bold"} fontSize={"18px"}>{(totalJazz / 2).toFixed(2)} USD</Badge>
                    </VStack>
                    <VStack m={5}>
                        <Text fontSize={"18px"} color={"white"}> Sponsors</Text>
                        <Divider />
                        <Badge border={"1px solid limegreen"} color='limegreen' fontWeight={"bold"} fontSize={"18px"}>{(totalJazz / 4).toFixed(2)} USD </Badge>
                    </VStack>
                </HStack>
            </CardBody>

        </Card >
    );
}

export default DaoTreasure;
