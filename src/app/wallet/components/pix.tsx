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
    AlertDescription,
    Box,
    Image
} from "@chakra-ui/react";
import QRCode from 'qrcode.react';
import { FaCopy, FaInfoCircle } from "react-icons/fa";
import axios from "axios";
import { HiveAccount } from "@/lib/useHiveAuth";
import useHiveBalance from "@/hooks/useHiveBalance";

interface PixBeeData {
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

interface PixProps {
    user: HiveAccount;
}

export const pixbee = '816b8bac-bf1f-4689-80c2-c2bc2e2a8d7a';
export const HBDAvailable = 10;

const getLimitsBasedOnHivePower = (hivePower: number) => {
    if (hivePower < 500) {
        return { maxWithdraw: 50, minSell: 5 };
    } else if (hivePower < 1000) {
        return { maxWithdraw: 100, minSell: 10 };
    } else if (hivePower < 5000) {
        return { maxWithdraw: 250, minSell: 20 };
    } else if (hivePower < 10000) {
        return { maxWithdraw: 500, minSell: 50 };
    } else {
        return { maxWithdraw: 1000, minSell: 100 };
    }
};

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

export default function Pix({ user }: PixProps) {
    const [amountHBDtoSell, setAmountHBDtoSell] = useState("");
    const [amountHBDtoBuy, setAmountHBDtoBuy] = useState("");
    const [isExceeded, setIsExceeded] = useState(false);
    const [pixBeeData, setPixBeeData] = useState<PixBeeData | null>(null);
    const userHiveBalance = useHiveBalance(user);
    const limits = getLimitsBasedOnHivePower(userHiveBalance.totalHP);

    useEffect(() => {
        fetchPixBeeData().then((data) => {
            setPixBeeData(data);
            console.log("PixBee data:", data);
        }).catch(error => {
            console.error("Failed to fetch PixBee data:", error);
        });
    }, []);

    const handleSellAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setAmountHBDtoSell(value);
        setIsExceeded(parseFloat(value) > HBDAvailable);
    };

    const handleBuyAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setAmountHBDtoBuy(value);
        setIsExceeded(parseFloat(value) > HBDAvailable);
    };

    const isSellBlurred = !amountHBDtoSell || parseFloat(amountHBDtoSell) > HBDAvailable;
    const isBuyBlurred = !amountHBDtoBuy || parseFloat(amountHBDtoBuy) > HBDAvailable;

    return (
        <>
            <Center mt="20px">
                <Container maxW="container.lg">
                    <HStack>
                        <Text
                            fontFamily="Joystix"
                            fontSize="2xl"
                            textAlign="center"
                            color="white"
                            mt={2}
                        > User Power {userHiveBalance.totalHP} </Text>
                        <FaInfoCircle color="white" />
                    </HStack>
                    <HStack mt={1} spacing={4} flexDirection={{ base: "column", xl: "row" }}>
                        <Card w="full" height={'465px'}>
                            <CardHeader>
                                <Center>Enviar HBD, receber PIX:</Center>
                            </CardHeader>
                            <CardBody>
                                <VStack spacing={4}>
                                    <Image width={'80%'} src="/logos/HBD-Pix.png" alt="PixBee" />
                                    <Input placeholder="Digite sua chave pix" />
                                    <Input
                                        placeholder="Digite a quantidade de HBD"
                                        value={amountHBDtoSell}
                                        onChange={handleSellAmountChange}
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
                                        <Text>Available HBD: {HBDAvailable}</Text>
                                    </AlertDescription>
                                </Alert>
                            </CardHeader>
                            <CardBody>
                                <VStack spacing={4}>
                                    <Box filter={isBuyBlurred ? "blur(5px)" : "none"}>
                                        <QRCode value={pixbee} />
                                    </Box>
                                    <Button
                                        value={pixbee}
                                        leftIcon={<FaCopy />}
                                        onClick={() => {
                                            navigator.clipboard.writeText(pixbee);
                                        }}
                                        filter={isBuyBlurred ? "blur(5px)" : "none"}
                                        isDisabled={isBuyBlurred}
                                    >
                                        {pixbee}
                                    </Button>
                                    <Input
                                        placeholder="Digite a quantidade de HBD"
                                        value={amountHBDtoBuy}
                                        onChange={handleBuyAmountChange}
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
