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
    HStack
} from "@chakra-ui/react";
import axios from 'axios';
import * as Types from "../../wallet/types";
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet } from 'viem/chains';
import { http } from 'viem';
import { useBalance } from 'wagmi';


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

    useEffect(() => {
        const fetchData = async () => {
            const Portfolio = await axios.get(`https://pioneers.dev/api/v1/portfolio/${HOT_ADDRESS}`);
            setWalletbalance(Portfolio.data.totalNetWorth);
        };

        fetchData();

    }, [balance]);

    return (
        <Card
            bg="black">
            <Center>

                <CardHeader>DAO Treasure</CardHeader>

            </Center>
            <Divider />
            <CardBody
                display="flex"
                flexDirection="column"
                alignItems="center"
            >
                <Flex flexDirection={{ base: 'column', md: 'row' }} gap={10}>
                    <VStack >
                        <Text color={"white"}>skatehive.eth</Text>
                        <Text fontSize={"38px"}>{Number(hotWalletbalance).toFixed(2)} USD</Text>
                    </VStack>
                    <Divider orientation="vertical" />
                    <VStack >

                        <Text color="white">ETH Multisig Wallet </Text>

                        <Text fontSize={"38px"}>
                            {Number(multisigBalance.data?.formatted)} ETH </Text>
                    </VStack>
                </Flex>
            </CardBody>

        </Card >
    );
}

export default DaoTreasure;
