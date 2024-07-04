'use client'
import { Box, Center, Flex, Image, Text, VStack } from '@chakra-ui/react';
import { useState } from 'react';

import EthBox from './ethWallet';
import HiveBox from './hiveWallet';

const TotalValueBox: React.FC = () => {
    const [ethNetWorth, setEthNetWorth] = useState<number>(0);
    const [hiveNetWorth, setHiveNetWorth] = useState<number>(0);

    const handleEthNetWorth = (value: number) => {
        setEthNetWorth(value);
    };

    const handleHiveNetWorth = (value: number) => {
        setHiveNetWorth(value);
    };

    const totalValue = ethNetWorth + hiveNetWorth;

    return (
        <VStack
            w="100%"
            gap={2}
            alignItems="center"
            flex="1"
            p={4}
            borderRadius="10px"
            h={{ base: "100%", md: "100%" }}
        >
            <Box w={{ base: "80%", md: "40%" }} textAlign="center">
                <Text color={"black"} align="center" borderRadius={"md"} fontSize={{ base: 20, md: 20 }} mb={4} backgroundColor="white">
                    Net Worth
                </Text>
                <Center>
                    <Image
                        src="https://i.ibb.co/2ML12vx/image.png"
                        boxSize={"130px"}
                        objectFit="cover"
                        alt="Image Alt Text"
                    />
                </Center>
                <Box
                    borderRadius="8px"
                    padding="4px 8px"
                    mb={4}
                    textAlign="center"
                    backgroundColor="white"
                >
                    <Text
                        fontWeight="bold"
                        fontSize={{ base: "35px", md: "35px" }}
                        color="#003300"
                    >
                        ${totalValue.toFixed(2)}
                    </Text>
                </Box>
            </Box>

            <Flex direction={{ base: 'column', md: 'row' }} w="100%">
                <HiveBox onNetWorthChange={handleHiveNetWorth} />
                <EthBox onNetWorthChange={handleEthNetWorth} />
            </Flex>
        </VStack>
    );
};

export default TotalValueBox;