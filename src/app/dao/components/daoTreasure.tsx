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
    VStack
} from "@chakra-ui/react";
import axios from 'axios';
import * as Types from "../../wallet/types";
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet } from 'viem/chains';
import { http } from 'viem';
import { useBalance } from 'wagmi';

// wagmi config on eth
export const wagmiConfig = getDefaultConfig({
    appName: "SkateHive",
    projectId: "52f3a9b032f5caf26719af6939715629",
    chains: [mainnet],
    transports: {
        [mainnet.id]: http(),
    },
})

const HOT_ADDRESS = '0xB4964e1ecA55Db36a94e8aeFfBFBAb48529a2f6c';
const MULTISIG_ADDRESS = '0x5501838d869B125EFd90daCf45cDFAC4ea192c12' as `0x${string}`;
const DaoTreasure = () => {

    const multisigBalance = useBalance({ address: MULTISIG_ADDRESS });
    const balance = useBalance({ address: MULTISIG_ADDRESS });
    const [hotWalletbalance, setWalletbalance] = useState("0")

    useEffect(() => {
        const fetchData = async () => {
            const Portfolio = await axios.get(`https://pioneers.dev/api/v1/portfolio/${HOT_ADDRESS}`);
            console.log(Portfolio.data.totalNetWorth);
            setWalletbalance(Portfolio.data.totalNetWorth);
        };

        fetchData();

    }, [balance]);

    return (
        <Card
            bg="black"
            border={"1px solid yellow"}>
            <Center>

                <CardHeader>DAO Treasure</CardHeader>

            </Center>
            <Divider />
            <CardBody
                display="flex"
                flexDirection="column"
                alignItems="center"

            >
                <VStack >
                    <Text color={"white"}>skatehive.eth</Text>
                    <Text>{Number(hotWalletbalance).toFixed(2)} USD</Text>
                </VStack>
                <VStack >

                    <Text color="white">Multisig Wallet Total Balance USD: </Text>

                    <Text>
                        {Number(multisigBalance)}</Text>
                </VStack>
            </CardBody>
            <CardFooter>
            </CardFooter>
        </Card>
    );
}

export default DaoTreasure;
