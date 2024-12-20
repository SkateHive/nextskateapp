import useHiveBalance from "@/hooks/useHiveBalance";
import { HiveAccount } from "@/lib/useHiveAuth";
import {
    Badge, Box, Button, Card, CardBody, CardHeader, Center, Container, HStack,
    Input, InputGroup, InputRightAddon, Switch, Text, VStack
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { fetchPixBeeData, formatCNPJ, formatCPF, formatRandomKey, formatTelephone } from "../../utils/fetchPixBeeData";
import { LimitsTable } from "./LimitesTable";
import PixHbd from "./Pix_Hbd";
import SendHBDModal from "./sendHBDModal";
import TransactionHistory from "./transationHistory";

interface SkateBankData {
    pixbeePixKey: string;
    HivePriceBRL: number;
    BRLPriceHive: number;
    HivePriceUSD: number;
    HBDPriceBRL: number;
    BRLPriceHBD: number;
    minRefundHive: number;
    minRefundHbd: number;
    minRefundPix: number;
    depositMinLimit: number;
    balancePix: number;
    balanceHbd: string;
    balanceHive: string;
    balanceTotal: string;
    OurExchangePer: number;
    OurExchangeFee: number;
    OurRefundPer: number;
}

interface PixProps {
    user: HiveAccount;
}

const Pix = ({ user }: PixProps) => {
    const [isSell, setIsSell] = useState(true);

    const [error, setError] = useState<string | null>("Formulario em branco");
    const [isExceeded, setIsExceeded] = useState(false);
    const [isLessMinimum, setIsLessMinimum] = useState(true);

    const [displayModal, setDisplayModal] = useState(false);
    const [userInputHBD, setUserInputHBD] = useState("");
    const userHiveBalance = useHiveBalance(user);
    const [errorPixDeposit, setErrorPixDeposit] = useState<string | null>("");
    const [qrCodeValue, setQrCodeValue] = useState<string | null>(null);
    const [isInputDisabled, setIsInputDisabled] = useState(false);
    const [isMinButtonDisabled, setIsMinButtonDisabled] = useState(false);
    const [isHalfButtonDisabled, setIsHalfButtonDisabled] = useState(false);
    const [isMaxButtonDisabled, setIsMaxButtonDisabled] = useState(false);
    const [isSendButtonDisabled, setIsSendButtonDisabled] = useState(false);
    const [pixbeeData, setPixbeeData] = useState<SkateBankData | null>(null);
    const [pixTotalPayment, setPixTotalPayment] = useState("0.000");
    const [pixKey, setPixKey] = useState("");
    const [userFormatedPixKey, setUserFormatedPixKey] = useState("");
    const [pixKeyType, setPixKeyType] = useState("Inválida");
    const [qrCodePayload, setQrCodePayload] = useState<string | null>(null);
    const [isBlurred, setIsBlurred] = useState(true);
    const [userInputPIX, setUserInputPIX] = useState("");
    const [valuePIX2HBD, setValuePIX2HBD] = useState("0");
    const [isPaymentPending, setIsPaymentPending] = useState(false);
    const [isPaymentReceived, setIsPaymentReceived] = useState(false);
    // const toast = useToast();

    useEffect(() => {
        if (pixbeeData && userHiveBalance) {
            const isExceeded = parseFloat(userInputHBD) > userHiveBalance.HBDUsdValue;
            const pixValue = calculateTotalPixPayment(userInputHBD);
            const isLowerMinimum = pixValue < pixbeeData.depositMinLimit;
            // const isLowerMinimum = calculateTotalPixPayment(userInputHBD) < pixbeeData.depositMinLimit;

            setIsExceeded(isExceeded);
            setIsLessMinimum(isLowerMinimum);
            // console.log("setUserHasBalance "+setUserHasBalance)

            if (isExceeded) {
                setError("O valor é maior que seu saldo.");
            } else if (isLowerMinimum) {
                setError("Deposito mínimo é de R$ 20.");
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
                setError(`Depósito mínimo é de R$ ${pixbeeData.depositMinLimit}`);
                setIsSendButtonDisabled(true);
                setIsInputDisabled(false);
                setIsMinButtonDisabled(false);
                setIsHalfButtonDisabled(false);
                setIsMaxButtonDisabled(false);
            } else if (exceedsBalance) {
                setError("O valor é maior que seu saldo.");
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
        fetchPixBeeData().then((data) => {
            setPixbeeData(data);
        }).catch(error => {
            console.error("Failed to fetch PixBee data:", error);
        });
        //     }
    }, ["SkateBankData"]);

    const handleBlur = (event: React.ChangeEvent<HTMLInputElement>) => {
        var currentValue = event.target.value;
        if (currentValue == "") currentValue = "0";
        event.target.value = parseFloat(currentValue).toFixed(3);
        setUserInputHBD(event.target.value);
    }

    const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = event.target.value;
        const newRawValue = [];

        for (let i = 0; i < rawValue.length; i++) {
            const char = rawValue[i];
            if (char === 'Backspace') {
                // ignore backspace key press
                if (newRawValue.length > 0) {
                    newRawValue.pop();
                }
            } else if (/\d/.test(char) || char === '.') {
                newRawValue.push(char);
            } else if (char === ',') {
                newRawValue.push('.');
            }
        }
        const formattedValue = newRawValue.join('');

        setUserInputHBD(formattedValue);
        const parsedValue = parseFloat(formattedValue);
        setIsExceeded(parsedValue > parseFloat(pixbeeData ? pixbeeData.balanceHbd : "0"));
    };

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
                pixKeyType = "Aleatória";
                sanitizedPixKey = formatRandomKey(value);
            } else {
                setError("Inválida");
                throw new Error("Chave Pix inválida");
            }
        } catch (error) {
            // console.error('Erro ao sanitizar chave Pix:', error);
            pixKeyType = "Inválida";
            sanitizedPixKey = value;
        }

        setPixKey(value);
        setPixKeyType(pixKeyType);
        setUserFormatedPixKey(sanitizedPixKey);
        setError(null);
    };

    function calculateLiquidDeposit(realValue: number): number {
        if (!pixbeeData) {
            throw new Error('SkateBankData não está definido');
        }
        const exchangePer = pixbeeData.OurExchangePer;
        const exchangeFee = pixbeeData.OurExchangeFee;

        const liquid = (realValue * (1 - exchangePer) - exchangeFee).toFixed(3);

        return parseFloat(liquid);
    }

    function findBruteValue(liquidPlusTax: number, valorPix: number, token: string): number {
        if (!pixbeeData) {
            throw new Error('SkateBankData não está definido');
        }

        const epsilon = 0.001;
        let hbdDeposit = 0;
        // let countWhile = 0;

        if (token === "HBD") {
            const hbdPriceBRL = pixbeeData.HBDPriceBRL;
            hbdDeposit = parseFloat((liquidPlusTax / hbdPriceBRL).toFixed(3)); //#vaipraonde 3 decimals important

            while (calculateLiquidDeposit(liquidPlusTax) < valorPix) {
                hbdDeposit += epsilon;
                liquidPlusTax = parseFloat((hbdDeposit * hbdPriceBRL).toFixed(3));//#vaipraonde 3 decimals important

            }
            return hbdDeposit;
        }

        throw new Error('Token não suportado');
    }

    const calculateBruteValue = (valorPix: number, token: string): number => {
        if (!pixbeeData) {
            throw new Error('SkateBankData não está definido');
        }
        const exchangeFee = pixbeeData.OurExchangeFee || 0;
        const exchangePer = parseFloat(pixbeeData.OurExchangePer.toString());
        let liquidplustax = valorPix + exchangeFee;
        liquidplustax = liquidplustax * (1 + exchangePer);
        let bruteValue = findBruteValue(liquidplustax, valorPix, token);
        return parseFloat((bruteValue).toFixed(3));             //fix 19.99
    };

    const calculateMinimumHBDAmount = (): number | undefined => {
        if (pixbeeData) {
            return calculateBruteValue(pixbeeData.depositMinLimit, "HBD");
        }
        return undefined;
    };

    const setMinAmount = () => {
        const minHBD = calculateMinimumHBDAmount();
        if (minHBD !== undefined) {
            setUserInputHBD(minHBD.toFixed(3));
            setIsExceeded(parseFloat(minHBD.toFixed(3)) > userHiveBalance.HBDUsdValue);
        }
    };

    const setMaxAmount = () => {
        setUserInputHBD(userHiveBalance.HBDUsdValue.toFixed(3));
        setIsExceeded(false);
    }

    const setHalfAmount = () => {
        const halfAmount = userHiveBalance.HBDUsdValue / 2;
        setUserInputHBD(halfAmount.toFixed(3));
        setIsExceeded(false);
    };

    const handleSubmit = () => {
        if ((!isExceeded)
            && (pixKeyType != "Inválida")
            && (!isLessMinimum)
            && ((error === null))
        ) setDisplayModal(true);
        else {
            throw new Error("Confira os valores inseridos.");
        }
    };

    function toFixedTrunc(x: any, n: number) {
        const v = (typeof x === 'string' ? x : x.toString()).split('.');
        if (n <= 0) return v[0];
        let f = v[1] || '';
        if (f.length > n) return `${v[0]}.${f.substr(0, n)}`;
        while (f.length < n) f += '0';
        return `${v[0]}.${f}`
    }

    function calculateTotalPixPayment(amountHBD: any): number {
        if (!pixbeeData) {
            throw new Error('SkateBankData não está definido');
        }

        try {
            amountHBD = parseFloat(amountHBD);
            const hbdtoBrl = pixbeeData.HBDPriceBRL;
            const fee = (hbdtoBrl * amountHBD) * 0.01 + 2;
            var totalPayment = hbdtoBrl * amountHBD - fee;
            if (totalPayment < 0) totalPayment = 0;
            return toFixedTrunc(totalPayment, 2);
        } catch {
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



    if (!pixbeeData) {
        return (
            <Center>
                <Text color={'limegreen'}>Wait, connecting to Skate Bank in Bahamas...</Text>
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
                                                placeholder="Digite sua chave PIX"
                                                value={userFormatedPixKey}
                                                onChange={handlePixKeyChange}
                                                sx={{
                                                    '::placeholder': { color: 'white' },
                                                }}
                                                color="white"
                                                fontSize={{ base: "sm", md: "md" }}
                                                mb={0}
                                                w="100%"
                                                borderColor="limegreen"
                                                _hover={{ borderColor: "white" }}
                                                _focus={{ borderColor: "limegreen", boxShadow: "0 0 0 1px limegreen" }}
                                            />

                                            {pixKeyType && (
                                                <Badge colorScheme="blue" mt={0} fontSize={{ base: "xs", md: "sm" }}>
                                                    Chave Pix {pixKeyType}
                                                </Badge>
                                            )}

                                            <InputGroup
                                                display="flex"
                                                alignItems="center"
                                                justifyContent="space-between"
                                                w="100%"

                                            >
                                                <Input
                                                    placeholder="0.000"
                                                    value={userInputHBD}
                                                    onChange={handleAmountChange}
                                                    onBlur={handleBlur}
                                                    type="text"
                                                    sx={{
                                                        '::placeholder': { color: 'white' },
                                                    }}
                                                    color="white"
                                                    borderColor="limegreen"
                                                    _hover={{ borderColor: "white" }}
                                                    _focus={{ borderColor: "limegreen", boxShadow: "0 0 0 1px limegreen" }}
                                                    flex="1"

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
                                            </InputGroup>

                                            <HStack
                                                justifyContent="space-between"
                                                flexDirection="row"
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
                                                    w={{ base: "32%", md: "auto" }}
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
                                                    w={{ base: "32%", md: "auto" }}
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
                                                    w={{ base: "32%", md: "auto" }}
                                                >
                                                    Max
                                                </Button>
                                            </HStack>

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
                                            {!error && (
                                                <Text color="red.500" mt={2} fontSize={{ base: "sm", md: "md" }}>
                                                    &nbsp;
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

                                            <Box>
                                                <PixHbd
                                                    user={user}
                                                    isBlurred={isBlurred}
                                                    setIsBlurred={setIsBlurred}
                                                    qrCodeValue={qrCodeValue}
                                                    setQrCodeValue={setQrCodeValue}
                                                    qrCodePayload={qrCodePayload}
                                                    setQrCodePayload={setQrCodePayload}
                                                    userInputPIX={userInputPIX}
                                                    setUserInputPIX={setUserInputPIX}
                                                    isInputDisabled={isInputDisabled}
                                                    setIsInputDisabled={setIsInputDisabled}
                                                    valuePIX2HBD={valuePIX2HBD}
                                                    setValuePIX2HBD={setValuePIX2HBD}
                                                    pixbeeData={pixbeeData}
                                                    setPixbeeData={setPixbeeData}
                                                    isExceeded={isExceeded}
                                                    setIsExceeded={setIsExceeded}
                                                    isLessMinimum={isLessMinimum}
                                                    setIsLessMinimum={setIsLessMinimum}
                                                    isPaymentPending={isPaymentPending}
                                                    setIsPaymentPending={setIsPaymentPending}
                                                    isPaymentReceived={isPaymentReceived}
                                                    setIsPaymentReceived={setIsPaymentReceived}
                                                    errorPixDeposit={errorPixDeposit}
                                                    setErrorPixDeposit={setErrorPixDeposit}
                                                    isSell={isSell}
                                                    setIsSell={setIsSell} />
                                            </Box>

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
                                keyType={pixKeyType}
                                valueTotalPIX={pixTotalPayment.toString()}
                                onClose={() => setDisplayModal(false)}
                                visible={displayModal}
                            />
                        )}
                    </VStack>
                </Container>
            </Center>
            <TransactionHistory searchAccount={"pixbee"} />
        </>
    );
};

export default Pix;
