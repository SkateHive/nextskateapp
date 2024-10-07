import { Box, Card, CardBody, Center, Flex, Table, Tbody, Td, Th, Thead, Tr, VStack } from "@chakra-ui/react";
import React from "react";

interface PixBeeData {
    balancePix: number;
    balanceHbd: string;
    depositMinLimit: number;
    OurExchangePer: number;
    OurExchangeFee: number
}

interface PixProps {
    pixBeeData: PixBeeData;
}

export const LimitsTable: React.FC<PixBeeData> = ({ balancePix, balanceHbd, depositMinLimit, OurExchangePer, OurExchangeFee }) => {
    return (
        <Center p="12" mb="12">
            <VStack mt={1} spacing={4} flexDirection={{ base: "column", xl: "row" }}  >

                <Box w="100%"
                    fontFamily={'Joystix'}
                    bg="black"
                    border="1px solid white"
                >
                    <Card bg="black" >
                        <CardBody color="limegreen">
                            <Table variant="simple" mb="4">
                                <Thead>
                                    <Tr>
                                        <Th color="white" colSpan={2} fontSize="20px" textAlign={'center'}>
                                            SkateBank
                                        </Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    <Tr>
                                        <Td fontSize="20px">{balancePix} </Td>
                                        <Td color="white" fontSize="15px">PIX</Td>
                                    </Tr>
                                    <Tr>
                                        <Td fontSize="20px">{balanceHbd} </Td>
                                        <Td color="white" fontSize="15px" >HBD</Td>
                                    </Tr>
                                </Tbody>
                            </Table>

                            <Table marginTop={'10'}>
                                <Thead>
                                    <Tr>
                                        <Th color="white">Operação</Th>
                                        <Th color="white">Limite/Taxa</Th>
                                    </Tr>
                                </Thead>
                                <Tbody fontSize="12px">
                                    <Tr>
                                        <Td color="white">Depósito Mínimo</Td>
                                        <Td color="white">{depositMinLimit} PIX</Td>
                                    </Tr>
                                    <Tr>
                                        <Td color="white">Taxa Fixa</Td>
                                        <Td color="white">{OurExchangeFee} PIX</Td>
                                    </Tr>
                                    <Tr>
                                        <Td color="white">Taxa Variável</Td>
                                        <Td color="white">{OurExchangePer * 100}%</Td>
                                    </Tr>
                                </Tbody>
                            </Table>
                        </CardBody>
                    </Card>
                </Box>

            </VStack>
        </Center>
    );
};

const Limites: React.FC<PixProps> = ({ pixBeeData }) => {
    return (
        <Flex
        >
            <LimitsTable
                balancePix={pixBeeData.balancePix}
                balanceHbd={pixBeeData.balanceHbd}
                depositMinLimit={pixBeeData.depositMinLimit}
                OurExchangePer={pixBeeData.OurExchangePer}
                OurExchangeFee={pixBeeData.OurExchangeFee}
            />
        </Flex>
    );
};

export default Limites;
