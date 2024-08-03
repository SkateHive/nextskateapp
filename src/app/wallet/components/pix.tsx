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
    Image,
    Switch,
    Table, Thead, Tbody, Tr, Th, Td
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

const LimitsTable = (props: PixBeeData) => {
    return (
        <Card w="full" height={'666px'}>
            <CardHeader>
                <Center>Limites</Center>
            </CardHeader>
            <CardBody>
                <Table variant="simple">
                    <Thead>
                        <Tr>
                            <Th>Operação</Th>
                            <Th>Limite</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        <Tr>
                            <Td>Depósito Mínimo</Td>
                            <Td>{props.depositMinLimit} HBD</Td>
                        </Tr>
                        <Tr>
                            <Td>Retirada Máxima</Td>
                            <Td>{props.minRefundHive} HBD</Td>
                        </Tr>
                        <Tr>
                            <Td>Compra Mínima</Td>
                            <Td>{props.minRefundHbd} HBD</Td>
                        </Tr>
                        <Tr>
                            <Td>Venda Mínima</Td>
                            <Td>{props.minRefundPix} HBD</Td>
                        </Tr>
                    </Tbody>
                </Table>
            </CardBody>
        </Card>
    );
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
    const [amountHBD, setAmountHBD] = useState("");
    const [isSell, setIsSell] = useState(true);
    const [isExceeded, setIsExceeded] = useState(false);
    const [pixBeeData, setPixBeeData] = useState<PixBeeData | null>(null);
    const userHiveBalance = useHiveBalance(user);
    const limits = getLimitsBasedOnHivePower(userHiveBalance.totalHP);
    const HBDAvailable = pixBeeData ? parseFloat(pixBeeData.balanceHbd) : 0;

    useEffect(() => {
        fetchPixBeeData().then((data) => {
            setPixBeeData(data);
            console.log("PixBee data:", data);
        }).catch(error => {
            console.error("Failed to fetch PixBee data:", error);
        });
    }, []);

    const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setAmountHBD(value);
        setIsExceeded(parseFloat(value) > HBDAvailable);
    };

    const isBlurred = !amountHBD || parseFloat(amountHBD) > HBDAvailable;

    function calculateTotalPixPayment(amount: number) {
        const hbdtoBrl = pixBeeData?.HBDPriceBRL ? parseFloat(pixBeeData.HBDPriceBRL) : 0;
        console.log(hbdtoBrl);
        const fee = (hbdtoBrl * amount) * 0.01 + 2;
        console.log(fee);
        return hbdtoBrl * amount - fee;
    }

    if (!pixBeeData) {
        return (
            <Center>
                <Text color={'limegreen'}>Call Vaipraonde in Discord and ask him to turn on his raspberry...</Text>;
            </Center>
        );
    }

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
                    <VStack mt={1} spacing={4} flexDirection={{ base: "column", xl: "row" }}>
                        <Card w="full" height={'666px'}>
                            <CardHeader>
                                <Center>
                                    {isSell ? "Enviar HBD, receber PIX:" : "Enviar PIX, Receber HBD:"}
                                    <Switch
                                        isChecked={!isSell}
                                        onChange={() => setIsSell(!isSell)}
                                        ml={4}
                                    />
                                </Center>
                            </CardHeader>
                            <CardBody>
                                <VStack spacing={4}>
                                    {isSell ? <Image width={'80%'} src="/logos/HBD-Pix.png" alt="PixBee" /> : <Image width={'80%'} src="/logos/Pix-HBD.png" alt="PixBee" />}
                                    {isSell ? (
                                        <>
                                            <Input placeholder="Digite sua chave pix" />
                                            <Input
                                                placeholder="Digite a quantidade de HBD"
                                                value={amountHBD}
                                                onChange={handleAmountChange}
                                            />
                                            {calculateTotalPixPayment(parseFloat(amountHBD))}
                                        </>
                                    ) : (
                                        <>
                                            <Alert status="warning">
                                                <AlertIcon />
                                                <AlertDescription>
                                                    <Text>Available {HBDAvailable} HBD</Text>
                                                </AlertDescription>
                                            </Alert>
                                            <Box filter={isBlurred ? "blur(5px)" : "none"}>
                                                <QRCode value={pixBeeData?.pixbeePixKey || 'server is down, fuck it, just hold that shit'} />
                                            </Box>
                                            <Button
                                                value={pixBeeData?.pixbeePixKey}
                                                leftIcon={<FaCopy />}
                                                onClick={() => {
                                                    navigator.clipboard.writeText(pixBeeData?.pixbeePixKey || "");
                                                }}
                                                filter={isBlurred ? "blur(5px)" : "none"}
                                                isDisabled={isBlurred}
                                            >
                                                {pixBeeData?.pixbeePixKey}
                                            </Button>
                                            <Input
                                                placeholder="Digite a quantidade de HBD"
                                                value={amountHBD}
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
                                        </>
                                    )}
                                </VStack>
                            </CardBody>
                        </Card>
                        {pixBeeData && <LimitsTable {...pixBeeData} />}
                    </VStack>
                </Container>
            </Center>
        </>
    );
}
