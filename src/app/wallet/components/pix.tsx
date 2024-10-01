import useHiveBalance from "@/hooks/useHiveBalance";
import { HiveAccount } from "@/lib/useHiveAuth";
import { Badge, Box, Button, Card, CardBody, CardHeader, Center, Container, HStack,
         Image, Input, InputGroup, InputRightAddon, Switch, Text, VStack,
        //  useToast 
       } from "@chakra-ui/react";
import { QrCodePix } from 'qrcode-pix';
import React, { useEffect, useState } from "react";
import { fetchPixBeeData, formatCNPJ, formatCPF, formatRandomKey, formatTelephone } from "../utils/fetchPixBeeData";
import { LimitsTable } from "./LimitesTable";
import SendHBDModal from "./sendHBDModal";

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
    // const [isInBrazil, setIsInBrazil] = useState(false);
    const [isSell, setIsSell] = useState(true);

    const [error, setError] = useState<string | null>("Formulario em branco");
    const [isExceeded, setIsExceeded] = useState(false);    // is greater than available pix balance
    const [isLessMinimum, setIsLessMinimum] = useState(true);// is less then minimum
    // const [userHasBalance, setUserHasBalance] = useState(false);// is less then minimum

    const [displayModal, setDisplayModal] = useState(false);
    const [userInputHBD, setUserInputHBD] = useState("");   // user input hbd value to pix
    
    const [userInputPIX, setUserInputPIX] = useState("");   // user input pix value to hbd
    const [isBlurred, setIsBlurred] = useState(true);   // qrcode blur
    
    const [valuePIX2HBD, setValuePIX2HBD] = useState("0");   // user input pix value to hbd
    
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
        if (pixbeeData) {
            const isExceeded = parseFloat(userInputPIX) > parseFloat(pixbeeData.balanceHbd);
            const isLowerMinimum = parseFloat(userInputPIX) < pixbeeData.depositMinLimit;
            
            setIsExceeded(isExceeded);
            setIsLessMinimum(isLowerMinimum);

            // console.log("setUserHasBalance "+setUserHasBalance)
            setValuePIX2HBD( "0" );
            setIsBlurred(true);
            

            if (isExceeded) {
                setErrorPixDeposit("O valor é maior que HBD Disponível.");
            } else if (isLowerMinimum) {
                setErrorPixDeposit("Deposito mínimo é de R$ 20.");
            } else {
                setErrorPixDeposit(null);
                try {
                    if(pixbeeData) {
                        const pix2hbd = (calculateLiquidDeposit(parseFloat(userInputPIX.replace(',','.')))/ pixbeeData.BRLPriceHBD).toFixed(3);
                        if (pix2hbd === "NaN" ) {
                            setValuePIX2HBD( "0" ); 
                        } else {
                            setIsBlurred(false);
                            setValuePIX2HBD( pix2hbd );

                            const generateQrCode = async () => {
                                try {
                                    if (!pixbeeData?.pixbeePixKey) {
                                        setErrorPixDeposit('Chave PIX não definida.');
                                        setQrCodeValue(null);
                                        setQrCodePayload(null);
                                        return;
                                    }
                    
                                    if (!userInputPIX || isNaN(parseFloat(userInputPIX))) {
                                        setErrorPixDeposit('Digite um valor.');
                                        setQrCodeValue(null);
                                        setQrCodePayload(null);
                                        return;
                                    }
                    
                                    const valueHBD = parseFloat(pix2hbd);
                                    const balance = parseFloat(pixbeeData.balanceHbd);
                    
                                    if (valueHBD <= 0) {
                                        setErrorPixDeposit('Valor de HBD deve ser maior que zero.');
                                        setQrCodeValue(null);
                                        setQrCodePayload(null);
                                        return;
                                    }
                    
                                    if (valueHBD > balance) {
                                        setErrorPixDeposit('Valor maior que disponível na Skatebank.');
                                        setQrCodeValue(null);
                                        setQrCodePayload(null);
                                        return;
                                    }
                    
                                    // const valueBRL = parseFloat((valueHBD * parseFloat(pixbeeData.HBDPriceBRL)).toFixed(2));
                    
                                    // console.log('Chave PIX:', pixbeeData?.pixbeePixKey);
                                    // console.log('Quantidade HBD:', userInputHBD);
                                    // console.log('Valor em BRL:', valueBRL);
                    
                                    const qrCodePix = QrCodePix({
                                        version: '01',
                                        key: pixbeeData?.pixbeePixKey,
                                        name: '',
                                        city: '',
                                        message: `${user.name}`,
                                        value: parseFloat(userInputPIX),
                                    });
                    
                                    if (typeof qrCodePix.payload === 'function') {
                                        const payload = qrCodePix.payload();
                                        setQrCodePayload(payload);
                                    } else {
                                        // console.warn('Método payload não encontrado em QrCodePix.');
                                    }
                    
                                    const qrCodeBase64 = await qrCodePix.base64();
                    
                                    // console.log('QR Code Base64:', qrCodeBase64);
                    
                                    if (qrCodeBase64 && qrCodeBase64.startsWith('data:image/png;base64,')) {
                                        setQrCodeValue(qrCodeBase64);
                                        setErrorPixDeposit(null);
                                    } else {
                                        setErrorPixDeposit('QR code Base64 string inválido.');
                                        setQrCodeValue(null);
                                        setQrCodePayload(null);
                                    }
                                } catch (error: any) {
                                    // console.error('Erro ao gerar QR code PIX:', error);
                                    setErrorPixDeposit(error.message);
                                    setQrCodeValue(null);
                                    setQrCodePayload(null);
                                }
                            };
                    
                            if (!isSell) {
                                generateQrCode();
                            }

                        }
                    }
                } catch (err){
                    setValuePIX2HBD( "0" );
                }
            }
        }
    }, [userInputPIX, pixbeeData]);

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

    // useEffect(() => {
    //     const checkLocation = async () => {
    //         try {
    //             const response = await axios.get('https://ipapi.co/json/');
    //             const countryCode = response.data.country_code;
    //             setIsInBrazil(countryCode === 'BR');
    //         } catch (error) {
    //             console.error("Failed to fetch location data:", error);
    //         }
    //     };

    //     checkLocation();
    // }, []);

    useEffect(() => {
    //     if (isInBrazil) {
            fetchPixBeeData().then((data) => {
                setPixbeeData(data);
            }).catch(error => {
                console.error("Failed to fetch PixBee data:", error);
            });
    //     }
    }, ["SkateBankData"]);
    // }, [isInBrazil]);

    /*
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
                    setErrorPixDeposit('Digite um valor.');
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
                    setErrorPixDeposit('Valor maior que disponível na Skatebank.');
                    setQrCodeValue(null);
                    setQrCodePayload(null);
                    return;
                }

                const valueBRL = parseFloat((valueHBD * parseFloat(pixbeeData.HBDPriceBRL)).toFixed(2));

                // console.log('Chave PIX:', pixbeeData?.pixbeePixKey);
                // console.log('Quantidade HBD:', userInputHBD);
                // console.log('Valor em BRL:', valueBRL);

                const qrCodePix = QrCodePix({
                    version: '01',
                    key: pixbeeData?.pixbeePixKey,
                    name: '',
                    city: '',
                    message: `${user.name}`,
                    value: valueBRL,
                });

                if (typeof qrCodePix.payload === 'function') {
                    const payload = qrCodePix.payload();
                    setQrCodePayload(payload);
                } else {
                    // console.warn('Método payload não encontrado em QrCodePix.');
                }

                const qrCodeBase64 = await qrCodePix.base64();

                // console.log('QR Code Base64:', qrCodeBase64);

                if (qrCodeBase64 && qrCodeBase64.startsWith('data:image/png;base64,')) {
                    setQrCodeValue(qrCodeBase64);
                    setErrorPixDeposit(null);
                } else {
                    setErrorPixDeposit('QR code Base64 string inválido.');
                    setQrCodeValue(null);
                    setQrCodePayload(null);
                }
            } catch (error: any) {
                // console.error('Erro ao gerar QR code PIX:', error);
                setErrorPixDeposit(error.message);
                setQrCodeValue(null);
                setQrCodePayload(null);
            }
        };

        if (!isSell) {
            generateQrCode();
        }
    }, [userInputHBD, pixbeeData?.pixbeePixKey, user.name, isSell, pixbeeData?.HBDPriceBRL, userHiveBalance.HBDUsdValue]);
    */

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


    const handlePIXAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
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
        setUserInputPIX(formattedValue);
    };

    const handleBlur = (event: React.ChangeEvent<HTMLInputElement>) => {
        var currentValue = event.target.value;
        if (currentValue=="") currentValue="0";
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
        // setUserInputPIX(formattedValue);
        // const rawValue = event.target.value;
        // const formattedValue = formatValue(rawValue);

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

        const liquid = (realValue * (1 - exchangePer) - exchangeFee);    //fixed from 2 to 3, 19.99 bug vaipraonde?

        return liquid;
    }

    //return HBD brute deposit value
    function findBruteValue(liquidPlusTax: number, valorPix: number, token: string): number {
        if (!pixbeeData) {
            throw new Error('SkateBankData não está definido');
        }

        const epsilon = 0.001;
        let hbdDeposit = 0;
        let countWhile = 0;

        if (token === "HBD") {
            const hbdPriceBRL = pixbeeData.HBDPriceBRL;
            hbdDeposit = parseFloat((liquidPlusTax / hbdPriceBRL).toFixed(3));

            while (calculateLiquidDeposit(liquidPlusTax) < valorPix) { //19.99
                hbdDeposit += epsilon;
                liquidPlusTax = parseFloat((hbdDeposit * hbdPriceBRL).toFixed(2));
                // countWhile++;
                // const diferenca = calculateLiquidDeposit(liquidPlusTax) - valorPix;
                // if (diferenca < -0.01) {
                    // hbdDeposit = parseFloat((hbdDeposit - diferenca).toFixed(3));
                // }
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
        // console.log("Valor mínimo HBD: setMinAmount");
        if (minHBD !== undefined) {
            setUserInputHBD(minHBD.toFixed(3));
            setIsExceeded(parseFloat(minHBD.toFixed(3)) > userHiveBalance.HBDUsdValue);
        }
    };

    const setMaxAmount = () => {
        // console.log("Valor máximo HBD: setMaxAmount");
        setUserInputHBD(userHiveBalance.HBDUsdValue.toFixed(3));
        setIsExceeded(false);
    }

    const setHalfAmount = () => {
        // console.log("Valor médio HBD: setHalfAmount");
        const halfAmount = userHiveBalance.HBDUsdValue / 2;
        setUserInputHBD(halfAmount.toFixed(3));
        setIsExceeded(false);
    };

    const handleSubmit = () => {
        // console.log("verificacoes");
        // console.log("pixKeyType!=Inválida " + pixKeyType);
        // console.log("userHasBalance "           + userHasBalance);
        // console.log("isLessMinimum " + isLessMinimum);
        // console.log("error === null " + error);
        
        if ((!isExceeded)
            && (pixKeyType != "Inválida")
            && (!isLessMinimum)
            && ((error === null))
        ) setDisplayModal(true);
        else {
            throw new Error("Confira os valores inseridos.");
        }
    };

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
            return parseFloat(totalPayment.toFixed(2));
        } catch {
            // console.log("amount HBD nao eh numero valido");
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
                alert('PIX Copia e Cola copiado!');
            }).catch(err => {
                console.error('Erro ao copiar o PIX:', err);
            });
        }
    };

    // if (!isInBrazil) {
    //     return (
    //         <Center>
    //             <Alert
    //                 status="info"><AlertIcon /><AlertTitle>Localização não permitida</AlertTitle><AlertDescription>
    //                     O serviço está disponível apenas para usuários no Brasil.
    //                 </AlertDescription></Alert>
    //         </Center>
    //     );
    // }

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
                                            <>
                                                <Box minHeight={'212px'}filter={isBlurred ? "blur(5px)" : "none"}>
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
                                                        <Button colorScheme="blue" filter={isBlurred ? "blur(5px)" : "none"} isDisabled={1==1}>
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

                                                {/* <Input
                                                    placeholder="Digite a quantidade de HBD"
                                                    value={userInputHBD}
                                                    onChange={handleAmountChange}
                                                    sx={{
                                                        '::placeholder': {
                                                            color: 'white',
                                                        },
                                                    }}
                                                    color="white"
                                                /> */}

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