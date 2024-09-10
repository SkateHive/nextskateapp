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
    Text,
    useToast,
    VStack
} from "@chakra-ui/react";
import axios from "axios";
import { QrCodePix } from 'qrcode-pix';
import React, { useEffect, useState } from "react";
import { fetchPixBeeData, formatCNPJ, formatCPF, formatRandomKey, formatTelephone, validateCPF, validatePhone } from "../utils/fetchPixBeeData";
import { LimitsTable } from "./LimitesTable";
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
const Pix = ({ user }: PixProps) => {
    const [userAmountHBD, setUserAmountHBD] = useState("");
    const [isSell, setIsSell] = useState(true);
    const [isExceeded, setIsExceeded] = useState(false);
    const [pixbeeInputPixKey, setPixbeeInputPixKey] = useState<PixBeeData | null>(null);
    const userHiveBalance = useHiveBalance(user);
    const HBDAvailable = pixbeeInputPixKey ? parseFloat(pixbeeInputPixKey.balanceHbd) : 0;
    const [displayModal, setDisplayModal] = useState(false);
    const [pixTotalPayment, setPixTotalPayment] = useState("0.000");
    const [pixKey, setPixKey] = useState("");
    const [userFormatedPixKey, setUserFormatedPixKey] = useState("");
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
        if (pixbeeInputPixKey && userHiveBalance) {
            const isExceeded = parseFloat(userAmountHBD) > userHiveBalance.HBDUsdValue;
            setIsExceeded(isExceeded);

            if (isExceeded) {
                setError("O valor inserido excede o saldo disponível.");
            } else {
                setError(null);
            }
        }
    }, [userAmountHBD, pixbeeInputPixKey, userHiveBalance]);
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
                setPixbeeInputPixKey(data);
            }).catch(error => {
                console.error("Failed to fetch PixBee data:", error);
            });
        }
    }, [isInBrazil]);
    useEffect(() => {
        const generateQrCode = async () => {
            try {
                if (!pixbeeInputPixKey?.pixbeePixKey) {
                    throw new Error('Chave PIX não definida.');
                }
                if (!userAmountHBD || isNaN(parseFloat(userAmountHBD))) {
                    throw new Error('Quantidade HBD inválida.');
                }

                const valueHBD = parseFloat(userAmountHBD);
                const valueBRL = parseFloat((valueHBD * parseFloat(pixbeeInputPixKey.HBDPriceBRL)).toFixed(2));

                console.log('Chave PIX:', pixbeeInputPixKey?.pixbeePixKey);
                console.log('Quantidade HBD:', userAmountHBD);
                console.log('Valor em BRL:', valueBRL);

                const qrCodePix = QrCodePix({
                    version: '01',
                    key: pixbeeInputPixKey?.pixbeePixKey || '',
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
    }, [userAmountHBD, pixbeeInputPixKey?.pixbeePixKey, user.name, isSell]);
    useEffect(() => {
        fetchPixBeeData().then((data) => {
            setPixbeeInputPixKey(data);
        }).catch(error => {
            console.error("Failed to fetch PixBee data:", error);
        });
    }, []);
    const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setUserAmountHBD(value);
        const parsedValue = parseFloat(value);
        setIsExceeded(parsedValue > HBDAvailable);
    };
    const isBlurred = !userAmountHBD || parseFloat(userAmountHBD) > HBDAvailable;
    const handlePixKeyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value.replace(/[^\d\w@.]/g, '');

        let pixKeyType = '';
        let sanitizedPixKey = '';

        try {
            if (/^\d{11}$/.test(value)) {
                if (value[2] === '9') {
                    pixKeyType = "Telefone";
                    sanitizedPixKey = formatTelephone(value);
                } else {
                    pixKeyType = "CPF";
                    sanitizedPixKey = formatCPF(value);
                }
            } else if (/^\d{10}$/.test(value) && value.startsWith('0')) {
                pixKeyType = "Telefone";
                sanitizedPixKey = formatTelephone(value);
            } else if (/^\d{14}$/.test(value)) {
                pixKeyType = "CNPJ";
                sanitizedPixKey = formatCNPJ(value);
            } else if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                pixKeyType = "Email";
                sanitizedPixKey = value;
            } else if (/^[a-fA-F0-9]{32}$/.test(value)) {
                pixKeyType = "Chave Aleatória";
                sanitizedPixKey = formatRandomKey(value);
            } else {
                throw new Error("Chave Pix inválida");
            }
        } catch (error) {
            console.error('Erro ao sanitizar chave Pix:', error);
            pixKeyType = "Desconhecido";
            sanitizedPixKey = value;
        }

        setPixKey(value);
        setPixKeyType(pixKeyType);
        setUserFormatedPixKey(sanitizedPixKey);
        setError(null);
    };
    function calculateLiquidDeposit(realValue: number): number {
        if (!pixbeeInputPixKey) {
            throw new Error('PixBeeData não está definido');
        }
        const exchangePer = pixbeeInputPixKey.OurExchangePer || 0;
        const exchangeFee = pixbeeInputPixKey.OurExchangeFee || 0;
        return parseFloat((realValue * (1 - exchangePer) - exchangeFee).toFixed(2));
    }
    function findBruteValue(liquidPlusTax: number, valorPix: number, token: string): number {
        if (!pixbeeInputPixKey) {
            throw new Error('PixBeeData não está definido');
        }

        const epsilon = 0.001;
        let brutoDeposit = 0;
        let countWhile = 0;

        if (token === "" || token === "HBD") {
            const hbdPriceBRL = parseFloat(pixbeeInputPixKey.HBDPriceBRL);
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
        if (!pixbeeInputPixKey) {
            throw new Error('PixBeeData não está definido');
        }
        const exchangeFee = pixbeeInputPixKey.OurExchangeFee || 0;
        const exchangePer = parseFloat(pixbeeInputPixKey.OurExchangePer.toString()) || 0;
        let liquidplustax = valorPix + exchangeFee;
        liquidplustax = liquidplustax * (1 + exchangePer);
        let bruteValue = findBruteValue(liquidplustax, valorPix, token);
        return bruteValue / parseFloat(pixbeeInputPixKey.HBDPriceBRL);
    };
    const calculateMinimumHBDAmount = (): number | undefined => {
        if (pixbeeInputPixKey && pixbeeInputPixKey.HBDPriceBRL) {
            const MINIMUM_PIX_VALUE_BRL = pixbeeInputPixKey.depositMinLimit || 0;
            return calculateBruteValue(MINIMUM_PIX_VALUE_BRL, "HBD");
        }
        return undefined;
    };
    const setMinAmount = () => {
        const minHBD = calculateMinimumHBDAmount();
        console.log("Valor mínimo HBD: setMinAmount");
        if (minHBD !== undefined) {
            setUserAmountHBD(minHBD.toFixed(3));
            setIsExceeded(parseFloat(minHBD.toFixed(3)) > HBDAvailable);
        }
        countdown
    };
    const handleSubmit = () => {
        try {
            let isValidKey = false;
    
            // Validando os diferentes tipos de chave Pix
            if (pixKeyType === "CPF") {
                isValidKey = validateCPF(pixKey);
            } else if (pixKeyType === "Telefone") {
                isValidKey = validatePhone(pixKey);
            } else if (["CNPJ", "Email", "Chave Aleatória"].includes(pixKeyType)) {
                isValidKey = true;
            }
    
            if (!isValidKey) {
                throw new Error("Chave Pix inválida. Por favor, verifique os dados inseridos.");
            }
    
            // Se a chave for válida, exibe o modal
            setDisplayModal(true);
            setError(null);
        } catch (error: any) {
            setError(error.message);
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
        if (!pixbeeInputPixKey) {
            throw new Error('PixBeeData não está definido');
        }

        const hbdtoBrl = parseFloat(pixbeeInputPixKey.HBDPriceBRL);
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
        if (userAmountHBD) {
            setPixTotalPayment(calculateTotalPixPayment(parseFloat(userAmountHBD)));
        }
    }, [userAmountHBD, pixbeeInputPixKey]);
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
    if (!pixbeeInputPixKey) {
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
                                                value={userFormatedPixKey}
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
                                                    value={userAmountHBD}
                                                    onChange={handleAmountChange}
                                                    type="number"
                                                />
                                                <InputRightAddon color={'red'}>
                                                    HBD
                                                </InputRightAddon>
                                            </InputGroup>
                                            {userAmountHBD && (
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
                                            {error && (
                                                <Text color="red.500">{error}</Text>
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
                                                value={userAmountHBD}
                                                onChange={handleAmountChange}
                                            />
                                        </>
                                    )}
                                </VStack>
                            </CardBody>
                        </Card>
                        {pixbeeInputPixKey && <LimitsTable {...pixbeeInputPixKey} />}
                        {displayModal && (
                            <SendHBDModal
                                username={user.name}
                                visible={displayModal}
                                onClose={() => setDisplayModal(false)}
                                userAmountHBD={userAmountHBD}
                                pixAmountBRL={parseFloat(pixTotalPayment)}
                                memo={userFormatedPixKey || ''}
                                availableBalance={HBDAvailable}
                                hbdToBrlRate={parseFloat(pixbeeInputPixKey?.HBDPriceBRL) || 0}
                            />
                        )}
                    </VStack>
                </Container>
            </Center>
        </>
    );
};

export default Pix;
