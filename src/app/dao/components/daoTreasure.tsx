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
    CardFooter
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
    const [hotBalance, setHotBalance] = useState<Types.PortfolioData>();
    const [multisigBalance, setMultisigBalance] = useState('');
    const balance = useBalance({ address: MULTISIG_ADDRESS });


    useEffect(() => {
        if (balance) {
            setMultisigBalance(String(balance.data?.formatted));
        }
    }
        , [balance]);

    return (
        <Card>
            <CardHeader>DAO Treasure</CardHeader>
            <CardBody
                display="flex"
                flexDirection="column"
                alignItems="center"
            >
                {hotBalance && <Text>Hot Wallet Total Balance USD: {hotBalance.totalNetWorth}</Text>}
                {multisigBalance && <Text>Multisig Wallet Total Balance USD: {multisigBalance}</Text>}
            </CardBody>
            <CardFooter>
                <Box>
                    <Button>View All</Button>
                </Box>
            </CardFooter>
        </Card>
    );
}

export default DaoTreasure;
