import React, { useEffect, useState } from "react";
import {
    Card,
    CardHeader,
    CardBody,
    Text,
    Center,
    HStack,
    VStack,
    Input,
    Button,
    Container,
    Alert,
    AlertIcon,
    AlertTitle,
    AlertDescription
} from "@chakra-ui/react";
import QRCode from 'qrcode.react';
import { FaCopy } from "react-icons/fa";
import axios from "axios";

interface PriceData {
    pixbeePixKey: string;
    HivePriceBRL: string;
    HIVEBRLChangePerc: string;
    HIVEBRLChangeIcon: string;
    HivePriceUSD: string;
    HIVEUSDChangePerc: string;
    HIVEUSDChangeIcon: string;
    BTCPriceBRL: string;
    BTCBRLChangePerc: string;
    BTCBRLChangeIcon: string;
    BTCPriceUSD: string;
    BTCUSDChangePerc: string;
    BTCUSDChangeIcon: string;
    HBDPriceBRL: string;
    HBDBRLChangePerc: string;
    HBDBRLChangeIcon: string;
    elapsedTime: string;
    progressDayFly: number;
    nextPriceUpdate: string;
    minRefundHive: number;
    minRefundHbd: number;
    minRefundPix: number;
    depositMinLimit: number;
    balancePix: number;
    balanceHbd: string;
    balanceHive: string;
    balanceTotal: string;
    proBanner: string;
    OurExchangePer: string;
    OurExchangeFee: string;
    OurRefundPer: string;
}

export const pixbee = '816b8bac-bf1f-4689-80c2-c2bc2e2a8d7a';
export const HBDAvailable = 10;

const fetchPixBeeData = async () => {
    try {
        const response = await axios.get(`https://aphid-glowing-fish.ngrok-free.app/dashboarddata`, {
            headers: {
                "ngrok-skip-browser-warning": "69420",
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching data:", error);
        throw error;
    }
};

export default function Pix() {
    const [amount, setAmount] = useState("");
    const [isExceeded, setIsExceeded] = useState(false);
    const [pixBeeData, setPixBeeData] = useState<PriceData | null>(null);

    useEffect(() => {
        fetchPixBeeData().then((data) => {
            setPixBeeData(data);
            console.log(data);
        }).catch(error => {
            console.error("Failed to fetch PixBee data:", error);
        });
    }, []);

    const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setAmount(value);
        setIsExceeded(parseFloat(value) > HBDAvailable);
    };

    return (
        <>
            <Center mt="20px">
                <Container maxW="container.lg">
                    <HStack spacing={4} flexDirection={{ base: "column", xl: "row" }}>
                        <Card w="full" height={'465px'}>
                            <CardHeader>
                                <Center>Enviar HBD, receber PIX:</Center>
                            </CardHeader>
                            <CardBody>
                                <VStack spacing={4}>
                                    <Input placeholder="Digite sua chave pix" />
                                    <Input
                                        placeholder="Digite a quantidade de HBD"
                                        value={amount}
                                        onChange={handleAmountChange}
                                    />
                                </VStack>
                            </CardBody>
                        </Card>
                        <Card w="full" height={'465px'}>
                            <CardHeader>
                                <Center>Enviar PIX Receber HBD:</Center>
                                <Alert status="warning">
                                    <AlertIcon />
                                    <AlertDescription>
                                        <Text>Avalaible HBD: {HBDAvailable}</Text>
                                    </AlertDescription>
                                </Alert>
                            </CardHeader>
                            <CardBody>
                                <VStack spacing={4}>
                                    {parseFloat(amount) <= HBDAvailable && (
                                        <>
                                            <QRCode value={pixbee} />
                                            <Button
                                                value={pixbee}
                                                leftIcon={<FaCopy />}
                                                onClick={() => {
                                                    navigator.clipboard.writeText(pixbee);
                                                }}
                                            >
                                                {pixbee}
                                            </Button>
                                        </>
                                    )}
                                    <Input
                                        placeholder="Digite a quantidade de HBD"
                                        value={amount}
                                        onChange={handleAmountChange}
                                    />
                                    {isExceeded && (
                                        <Alert status="error">
                                            <AlertIcon />
                                            <AlertTitle>Valor excedido!</AlertTitle>
                                            <AlertDescription>
                                                A quantidade de HBD inserida excede a quantidade disponível.
                                            </AlertDescription>
                                        </Alert>
                                    )}
                                </VStack>
                            </CardBody>
                        </Card>
                    </HStack>
                </Container>
            </Center>
        </>
    );
}
