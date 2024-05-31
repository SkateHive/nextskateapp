'use client'
import { Box, Center, Image, Stack, Text, VStack } from '@chakra-ui/react';
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
            border="1px solid #0fb9fc"
            borderRadius="10px"
            bg="blue.800"
        >
            <Box w={{ base: "80%", md: "40%" }} textAlign="center">
                <Text align="center" fontSize={{ base: 20, md: 20 }} mb={4} backgroundColor="#0fb9fc">
                    Total Value
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
                    bg="#ccffcc"
                    borderRadius="8px"
                    padding="4px 8px"
                    mb={4}
                    textAlign="center"
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
            <Stack
                direction={{ base: "column", md: "column" }}
                w="100%"
                spacing={4}
                p={4}
                alignItems="center"
            >
                <Center w={{ base: "100%", md: "100%" }} mb={{ base: 4, md: 0 }}>
                    <HiveBox onNetWorthChange={handleHiveNetWorth} />
                </Center>
                <Center w={{ base: "100%", md: "100%" }}>
                    <EthBox onNetWorthChange={handleEthNetWorth} />
                </Center>
            </Stack>
        </VStack>
    );
};

export default TotalValueBox;