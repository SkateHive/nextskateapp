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
        <Center p="12" mb="12"
        >
            <VStack mt={1} spacing={4} flexDirection={{ base: "column", xl: "row" }}  >

                <Box
                    w="100%"
                    fontFamily={'Joystix'}
                    bg="black"
                    border="1px solid white"
                >
                    <Card bg="black" >
                        <CardBody color="limegreen">
                            <Table variant="simple" mb="4">
                                <Thead>
                                    <Tr>
                                        <Th color="white"> SkateBank PIX</Th>
                                        <Th color="white"> SkateBank HBD</Th>
                                    </Tr>
                                </Thead>
                                <Tbody fontSize="20px">
                                    <Tr>
                                        <Td>{balancePix} </Td>
                                        <Td>{balanceHbd} </Td>
                                    </Tr>
                                </Tbody>
                            </Table>
                            <Table>
                                <Thead>
                                    <Tr>
                                        <Th color="white">Operação</Th>
                                        <Th color="white">Limite/Taxa</Th>
                                    </Tr>
                                </Thead>
                                <Tbody fontSize="10px">
                                    <Tr>
                                        <Th color="white">Compra Mínimo</Th>
                                        <Th color="white">{depositMinLimit} PIX</Th>
                                    </Tr>
                                    <Tr>
                                        <Th color="white">Taxa Fixa</Th>
                                        <Th color="white">{OurExchangeFee} PIX</Th>
                                    </Tr>
                                    <Tr>
                                        <Th color="white">Taxa Variável</Th>
                                        <Th color="white">{OurExchangePer * 100}%</Th>
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
