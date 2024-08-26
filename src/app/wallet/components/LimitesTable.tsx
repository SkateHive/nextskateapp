import { HiveAccount } from "@/lib/useHiveAuth";
import { Alert, AlertDescription, AlertIcon, Card, CardBody, CardHeader, Center, Table, Tbody, Td, Text, Th, Thead, Tr } from "@chakra-ui/react";
import React from "react";

interface PixBeeData {
    balancePix: number;
    balanceHbd: string;
    depositMinLimit: number;
    transactionFee: number;
    fixedFee: number;
}

interface PixProps {
    user: HiveAccount;
    pixBeeData: PixBeeData;
}

export const LimitsTable: React.FC<PixBeeData> = ({ balancePix, balanceHbd, depositMinLimit, transactionFee, fixedFee }) => {
    return (
        <Card w="full" height="700px">
            <CardHeader>
                <Center>Limites e Taxas</Center>
            </CardHeader>
            <Alert status="warning" mb={4}>
                <AlertIcon />
                <AlertDescription>
                    <Text><strong>{balancePix}</strong> PIX Disponíveis no SkateBank</Text>
                </AlertDescription>
            </Alert>
            <Alert status="warning" mb={4}>
                <AlertIcon />
                <AlertDescription>
                    <Text><strong>{balanceHbd}</strong> HBD Disponíveis no SkateBank</Text>
                </AlertDescription>
            </Alert>

            <CardBody>
                <Table variant="simple">
                    <Thead>
                        <Tr>
                            <Th>Operação</Th>
                            <Th>Limite/Taxa</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        <Tr>
                            <Td>Compra Mínimo</Td>
                            <Td>{depositMinLimit} PIX</Td>
                        </Tr>
                        <Tr>
                            <Td>Taxa Variável</Td>
                            <Td>{transactionFee}1%</Td>
                        </Tr>
                        <Tr>
                            <Td>Taxa Fixa</Td>
                            <Td>{fixedFee} 2 PIX</Td>
                        </Tr>
                    </Tbody>
                </Table>
            </CardBody>
        </Card>
    );
};

const Limites: React.FC<PixProps> = ({ user, pixBeeData }) => {

    return (
        <LimitsTable
            balancePix={pixBeeData.balancePix}
            balanceHbd={pixBeeData.balanceHbd}
            depositMinLimit={pixBeeData.depositMinLimit}
            transactionFee={pixBeeData.transactionFee}
            fixedFee={pixBeeData.fixedFee}
        />
    );
};

export default Limites;
