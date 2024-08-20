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
    useToast,
    VStack
} from "@chakra-ui/react";
import axios from "axios";
import { QrCodePix } from 'qrcode-pix';
import React, { useEffect, useState } from "react";
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
    OurExchangePer: number;
    OurExchangeFee: number;
    OurRefundPer: string;
    transactionFee: number;
    fixedFee: number;
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

const LimitsTable: React.FC<PixBeeData> = (props) => {

    return (
        <Card w="full" height={'700px'}>
            <CardHeader>
                <Center>Limites e Taxas</Center>
            </CardHeader>
            <Alert status="warning" mb={4}>
                <AlertIcon />
                <AlertDescription>
                    <Text> <strong>{props.balancePix}</strong> PIX Disponíveis no SkateBank</Text>
                </AlertDescription>
            </Alert>
            <Alert status="warning" mb={4}>
                <AlertIcon />
                <AlertDescription>
                    <Text> <strong>{props.balanceHbd}</strong> HBD Disponíveis no SkateBank</Text>

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
                            <Td>{props.depositMinLimit} PIX</Td>
                        </Tr>
                        <Tr>
                            <Td>Taxa Variável</Td>
                            <Td>{props.transactionFee}1%</Td>
                        </Tr>
                        <Tr>
                            <Td>Taxa Fixa</Td>
                            <Td>{props.fixedFee} 2 PIX</Td>
                        </Tr>
                    </Tbody>
                </Table>
            </CardBody>
        </Card>
    );
};

const fetchPixBeeData = async () => {
    try {
        const response = await axios.get(`https://aphid-glowing-fish.ngrok-free.app/skatebank`, {
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

const validateCPF = (cpf: string) => {
    cpf = cpf.replace(/[^\d]+/g, '');
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

    let sum = 0;
    for (let i = 0; i < 9; i++) {
        sum += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let remainder = (sum * 10) % 11;
    if (remainder === 10) remainder = 0;
    if (remainder !== parseInt(cpf.charAt(9))) return false;

    sum = 0;
    for (let i = 0; i < 10; i++) {
        sum += parseInt(cpf.charAt(i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10) remainder = 0;
    return remainder === parseInt(cpf.charAt(10));
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
    const [pixTotalPayment, setPixTotalPayment] = useState("0.000");
    const [pixKey, setPixKey] = useState("");
    const [formattedPixKey, setFormattedPixKey] = useState("");
    const [pixKeyType, setPixKeyType] = useState("");
    const [error, setError] = useState<string | null>(null);
    const toast = useToast();
    const [qrCodeValue, setQrCodeValue] = useState('');
    const [isInBrazil, setIsInBrazil] = useState(false);
    const [countdown, setCountdown] = useState<number>(30);
    const [qrCodePayload, setQrCodePayload] = useState<string | null>(null);

    // const [currentHBDPrice, setCurrentHBDPrice] = useState<number>(0);

    // useEffect(() => {
    //     const fetchPixBeeData = async () => {
    //         try {
    //             const response = await fetch('https://aphid-glowing-fish.ngrok-free.app/hbdticker');
    //             const data = await response.json();
    //             setPixBeeData(data);
    //             setCurrentHBDPrice(parseFloat(data.HBDPriceBRL) || 0);
    //         } catch (error) {
    //             console.error("Failed to fetch updated PixBee data:", error);
    //         }
    //     };

    //     const interval = setInterval(() => {
    //         setCountdown(prevCountdown => prevCountdown - 1);
    //     }, 1000);

    //     if (countdown === 0) {
    //         fetchPixBeeData();
    //         setCountdown(30); // Reseta o countdown após a atualização
    //     }

    //     return () => clearInterval(interval);
    // }, [countdown]);

    useEffect(() => {
        if (pixBeeData && userHiveBalance) {
            const isExceeded = parseFloat(amountHBD) > userHiveBalance.HBDUsdValue;
            setIsExceeded(isExceeded);

            if (isExceeded) {
                setError("O valor inserido excede o saldo disponível.");
            } else {
                setError(null);
            }
        }
    }, [amountHBD, pixBeeData, userHiveBalance]);

    useEffect(() => {
        const checkLocation = async () => {
            try {
                const response = await axios.get('https://ipapi.co/json/');
                const countryCode = response.data.country_code;
                setIsInBrazil(countryCode === 'BR');
            } catch (error) {
                console.error("Failed to fetch location data:", error);
            }
        };

        checkLocation();
    }, []);

    useEffect(() => {
        if (isInBrazil) {
            fetchPixBeeData().then((data) => {
                setPixBeeData(data);
            }).catch(error => {
                console.error("Failed to fetch PixBee data:", error);
            });
        }
    }, [isInBrazil]);


    useEffect(() => {
        const generateQrCode = async () => {
            try {
                if (!pixBeeData?.pixbeePixKey) {
                    throw new Error('Chave PIX não definida.');
                }
                if (!amountHBD || isNaN(parseFloat(amountHBD))) {
                    throw new Error('Quantidade HBD inválida.');
                }
    
                const valueHBD = parseFloat(amountHBD);
                const valueBRL = parseFloat((valueHBD * parseFloat(pixBeeData.HBDPriceBRL)).toFixed(2));
                
                console.log('Chave PIX:', pixBeeData?.pixbeePixKey);
                console.log('Quantidade HBD:', amountHBD);
                console.log('Valor em BRL:', valueBRL);
    
                const qrCodePix = QrCodePix({
                    version: '01',
                    key: pixBeeData?.pixbeePixKey || '',
                    name: "PixBee",
                    city: '',
                    message: `${user.name}`,
                    value: valueBRL,
                });
    
                if (typeof qrCodePix.payload === 'function') {
                    const payload = qrCodePix.payload();
                    setQrCodePayload(payload);
                } else {
                    console.warn('Método payload não encontrado em QrCodePix.');
                }
    
                const qrCodeBase64 = await qrCodePix.base64();
    
                console.log('QR Code Base64:', qrCodeBase64);
    
                if (qrCodeBase64 && qrCodeBase64.startsWith('data:image/png;base64,')) {
                    setQrCodeValue(qrCodeBase64);
                } else {
                    throw new Error('QR code Base64 string inválido.');
                }
            } catch (error) {
                console.error('Erro ao gerar QR code PIX:', error);
            }
        };
    
        if (!isSell) {
            generateQrCode();
        }
    }, [amountHBD, pixBeeData?.pixbeePixKey, user.name, isSell]);


    useEffect(() => {
        fetchPixBeeData().then((data) => {
            setPixBeeData(data);
        }).catch(error => {
            console.error("Failed to fetch PixBee data:", error);
        });
    }, []);

    const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setAmountHBD(value);
        const parsedValue = parseFloat(value);
        setIsExceeded(parsedValue > HBDAvailable);
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
                formattedKey = event.target.value.trim();
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

    function calculateLiquidDeposit(realValue: number): number {
        if (!pixBeeData) {
            throw new Error('PixBeeData não está definido');
        }
        const exchangePer = pixBeeData.OurExchangePer || 0;
        const exchangeFee = pixBeeData.OurExchangeFee || 0;
        return parseFloat((realValue * (1 - exchangePer) - exchangeFee).toFixed(2));
    }

    function findBruteValue(liquidPlusTax: number, valorPix: number, token: string): number {
        if (!pixBeeData) {
            throw new Error('PixBeeData não está definido');
        }

        const epsilon = 0.001;
        let brutoDeposit = 0;
        let countWhile = 0;

        if (token === "" || token === "HBD") {
            const hbdPriceBRL = parseFloat(pixBeeData.HBDPriceBRL);
            brutoDeposit = liquidPlusTax / hbdPriceBRL;

            while (calculateLiquidDeposit(brutoDeposit) < valorPix) {
                brutoDeposit += epsilon;
                brutoDeposit = parseFloat(brutoDeposit.toFixed(3));
                countWhile++;
                const diferenca = calculateLiquidDeposit(brutoDeposit) - valorPix;
                if (diferenca < -0.01) {
                    brutoDeposit = parseFloat((brutoDeposit - diferenca).toFixed(3));
                }
            }
            return brutoDeposit;

        }

        throw new Error('Token não suportado');
    }

    const calculateBruteValue = (valorPix: number, token: string): number => {
        if (!pixBeeData) {
            throw new Error('PixBeeData não está definido');
        }
        const exchangeFee = pixBeeData.OurExchangeFee || 0;
        const exchangePer = parseFloat(pixBeeData.OurExchangePer.toString()) || 0;
        let liquidplustax = valorPix + exchangeFee;
        liquidplustax = liquidplustax * (1 + exchangePer);
        let bruteValue = findBruteValue(liquidplustax, valorPix, token);
        return bruteValue / parseFloat(pixBeeData.HBDPriceBRL);
    };

    const calculateMinimumHBDAmount = (): number | undefined => {
        if (pixBeeData && pixBeeData.HBDPriceBRL) {
            const MINIMUM_PIX_VALUE_BRL = pixBeeData.depositMinLimit || 0;
            return calculateBruteValue(MINIMUM_PIX_VALUE_BRL, "HBD");
        }
        return undefined;
    };

    const setMinAmount = () => {
        const minHBD = calculateMinimumHBDAmount();
        console.log("Valor mínimo HBD: setMinAmount");
        if (minHBD !== undefined) {
            setAmountHBD(minHBD.toFixed(3));
            setIsExceeded(parseFloat(minHBD.toFixed(3)) > HBDAvailable);
        }
        countdown
    };

    const handleSubmit = () => {
        try {
            if (isExceeded) {

                let isValidKey = false;

                if (pixKeyType === "CPF") {
                    isValidKey = validateCPF(pixKey);
                } else {
                    isValidKey = ['CNPJ', 'Email', 'Chave Aleatória', "Telefone"].includes(pixKeyType);
                }
                if (!isValidKey) {
                    throw new Error('Chave Pix inválida');
                }


                setDisplayModal(true);
                setError(null);
            }
        } catch (error: any) {
            console.error(error);
            setError('Por favor, insira uma chave Pix válida.');
            toast({
                title: 'Erro',
                description: error.message,
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        }
    };

    function calculateTotalPixPayment(amount: number) {
        if (!pixBeeData) {
            throw new Error('PixBeeData não está definido');
        }

        const hbdtoBrl = parseFloat(pixBeeData.HBDPriceBRL);
        const fee = (hbdtoBrl * amount) * 0.01 + 2;
        const totalPayment = hbdtoBrl * amount - fee;

        return totalPayment.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'PIX', 
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    }


    useEffect(() => {
        if (amountHBD) {
            setPixTotalPayment(calculateTotalPixPayment(parseFloat(amountHBD)));
        }
    }, [amountHBD, pixBeeData]);

    const handleCopy = () => {
        if (qrCodePayload) {
            navigator.clipboard.writeText(qrCodePayload).then(() => {
                alert('Payload copiado para a área de transferência!');
            }).catch(err => {
                console.error('Erro ao copiar o payload:', err);
            });
        }
    };

    if (!isInBrazil) {
        return (
            <Center>
                <Alert
                    status="info"><AlertIcon /><AlertTitle>Localização não permitida</AlertTitle><AlertDescription>
                        O serviço está disponível apenas para usuários no Brasil.
                    </AlertDescription></Alert>
            </Center>
        );
    }

    if (!pixBeeData) {
        return (
            <Center>
                <Text color={'limegreen'}>Call Vaipraonde in Discord and ask him to turn on his raspberry...</Text>
            </Center>
        );
    }
    return (
        <>
            <Center mt="20px">
                <Container maxW="container.lg">
                    <VStack mt={1} spacing={4} flexDirection={{ base: "column", xl: "row" }}>
                        <Card w="full" height={"700px"} fontFamily={'Joystix'}>
                            <CardHeader>
                                <Center>
                                    <VStack spacing={2}>

                                        <Text fontSize="lg">
                                            {isSell ? "Sacar usando PIX:" : "Depositar usando Pix:"}
                                        </Text>
                                        <Switch
                                            isChecked={!isSell}
                                            onChange={() => setIsSell(!isSell)}
                                            ml={4}
                                        />
                                    </VStack>
                                </Center>
                            </CardHeader>
                            <CardBody>
                                <VStack spacing={4}>

                                    {isSell ? (
                                        <>


                                            <Text> Seu Saldo disponível: {userHiveBalance.HBDUsdValue} HBD</Text>

                                            <Image width={'70%'} src={"/logos/HBD-Pix.png"} alt="PixBee" />
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
                                                    placeholder="Digite a quantidade de"
                                                    value={amountHBD}
                                                    onChange={handleAmountChange}
                                                    type="number"
                                                />
                                                <InputRightAddon color={'red'}>
                                                    HBD
                                                </InputRightAddon>
                                            </InputGroup>
                                            {amountHBD && (
                                                <Badge colorScheme="green" fontSize="3xl" variant="outline" w={'full'}
                                                ><Text textAlign="center">
                                                        {pixTotalPayment}
                                                    </Text>
                                                </Badge>
                                            )}
                                            <HStack spacing={4} mt={4}>
                                                <Button colorScheme="blue" onClick={setMinAmount}>
                                                    Mínimo
                                                </Button>
                                                {/* <p> {countdown} </p> */}

                                            </HStack>
                                            {isExceeded && (
                                                <Text color="red.500">
                                                    O valor excede seu saldo disponível.
                                                </Text>
                                            )}
                                            <Button w={'100%'} variant={'outline'} colorScheme="red" onClick={handleSubmit}>
                                                Enviar Hive Dollars
                                            </Button>

                                        </>
                                    ) : (
                                        <>
                                            <Image width={'70%'} src="/logos/Pix-hbd.png" alt="PixBee" />
                                            <Box filter={isBlurred ? "blur(5px)" : "none"}>
                                                {qrCodeValue ? (
                                                    <Image src={qrCodeValue} alt="QR Code" />
                                                ) : (
                                                    <Text >Loading QR Code...</Text>
                                                )}
                                            </Box>
                                            {qrCodePayload && (
                                                <Box mt={4}>
                                                    <Button colorScheme="blue" onClick={handleCopy} filter={isBlurred ? "blur(5px)" : "none"}
                                                        isDisabled={isBlurred}>
                                                        PIX Copia e Cola
                                                    </Button>
                                                </Box>
                                            )}
                                            <Input
                                                placeholder="Digite a quantidade de HBD"
                                                value={amountHBD}
                                                onChange={handleAmountChange}
                                            />

                                        </>
                                    )}
                                </VStack>
                            </CardBody>
                        </Card>
                        {pixBeeData && <LimitsTable {...pixBeeData} />}
                        {displayModal && (
                            <SendHBDModal
                                username={user.name}
                                visible={displayModal}
                                onClose={() => setDisplayModal(false)}
                                hbdAmount={amountHBD}
                                pixAmount={parseFloat(pixTotalPayment)}
                                memo={pixBeeData?.pixbeePixKey || ''}
                                availableBalance={HBDAvailable}
                                hbdToBrlRate={parseFloat(pixBeeData?.HBDPriceBRL) || 0}
                            />
                        )}

                    </VStack>
                </Container>
            </Center>
        </>
    );
};

export default Pix;
