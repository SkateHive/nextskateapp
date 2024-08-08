import useHiveBalance from "@/hooks/useHiveBalance";
import { HiveAccount } from "@/lib/useHiveAuth";
import {
    Alert,
    AlertDescription,
    AlertIcon,
    AlertTitle,
    Badge,
    Box,
    Button,
    Card,
    CardBody,
    CardHeader,
    Center,
    Container,
    HStack,
    Image,
    Input,
    InputGroup,
    InputRightAddon,
    Switch,
    Table,
    Tbody,
    Td,
    Text,
    Th,
    Thead,
    Tr,
    VStack,
} from "@chakra-ui/react";
import axios from "axios";
import QRCode from 'qrcode.react';
import React, { useEffect, useState } from "react";
import { FaCopy, FaInfoCircle } from "react-icons/fa";
import SendHBDModal from "./sendHBDModal";

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
        <Card w="full" height={'622px'}>
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

const formatCPF = (cpf: string) => cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');

const formatCNPJ = (cnpj: string) => cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');

const formatTelephone = (telephone: string) => telephone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');


const sanitizePixKey = (pixKey: string) => {
    const cleanKey = pixKey.replace(/[^\d\w@.]/g, '');

    const isCPF = /^\d{11}$/.test(cleanKey);

    const isCNPJ = /^\d{14}$/.test(cleanKey);

    const isTelephone = /^\d{11}$/.test(cleanKey) && cleanKey[2] === '9';

    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanKey);

    const isRandomKey = /^[a-zA-Z0-9]{32}$/.test(cleanKey);

    if (isCNPJ) {
        return formatCNPJ(cleanKey);
    } else if (isTelephone) {
        return formatTelephone(cleanKey);
    } else if (isCPF) {
        return formatCPF(cleanKey);
    } else if (isEmail) {
        return cleanKey;
    } else if (isRandomKey) {
        return cleanKey;
    } else {
        throw new Error('Formato de chave Pix inválido');
    }
};


const Pix = ({ user }: PixProps) => {
    const [amountHBD, setAmountHBD] = useState("");
    const [isSell, setIsSell] = useState(true);
    const [isExceeded, setIsExceeded] = useState(false);
    const [pixBeeData, setPixBeeData] = useState<PixBeeData | null>(null);
    const userHiveBalance = useHiveBalance(user);
    const limits = getLimitsBasedOnHivePower(userHiveBalance.totalHP);
    const HBDAvailable = pixBeeData ? parseFloat(pixBeeData.balanceHbd) : 0;
    const [displayModal, setDisplayModal] = useState(false);
    const [pixTotalPayment, setPixTotalPayment] = useState(0);
    const [pixKey, setPixKey] = useState("");
    const [formattedPixKey, setFormattedPixKey] = useState("");
    const [pixKeyType, setPixKeyType] = useState("");

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

    const handlePixKeyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value.replace(/[^\d\w@.]/g, '');
        
        let keyType = '';
        let formattedKey = '';
        
        try {
            if (/^\d{11}$/.test(value)) {
                if (value[2] === '9') { 
                    keyType = "Telefone";
                    formattedKey = formatTelephone(value);
                } else {
                    keyType = "CPF";
                    formattedKey = formatCPF(value);
                }
            } else if (/^\d{14}$/.test(value)) {
                keyType = "CNPJ";
                formattedKey = formatCNPJ(value);
            } else if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                keyType = "Email";
                formattedKey = value;
            } else if (/^[a-zA-Z0-9]{32}$/.test(value)) {
                keyType = "Chave Aleatória";
                formattedKey = value;
            } else {
                keyType = "Desconhecido";
                formattedKey = value;
            }
        } catch (error) {
            console.error('Erro ao sanitizar chave Pix:', error);
            keyType = "Desconhecido";
            formattedKey = value;
        }
    
        setPixKey(value);
        setPixKeyType(keyType);
        setFormattedPixKey(formattedKey);
    };

    const handleSubmit = () => {
        try {
            const sanitizedKey = sanitizePixKey(pixKey);
            console.log("Sanitized Pix Key:", sanitizedKey);
            setDisplayModal(true); 
        } catch (error) {
            console.error(error);
        }
    };

    function calculateTotalPixPayment(amount: number) {
        const hbdtoBrl = pixBeeData?.HBDPriceBRL ? parseFloat(pixBeeData.HBDPriceBRL) : 0;
        console.log(hbdtoBrl);
        const fee = (hbdtoBrl * amount) * 0.01 + 2;
        console.log(fee);
        return (hbdtoBrl * amount - fee).toFixed(2);
    }

    useEffect(() => {
        let c = calculateTotalPixPayment(parseFloat(amountHBD));
        setPixTotalPayment(Number(c));
    }, [amountHBD]);

    if (!pixBeeData) {
        return (
            <Center>
                <Text color={'limegreen'}>Call Vaipraonde in Discord and ask him to turn on his raspberry...</Text>;
            </Center>
        );
    }

   
    return (
        <>
            {displayModal && (
                <SendHBDModal
                    username={user.name} visible={displayModal} onClose={() => setDisplayModal(false)} hbdAmount={amountHBD} pixAmount={pixTotalPayment} memo={pixBeeData?.pixbeePixKey || ''} availableBalance={HBDAvailable}
                />
            )}
            <Center>
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
            </Center>
            <Center mt="20px">
                <Container maxW="container.lg">
                    <VStack mt={1} spacing={4} flexDirection={{ base: "column", xl: "row" }}>
                        <Card w="full" height={"622px"} fontFamily={'Joystix'}>
                            <CardHeader>
                                <Center>
                                    {isSell ? "Vender HBD, receber PIX:" : "Enviar PIX, Receber HBD:"}
                                    <Switch
                                        isChecked={!isSell}
                                        onChange={() => setIsSell(!isSell)}
                                        ml={4}
                                    />
                                </Center>
                            </CardHeader>
                            <CardBody>
                                <VStack spacing={4}>
                                    {isSell ? (
                                        <>
                                            <Alert status="warning">
                                                <AlertIcon />
                                                <AlertDescription>
                                                    <Text> <strong>{pixBeeData?.balancePix}</strong> Reais Disponíveis no Skatehive Bank</Text>
                                                </AlertDescription>
                                            </Alert>
                                            <Image width={'70%'} src="/logos/HBD-Pix.png" alt="PixBee" />
                                            <Input
                                                placeholder="Digite sua chave pix"
                                                value={formattedPixKey}
                                                onChange={handlePixKeyChange}
                                            />
                                            {pixKeyType && (
                                                <Badge colorScheme="blue" mt={2}>
                                                    {pixKeyType}
                                                </Badge>
                                            )}
                                            <InputGroup>
                                                <Input
                                                    placeholder="Digite a quantidade de "
                                                    value={amountHBD}
                                                    onChange={handleAmountChange}
                                                    type="number"
                                                />
                                                <InputRightAddon color={'red'}>
                                                    HBD
                                                </InputRightAddon>
                                            </InputGroup>
                                            {amountHBD && (
                                                <Badge
                                                    colorScheme="green"
                                                    fontSize="3xl"
                                                    variant="outline"
                                                    w={'full'}
                                                >
                                                    <Center>
                                                        R$  {calculateTotalPixPayment(parseFloat(amountHBD))}
                                                    </Center>
                                                </Badge>
                                            )}
                                            <Button w={'100%'} variant={'outline'} colorScheme="red" onClick={handleSubmit}>
                                            Enviar Hive Dollars
                                        </Button>
                                        </>
                                    ) : (
                                        <>
                                            <Alert status="warning">
                                                <AlertIcon />
                                                <AlertDescription>
                                                    <Text>Available {HBDAvailable} HBD</Text>
                                                </AlertDescription>
                                            </Alert>
                                            <Image width={'70%'} src="/logos/Pix-HBD.png" alt="PixBee" />
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
                                                <Text
                                                    m={2}
                                                    fontSize={"12px"}
                                                >
                                                    {pixBeeData?.pixbeePixKey}
                                                </Text>
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
                                                    <AlertDescription fontSize={"12px"}>
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
};

export default Pix;
