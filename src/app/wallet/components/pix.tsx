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
import { fetchPixBeeData, formatCNPJ, formatCPF, formatRandomKey, formatTelephone } from "../utils/fetchPixBeeData";
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

// type PIX_KEY_TYPE [
//     DESCONHECIDO: "Desconhecido",
//     CPF: "CPF",
//     CPF: "CPF",
//     CPF: "CPF",
//     CPF: "CPF",
// ]

const Pix = ({ user }: PixProps) => {
    const [isInBrazil, setIsInBrazil] = useState(false);
    const [isSell, setIsSell] = useState(true);

    const [error, setError] = useState<string | null>("Formulario em branco");
    const [isExceeded, setIsExceeded] = useState(false);    // is greater than available pix balance
    const [isLessMinimum, setIsLessMinimum] = useState(true);// is less then minimum
    const [userHasBalance, setUserHasBalance] = useState(false);// is less then minimum

    const [displayModal, setDisplayModal] = useState(false);
    const [userInputHBD, setUserInputHBD] = useState("");   // user input hbd value for pix
    const userHiveBalance = useHiveBalance(user);
    const [errorPixDeposit, setErrorPixDeposit] = useState<string | null>("");
    const [qrCodeValue, setQrCodeValue] = useState<string | null>(null);
    const [isInputDisabled, setIsInputDisabled] = useState(false);
    const [isMinButtonDisabled, setIsMinButtonDisabled] = useState(false);
    const [isHalfButtonDisabled, setIsHalfButtonDisabled] = useState(false);
    const [isMaxButtonDisabled, setIsMaxButtonDisabled] = useState(false);
    const [isSendButtonDisabled, setIsSendButtonDisabled] = useState(false);
    const [pixbeeData, setPixbeeData] = useState<PixBeeData | null>(null);
    const [pixTotalPayment, setPixTotalPayment] = useState("0.000");
    const [pixKey, setPixKey] = useState("");
    const [userFormatedPixKey, setUserFormatedPixKey] = useState("");
    const [pixKeyType, setPixKeyType] = useState("Desconhecido");
    const [qrCodePayload, setQrCodePayload] = useState<string | null>(null);
    const toast = useToast();

    useEffect(() => {
        if (pixbeeData && userHiveBalance) {
            const isExceeded = parseFloat(userInputHBD) > userHiveBalance.HBDUsdValue;
            setIsExceeded(isExceeded);

            // console.log("setUserHasBalance "+setUserHasBalance)

            if (isExceeded) {
                setError("O valor inserido excede seu saldo disponível.");
            } else {
                setError(null);
            }
        }
    }, [userInputHBD, pixbeeData, userHiveBalance]);


    useEffect(() => {
        if (pixbeeData && pixbeeData.depositMinLimit && userHiveBalance) {
            const userHBDValue = parseFloat(userInputHBD);

            const pixValue = calculateTotalPixPayment(userHBDValue);
            const isLessMinimum = pixValue < pixbeeData.depositMinLimit;

            setIsLessMinimum(isLessMinimum);

            const exceedsBalance = userHBDValue > userHiveBalance.HBDUsdValue;

            if (isLessMinimum) {
                setError(`O valor inserido é menor que o limite mínimo de R$ ${pixbeeData.depositMinLimit}`);
                setIsSendButtonDisabled(true);
                setIsInputDisabled(false);
                setIsMinButtonDisabled(false);
                setIsHalfButtonDisabled(false);
                setIsMaxButtonDisabled(false);
            } else if (exceedsBalance) {
                setError("O valor inserido excede o saldo disponível.");
                setIsSendButtonDisabled(true);
                setIsInputDisabled(false);
                setIsMinButtonDisabled(false);
                setIsHalfButtonDisabled(false);
                setIsMaxButtonDisabled(false);
            } else {
                setError(null);
                setIsSendButtonDisabled(false);
                setIsInputDisabled(false);
                setIsMinButtonDisabled(false);
                setIsHalfButtonDisabled(false);
                setIsMaxButtonDisabled(false);
            }
        }
    }, [userInputHBD, pixbeeData, userHiveBalance]);

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
                setPixbeeData(data);
            }).catch(error => {
                console.error("Failed to fetch PixBee data:", error);
            });
        }
    }, [isInBrazil]);
    useEffect(() => {
        const generateQrCode = async () => {
            try {
                if (!pixbeeData?.pixbeePixKey) {
                    setErrorPixDeposit('Chave PIX não definida.');
                    setQrCodeValue(null);
                    setQrCodePayload(null);
                    return;
                }

                if (!userInputHBD || isNaN(parseFloat(userInputHBD))) {
                    setErrorPixDeposit('Coloque um valor desejável.');
                    setQrCodeValue(null);
                    setQrCodePayload(null);
                    return;
                }

                const valueHBD = parseFloat(userInputHBD);
                const balance = parseFloat(pixbeeData.balanceHbd);

                if (valueHBD <= 0) {
                    setErrorPixDeposit('Valor de HBD deve ser maior que zero.');
                    setQrCodeValue(null);
                    setQrCodePayload(null);
                    return;
                }

                if (valueHBD > balance) {
                    setErrorPixDeposit('Não temos esse valor disponível na Skatebank.');
                    setQrCodeValue(null);
                    setQrCodePayload(null);
                    return;
                }

                const valueBRL = parseFloat((valueHBD * parseFloat(pixbeeData.HBDPriceBRL)).toFixed(2));

                console.log('Chave PIX:', pixbeeData?.pixbeePixKey);
                console.log('Quantidade HBD:', userInputHBD);
                console.log('Valor em BRL:', valueBRL);

                const qrCodePix = QrCodePix({
                    version: '01',
                    key: pixbeeData?.pixbeePixKey,
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
                    setErrorPixDeposit(null);
                } else {
                    setErrorPixDeposit('QR code Base64 string inválido.');
                    setQrCodeValue(null);
                    setQrCodePayload(null);
                }
            } catch (error: any) {
                console.error('Erro ao gerar QR code PIX:', error);
                setErrorPixDeposit(error.message);
                setQrCodeValue(null);
                setQrCodePayload(null);
            }
        };

        if (!isSell) {
            generateQrCode();
        }
    }, [userInputHBD, pixbeeData?.pixbeePixKey, user.name, isSell, pixbeeData?.HBDPriceBRL, userHiveBalance.HBDUsdValue]);

    const formatValue = (value: string): string => {
        // Remove qualquer caractere não numérico ou ponto
        const sanitizedValue = value.replace(/[^0-9.]/g, '');

        // Divide a parte inteira e decimal
        const [integerPart, decimalPart] = sanitizedValue.split('.');

        // Formata a parte inteira com separadores de milhar
        const formattedIntegerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

        // Limita a parte decimal a 3 dígitos e adiciona zeros se necessário
        const formattedDecimalPart = decimalPart ? decimalPart.slice(0, 3) : '000';

        // Retorna a string formatada apenas se houver parte decimal
        return decimalPart ? `${formattedIntegerPart}.${formattedDecimalPart}` : formattedIntegerPart;
    };


    const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = event.target.value;
        const formattedValue = formatValue(rawValue);

        setUserInputHBD(formattedValue);
        const parsedValue = parseFloat(formattedValue);
        setIsExceeded(parsedValue > parseFloat(pixbeeData ? pixbeeData.balanceHbd : "0"));
    };

    const isBlurred = !userInputHBD || parseFloat(userInputHBD) > parseFloat(pixbeeData ? pixbeeData.balanceHbd : "0");
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
                setError("Chave Pix inválida");
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
        if (!pixbeeData) {
            throw new Error('PixBeeData não está definido');
        }
        const exchangePer = pixbeeData.OurExchangePer;
        const exchangeFee = pixbeeData.OurExchangeFee;
        return parseFloat((realValue * (1 - exchangePer) - exchangeFee).toFixed(2));
    }

    function findBruteValue(liquidPlusTax: number, valorPix: number, token: string): number {
        if (!pixbeeData) {
            throw new Error('PixBeeData não está definido');
        }

        const epsilon = 0.001;
        let brutoDeposit = 0;
        let countWhile = 0;

        if (token === "" || token === "HBD") {
            const hbdPriceBRL = parseFloat(pixbeeData.HBDPriceBRL);
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
        if (!pixbeeData) {
            throw new Error('PixBeeData não está definido');
        }
        const exchangeFee = pixbeeData.OurExchangeFee || 0;
        const exchangePer = parseFloat(pixbeeData.OurExchangePer.toString());
        let liquidplustax = valorPix + exchangeFee;
        liquidplustax = liquidplustax * (1 + exchangePer);
        let bruteValue = findBruteValue(liquidplustax, valorPix, token);
        return bruteValue / parseFloat(pixbeeData.HBDPriceBRL);
    };

    const calculateMinimumHBDAmount = (): number | undefined => {
        if (pixbeeData && pixbeeData.HBDPriceBRL) {
            const MINIMUM_PIX_VALUE_BRL = pixbeeData.depositMinLimit || 0;
            return calculateBruteValue(MINIMUM_PIX_VALUE_BRL, "HBD");
        }
        return undefined;
    };

    const setMinAmount = () => {
        const minHBD = calculateMinimumHBDAmount();
        console.log("Valor mínimo HBD: setMinAmount");
        if (minHBD !== undefined) {
            setUserInputHBD(minHBD.toFixed(3));
            setIsExceeded(parseFloat(minHBD.toFixed(3)) > userHiveBalance.HBDUsdValue);
        }
    };

    const setMaxAmount = () => {
        console.log("Valor máximo HBD: setMaxAmount");
        setUserInputHBD(userHiveBalance.HBDUsdValue.toFixed(3));
        setIsExceeded(false);
    }

    const setHalfAmount = () => {
        console.log("Valor médio HBD: setHalfAmount");
        const halfAmount = userHiveBalance.HBDUsdValue / 2;
        setUserInputHBD(halfAmount.toFixed(3));
        setIsExceeded(false);
    };

    const handleSubmit = () => {
        console.log("verificacoes");
        console.log("pixKeyType!=Desconhecido " + pixKeyType);
        // console.log("userHasBalance "           + userHasBalance);
        console.log("isLessMinimum " + isLessMinimum);
        console.log("error === null " + error);

        if ((!isExceeded)
            && (pixKeyType != "Desconhecido")
            && (!isLessMinimum)
            && ((error === null))
        ) setDisplayModal(true);
        else {
            throw new Error("Confira os valores inseridos.");
        }
    };

    function calculateTotalPixPayment(amountHBD: any): number {
        if (!pixbeeData) {
            throw new Error('PixBeeData não está definido');
        }

        try {
            amountHBD = parseFloat(amountHBD);
            const hbdtoBrl = parseFloat(pixbeeData.HBDPriceBRL);
            const fee = (hbdtoBrl * amountHBD) * 0.01 + 2;
            var totalPayment = hbdtoBrl * amountHBD - fee;
            if (totalPayment < 0) totalPayment = 0;
            return parseFloat(totalPayment.toFixed(2));
        } catch {
            console.log("amountn HBD nao eh numero valido");
            return 0;
        }
    }

    useEffect(() => {
        if (userInputHBD) {
            var pix = calculateTotalPixPayment(userInputHBD);
            const pixTotal = pix.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'PIX',
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            });
            setPixTotalPayment(pixTotal);
        } else {
            setPixTotalPayment("PIX 0.00");
        }
    }, [userInputHBD, pixbeeData]);

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
    if (!pixbeeData) {
        return (
            <Center>
                <Text color={'limegreen'}>Call Vaipraonde in Discord and ask him to turn on his raspberry...</Text>
            </Center>
        );
    }
    return (
        <>
            <Center mt="20px"  >
                <Container maxW="container.lg">
                    <VStack mt={1} spacing={4} flexDirection={{ base: "column", xl: "row" }}>
                        <Card w="100%" fontFamily={'Joystix'} bg="black" border="1px solid white">
                            <CardHeader>
                                <Center>
                                    <VStack spacing={2}>
                                        <Text fontSize="lg" color="white">
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
                                            <Text
                                                color="white"
                                                fontSize={{ base: "sm", md: "md" }}
                                                textAlign="center"
                                                mb={4}

                                            >
                                                Seu Saldo disponível: {userHiveBalance.HBDUsdValue} HBD
                                            </Text>


                                            <Input
                                                placeholder="Digite sua chave pix"
                                                value={userFormatedPixKey}
                                                onChange={handlePixKeyChange}
                                                sx={{
                                                    '::placeholder': {
                                                        color: 'white',
                                                    },
                                                }}
                                                color="white"
                                                fontSize={{ base: "sm", md: "md" }}
                                                mb={4}
                                                w="100%"
                                                borderColor="limegreen"
                                                _hover={{ borderColor: "white" }}
                                                _focus={{ borderColor: "limegreen", boxShadow: "0 0 0 1px limegreen" }}
                                            />

                                            {pixKeyType && (
                                                <Badge colorScheme="blue" mt={2} fontSize={{ base: "xs", md: "sm" }}>
                                                    {pixKeyType}
                                                </Badge>
                                            )}

                                            <InputGroup
                                                display="flex"
                                                alignItems="center"
                                                justifyContent="flex-start"
                                                w="100%"
                                            >
                                                <Input
                                                    placeholder="0.000"
                                                    value={userInputHBD}
                                                    onChange={handleAmountChange}
                                                    type="text"
                                                    flex="1"
                                                    sx={{
                                                        '::placeholder': {
                                                            color: 'white',
                                                        },
                                                    }}
                                                    color="white"
                                                    borderColor="limegreen"
                                                    _hover={{ borderColor: "white" }}
                                                    _focus={{ borderColor: "limegreen", boxShadow: "0 0 0 1px limegreen" }}
                                                    mr={{ base: 0, md: 2 }}
                                                    w="100%"
                                                    isDisabled={isInputDisabled}
                                                />
                                                <InputRightAddon
                                                    color="white"
                                                    bg="black"
                                                    borderColor="limegreen"
                                                    px={4}
                                                    fontSize={{ base: "sm", md: "md" }}
                                                    w="auto"
                                                    flexShrink={0}
                                                >
                                                    HBD
                                                </InputRightAddon>

                                                <HStack
                                                    spacing={2}
                                                    justifyContent={{ base: "space-around", md: "center" }}
                                                    mb={4}
                                                >
                                                    <Button
                                                        onClick={setMinAmount}
                                                        color="limegreen"
                                                        bg="black"
                                                        fontSize={{ base: "xs", md: "sm" }}
                                                        _hover={{ color: "limegreen", bg: "black" }}
                                                        _active={{ color: "limegreen", bg: "black" }}
                                                        _focus={{ color: "limegreen", bg: "black" }}
                                                        isDisabled={isMinButtonDisabled}
                                                    >
                                                        Mín
                                                    </Button>
                                                    <Button
                                                        onClick={setHalfAmount}
                                                        color="limegreen"
                                                        bg="black"
                                                        fontSize={{ base: "xs", md: "sm" }}
                                                        _hover={{ color: "limegreen", bg: "black" }}
                                                        _active={{ color: "limegreen", bg: "black" }}
                                                        _focus={{ color: "limegreen", bg: "black" }}
                                                        isDisabled={isHalfButtonDisabled}
                                                    >
                                                        Méd
                                                    </Button>
                                                    <Button
                                                        onClick={setMaxAmount}
                                                        color="limegreen"
                                                        bg="black"
                                                        fontSize={{ base: "xs", md: "sm" }}
                                                        _hover={{ color: "limegreen", bg: "black" }}
                                                        _active={{ color: "limegreen", bg: "black" }}
                                                        _focus={{ color: "limegreen", bg: "black" }}
                                                        isDisabled={isMaxButtonDisabled}

                                                    >
                                                        Max
                                                    </Button>

                                                </HStack>
                                            </InputGroup>

                                            <Badge
                                                colorScheme="green"
                                                fontSize={{ base: "xl", md: "2xl" }}
                                                variant="outline"
                                                w="100%"
                                                textAlign="center"
                                                py={2}
                                                mb={4}
                                            >
                                                {pixTotalPayment}
                                            </Badge>

                                            {error && (
                                                <Text color="red.500" mt={2} fontSize={{ base: "sm", md: "md" }}>
                                                    {error}
                                                </Text>
                                            )}

                                            <Button
                                                w="100%"
                                                variant="outline"
                                                color="limegreen"
                                                onClick={handleSubmit}
                                                fontSize={{ base: "sm", md: "md" }}
                                                mt={4}
                                                _hover={{ color: "limegreen", bg: "black" }}
                                                _active={{ color: "limegreen", bg: "black" }}
                                                _focus={{ color: "limegreen", bg: "black" }}
                                                isDisabled={isSendButtonDisabled || userInputHBD === "" || parseFloat(userInputHBD) > userHiveBalance.HBDUsdValue}

                                            >
                                                Enviar Hive Dollars
                                            </Button>
                                        </>
                                    ) :
                                        (
                                            <>
                                                <Box filter={isBlurred ? "blur(5px)" : "none"}>
                                                    {qrCodeValue ? (
                                                        <Image src={qrCodeValue} alt="QR Code" />
                                                    ) : (
                                                        <Text >Loading QR Code...</Text>
                                                    )}
                                                </Box>
                                                {qrCodePayload && (
                                                    <Box mt={4}>
                                                        <Button colorScheme="blue" onClick={handleCopy} filter={isBlurred ? "blur(5px)" : "none"} isDisabled={isBlurred}>
                                                            PIX Copia e Cola
                                                        </Button>
                                                    </Box>
                                                )}
                                                {errorPixDeposit && (
                                                    <Text color="red.500" mt={2}>
                                                        {errorPixDeposit}
                                                    </Text>
                                                )}
                                                <Input
                                                    placeholder="Digite a quantidade de HBD"
                                                    value={userInputHBD}
                                                    onChange={handleAmountChange}
                                                    sx={{
                                                        '::placeholder': {
                                                            color: 'white',
                                                        },
                                                    }}
                                                    color="white"
                                                />
                                            </>
                                        )}
                                </VStack>
                            </CardBody>
                        </Card>
                        {pixbeeData &&
                            <LimitsTable
                                balancePix={pixbeeData.balancePix}
                                balanceHbd={pixbeeData.balanceHbd}
                                depositMinLimit={pixbeeData.depositMinLimit}
                                OurExchangePer={pixbeeData.OurExchangePer}
                                OurExchangeFee={pixbeeData.OurExchangeFee}
                            />}
                        {displayModal && (
                            <SendHBDModal
                                username={user.name}
                                userInputHBD={userInputHBD}
                                memo={userFormatedPixKey || ''}
                                valueTotalPIX={pixTotalPayment.toString()}
                                onClose={() => setDisplayModal(false)}
                                visible={displayModal}
                            />
                        )}
                    </VStack>
                </Container>
            </Center>
        </>
    );
};

export default Pix;