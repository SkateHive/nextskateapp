import { HiveAccount } from "@/lib/useHiveAuth";
import { Box, Button, CardBody, Center, Container, Image, Input, InputGroup, InputRightAddon, Text, VStack } from "@chakra-ui/react";
import { QrCodePix } from "qrcode-pix";
import { Dispatch, SetStateAction, useEffect } from "react";
import { fetchPixBeeData } from "../../utils/fetchPixBeeData";


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
const City = process.env.NEXT_PUBLIC_CITY || ""
const Country = process.env.NEXT_PUBLIC_STATE || ""
const Name = process.env.NEXT_PUBLIC_NAME || ""
const CPF = process.env.NEXT_PUBLIC_CPF || ""
interface PixProps {
    user: HiveAccount;
    isBlurred: boolean
    setIsBlurred: Dispatch<SetStateAction<boolean>>;
    qrCodeValue: any
    setQrCodeValue: Dispatch<SetStateAction<any>>;
    qrCodePayload: any
    setQrCodePayload: Dispatch<SetStateAction<any>>;
    userInputPIX: any
    setUserInputPIX: Dispatch<SetStateAction<string>>;
    isInputDisabled: boolean
    setIsInputDisabled: Dispatch<SetStateAction<boolean>>;
    valuePIX2HBD: any
    setValuePIX2HBD: Dispatch<SetStateAction<string>>;
    pixbeeData: SkateBankData | null;
    setPixbeeData: Dispatch<SetStateAction<SkateBankData | null>>;
    isExceeded: boolean
    setIsExceeded: Dispatch<SetStateAction<boolean>>;
    isLessMinimum: boolean
    setIsLessMinimum: Dispatch<SetStateAction<boolean>>;
    isPaymentPending: boolean
    setIsPaymentPending: Dispatch<SetStateAction<boolean>>;
    isPaymentReceived: boolean
    setIsPaymentReceived: Dispatch<SetStateAction<boolean>>;
    errorPixDeposit: any
    setErrorPixDeposit: Dispatch<SetStateAction<any>>;
    isSell: boolean
    setIsSell: Dispatch<SetStateAction<boolean>>;
}
const PixHbd = ({ user, isBlurred, setIsBlurred, errorPixDeposit, isExceeded, isInputDisabled, isLessMinimum, isPaymentPending, isPaymentReceived, isSell, pixbeeData, qrCodePayload, qrCodeValue, setErrorPixDeposit, setIsExceeded, setIsInputDisabled, setIsLessMinimum, setIsPaymentPending, setIsPaymentReceived, setIsSell, setPixbeeData, setQrCodePayload, setQrCodeValue, setUserInputPIX, setValuePIX2HBD, userInputPIX, valuePIX2HBD }: PixProps) => {

    const generateTransactionId = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let transactionId = 'E';

        for (let i = 1; i < 25; i++) {
            transactionId += chars.charAt(Math.floor(Math.random() * chars.length));
        }

        return transactionId;
    };




    useEffect(() => {
        if (pixbeeData) {
            const userPIXValue = parseFloat(userInputPIX.replace(',', '.'));
            const balanceHBD = parseFloat(pixbeeData.balanceHbd);
            const minLimit = pixbeeData.depositMinLimit;


            const isExceeded = userPIXValue / pixbeeData.BRLPriceHBD > balanceHBD; // Comparação direta com o saldo
            const isLowerMinimum = userPIXValue < minLimit; // Verificação do limite mínimo

            setIsExceeded(isExceeded);
            setIsLessMinimum(isLowerMinimum);
            setValuePIX2HBD("0"); // Zera o valor inicialmente
            setIsBlurred(true);

            if (isExceeded) {
                setErrorPixDeposit("O valor em reais ultrapassa o saldo de HBD disponível.");
            } else if (isLowerMinimum) {
                setErrorPixDeposit(`Depósito mínimo é de R$ ${minLimit.toFixed(2)}.`);
            } else {
                setErrorPixDeposit(null);

                try {
                    const pix2hbd = (userPIXValue / pixbeeData.BRLPriceHBD).toFixed(3); // Conversão correta

                    if (pix2hbd === "NaN" || parseFloat(pix2hbd) <= 0) {
                        setValuePIX2HBD("0");
                    } else {
                        setIsBlurred(false);
                        setValuePIX2HBD(pix2hbd);

                        const generateQrCode = async () => {
                            try {

                                if (!pixbeeData?.pixbeePixKey) {
                                    setErrorPixDeposit('Chave PIX não definida.');
                                    setQrCodeValue(null);
                                    setQrCodePayload(null);
                                    return;
                                }

                                if (!userInputPIX || isNaN(userPIXValue)) {
                                    setErrorPixDeposit('Digite um valor.');
                                    setQrCodeValue(null);
                                    setQrCodePayload(null);
                                    return;
                                }

                                if (parseFloat(pix2hbd) > balanceHBD) {
                                    setErrorPixDeposit('Valor maior que disponível na Skatebank.');
                                    setQrCodeValue(null);
                                    setQrCodePayload(null);
                                    return;
                                }
                                const transactionId = generateTransactionId();

                                const qrCodePix = QrCodePix({
                                    version: '01',
                                    key: pixbeeData?.pixbeePixKey,
                                    name: Name,
                                    city: City,
                                    transactionId: transactionId,
                                    message: `${user.name}`,

                                    value: userPIXValue,
                                });
                                const payload = qrCodePix.payload?.();
                                if (payload) {
                                    setQrCodePayload(payload);
                                }

                                const qrCodeBase64 = await qrCodePix.base64();
                                if (qrCodeBase64 && qrCodeBase64.startsWith('data:image/png;base64,')) {
                                    setQrCodeValue(qrCodeBase64);
                                    setErrorPixDeposit(null);

                                    setIsPaymentPending(true);
                                    setIsPaymentReceived(false);
                                } else {
                                    setErrorPixDeposit('QR code Base64 string inválido.');
                                    setQrCodeValue(null);
                                    setQrCodePayload(null);
                                }
                            } catch (error: any) {
                                setErrorPixDeposit(error.message);
                                setQrCodeValue(null);
                                setQrCodePayload(null);
                            }
                        };

                        if (!isSell) {
                            generateQrCode();
                        }
                    }
                } catch (err) {
                    setValuePIX2HBD("0");
                }
            }
        }
    }, [userInputPIX, pixbeeData]);



    const handlePIXAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = event.target.value;
        const newRawValue = [];

        for (let i = 0; i < rawValue.length; i++) {
            const char = rawValue[i];
            if (char === 'Backspace') {
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
        setUserInputPIX(formattedValue);
    };

    function toFixedTrunc(x: any, n: number) {
        const v = (typeof x === 'string' ? x : x.toString()).split('.');
        if (n <= 0) return v[0];
        let f = v[1] || '';
        if (f.length > n) return `${v[0]}.${f.substr(0, n)}`;
        while (f.length < n) f += '0';
        return `${v[0]}.${f}`
    }

    const handlePIXOnBlur = (event: React.ChangeEvent<HTMLInputElement>) => {
        var currentValue = event.target.value;
        if (currentValue == "") currentValue = "0";
        event.target.value = toFixedTrunc(currentValue, 2);
        setUserInputPIX(event.target.value);
    }


    const handleCopy = () => {
        if (qrCodePayload) {
            navigator.clipboard.writeText(qrCodePayload).then(() => {
                alert('PIX Copia e Cola copiado!');
            }).catch(err => {
                console.error('Erro ao copiar o PIX:', err);
            });
        }
    };

    useEffect(() => {
        fetchPixBeeData().then((data) => {
            setPixbeeData(data);
        }).catch(error => {
            console.error("Failed to fetch PixBee data:", error);
        });
        //     }
    }, ["SkateBankData"]);

    return (
        <Center mt="20px"  >
            <Container maxW="container.lg">
                <CardBody>
                    <VStack spacing={4}>
                        <Box minHeight={'212px'} filter={isBlurred ? "blur(5px)" : "none"}>
                            {qrCodeValue ? (
                                <Image src={qrCodeValue} alt="QR Code" />
                            ) : (
                                <Image src={"data:image/png;base64,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"} alt="QR Code" />
                            )}
                        </Box>
                        {qrCodePayload && (
                            <Box mt={4}>
                                <Button colorScheme="blue" onClick={handleCopy} filter={isBlurred ? "blur(5px)" : "none"} isDisabled={isBlurred}>
                                    PIX Copia e Cola
                                </Button>
                            </Box>
                        )}
                        {!qrCodePayload && (
                            <Box mt={4}>
                                <Button colorScheme="blue" filter={isBlurred ? "blur(5px)" : "none"} isDisabled={1 == 1}>
                                    PIX Copia e Cola
                                </Button>
                            </Box>
                        )}

                        {errorPixDeposit && (
                            <Text color="red.500" mt={2}>
                                {errorPixDeposit}
                            </Text>
                        )}
                        {!errorPixDeposit && (
                            <Text mt={2}>
                                &nbsp;
                            </Text>
                        )}

                        <InputGroup
                            display="flex"
                            alignItems="center"
                            justifyContent="space-between"
                            w="100%"

                        >
                            <Input
                                placeholder="0.00"
                                value={userInputPIX}
                                onChange={handlePIXAmountChange}
                                onBlur={handlePIXOnBlur}
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
                                PIX
                            </InputRightAddon>
                        </InputGroup>

                        <Text mt={0} color={'silver'}>
                            {valuePIX2HBD} HBD
                        </Text>
                        {isPaymentPending && <Text>Pagamento em andamento...</Text>}
                        {isPaymentReceived && <Text>Pagamento recebido com sucesso!</Text>}
                    </VStack>
                </CardBody>
            </Container>
        </Center>
    )
}

export default PixHbd