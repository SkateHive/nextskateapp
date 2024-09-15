import { Card, CardBody, Table, Tbody, Td, Text, Th, Thead, Tr } from "@chakra-ui/react";
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
        <Card w="full" fontFamily={'Joystix'} bg="black">
            <CardBody color="limegreen">
                <Table variant="simple">
                    <Thead >
                        <Th color="white" >Disponíveis SkateBank</Th>
                        <Th color="white"> Disponíveis SkateBank</Th>
                    </Thead>
                    <Tbody fontSize="20px">
                        <Tr >
                            <Td > {balancePix} PIX </Td>
                            <Td > {balanceHbd} HBD</Td>
                        </Tr>
                    </Tbody>
                </Table>
                <Table>
                    <Thead >
                        <Th color="white">Operação</Th>
                        <Th color="white">Limite/Taxa</Th>
                    </Thead>
                    <Tbody >
                        <Tr>
                            <Td>Compra Mínimo</Td>
                            <Td><Text fontSize="20px">{depositMinLimit} PIX</Text></Td>
                        </Tr>
                        <Tr>
                            <Td>Taxa Fixa</Td>
                            <Td><Text fontSize="20px">{OurExchangeFee} PIX</Text></Td>
                        </Tr>
                        <Tr>
                            <Td>Taxa Variável </Td>
                            <Td><Text fontSize="13px">{OurExchangePer * 100}%</Text></Td>
                        </Tr>
                    </Tbody>
                </Table>
            </CardBody>
        </Card>
    );
};

const Limites: React.FC<PixProps> = ({ pixBeeData }) => {

    return (
        <LimitsTable
            balancePix={pixBeeData.balancePix}
            balanceHbd={pixBeeData.balanceHbd}
            depositMinLimit={pixBeeData.depositMinLimit}
            OurExchangePer={pixBeeData.OurExchangePer}
            OurExchangeFee={pixBeeData.OurExchangeFee}
        />
    );
};

export default Limites;
