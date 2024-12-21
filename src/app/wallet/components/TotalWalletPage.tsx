'use client';
import { Box, Center, Flex, Image, Text, VStack } from '@chakra-ui/react';
import { useEffect, useState } from 'react';

import "../../../styles/fonts.css";
import EthBox from './ethWallet';
import HiveBox from './hiveWallet';
import { useAccount } from 'wagmi';
import { useHiveUser } from '@/contexts/UserContext';
import NFTDisplay from './NFTDisplay';

const TotalValueBox: React.FC = () => {
    const [ethNetWorth, setEthNetWorth] = useState<number>(0);
    const [hiveNetWorth, setHiveNetWorth] = useState<number>(0);
    const [totalValue, setTotalValue] = useState<string>("Loading...");
    const account = useAccount();
    const hiveUser = useHiveUser();
    const handleEthNetWorth = (value: number) => {
        if (!isNaN(value)) {
            setEthNetWorth(value);
        }
    };

    const handleHiveNetWorth = (value: number) => {
        if (!isNaN(value)) {
            setHiveNetWorth(value);
        }
    };

    const calculateTotalValue = () => {
        const total = ethNetWorth + hiveNetWorth;
        setTotalValue("$" + total.toFixed(2).toString());
    };

    useEffect(() => {
        calculateTotalValue();
    }, [ethNetWorth, hiveNetWorth]);

    return (
        <VStack
            w="100%"
            spacing={4}
            alignItems="center"
            p={4}
            borderRadius="10px"
            h="100vh"
            fontFamily="Joystix"
        >
            <Box w="100%" textAlign="center">
                <Text
                    color="white"
                    align="center"
                    borderRadius="md"
                    fontSize={{ base: 20, md: 20 }}
                    backgroundColor="#2b2626"
                    p={2}                >
                    Net Worth
                </Text>
                <Center backgroundColor="#2b2626">
                    <Image
                        src="/nounishpepe.png"
                        boxSize="130px"
                        objectFit="cover"
                        alt="Image Alt Text"
                    />
                </Center>
                <Box
                    borderRadius="8px"
                    padding="4px 8px"
                    mb={4}
                    textAlign="center"
                    backgroundColor="limegreen"
                    border="1px solid white"
                >
                    <Text
                        fontWeight="bold"
                        fontSize={{ base: "35px", md: "45px" }}
                        color="white"
                        textShadow="0 0 10px black, 0 0 20px black, 0 0 30px rgba(255, 255, 255, 0.4)"
                    >
                        {totalValue}
                    </Text>
                </Box>
            </Box>

            <Flex
                direction={{ base: 'column', md: 'row' }}
                w="100%"
                gap={4}
                justifyContent="center"
            >
                {hiveUser.hiveUser && (
                    <Box flex="1" minWidth="0">
                        <HiveBox onNetWorthChange={handleHiveNetWorth} />
                    </Box>
                )}
                {account.address && (
                    <Box flex="1" minWidth="0">
                        <EthBox onNetWorthChange={handleEthNetWorth} />
                    </Box>
                )}
            </Flex>
            {account.address && <NFTDisplay />}
        </VStack>
    );
};

export default TotalValueBox;
