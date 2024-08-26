import { transferWithKeychain } from '@/lib/hive/client-functions';
import {
    Box,
    Button,
    Image,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Spinner,
    Text,
    useToast
} from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';

interface SendHBDModalProps {
    username: string;
    visible: boolean;
    onClose: () => void;
    memo: string;
    userAmountHBD: string;
    pixAmountBRL: number;
    availableBalance: number;
    hbdToBrlRate: number;
}

const SendHBDModal: React.FC<SendHBDModalProps> = ({ username, visible, onClose, memo, userAmountHBD, availableBalance, hbdToBrlRate }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formattedPixKey, setFormattedPixKey] = useState<string>(memo);
    const [transactionStatus, setTransactionStatus] = useState<'success' | 'failure' | null>(null);

    const toast = useToast();

    const calculatePixAmount = (amount: number) => {
        const hbdValue = amount * hbdToBrlRate;
        const fee = hbdValue * 0.01 + 2;
        const totalPayment = hbdValue - fee;
        return totalPayment;
    };

    const pixAmountBRL = calculatePixAmount(parseFloat(userAmountHBD));

    const sendHBD = async () => {
        setLoading(true);
        setError(null);

        try {
            const amount = parseFloat(userAmountHBD);

            if (pixAmountBRL < 19.99) {
                throw new Error("O valor mínimo em reais é R$20.");
            }

            if (amount > availableBalance) {
                throw new Error("Saldo insuficiente.");
            }

            const memoPix = `#${formattedPixKey}`;

            await transferWithKeychain(username, "pixbee", amount.toFixed(3), memoPix, "HBD");

            setTransactionStatus('success');
            onClose();
        } catch (error: any) {
            setError(error.message || "Houve um problema ao realizar a transferência.");
            setTransactionStatus('failure');
            toast({
                title: "Erro na transferência.",
                description: error.message || "Houve um problema ao realizar a transferência. Tente novamente.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!visible && transactionStatus) {
            if (transactionStatus === 'success') {
                toast({
                    title: "Transferência realizada.",
                    description: `${parseFloat(userAmountHBD).toFixed(3)} HBD foram trocados por R$${pixAmountBRL.toFixed(2)}.`,
                    status: "success",
                    duration: 5000,
                    isClosable: true,
                });
            } else if (transactionStatus === 'failure') {
                toast({
                    title: "Transferência mal sucedida.",
                    description: "A transferência foi cancelada ou falhou.",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
            }
        }
    }, [visible, transactionStatus, toast, userAmountHBD, pixAmountBRL]);
    return (
        <Modal
            isOpen={visible}
            onClose={() => {
                if (!loading) {

                    onClose();
                }
            }}
            isCentered
            size="xl"
        >
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>
                    <Text mb={4} fontSize="18px">
                        Chave Pix: <Text as="span" color="blue.500">{formattedPixKey}</Text><br />
                        Confirma trocar {userAmountHBD} HBD por {pixAmountBRL.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}?
                    </Text>
                </ModalHeader>
                <ModalCloseButton />
                <ModalBody
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="center"
                >
                    <Image width="70%" src="/brl.webp" alt="PixBee" />
                    {loading && (
                        <Box mt={4}>
                            <Spinner size="lg" />
                            <Text mt={2}>Realizando a transferência...</Text>
                        </Box>
                    )}
                    {error && (
                        <Text color="red.500" mt={4}>
                            {error}
                        </Text>
                    )}
                </ModalBody>
                <ModalFooter>
                    <Button
                        colorScheme="blue"
                        onClick={sendHBD}
                        isDisabled={loading}
                    >
                        {loading ? "Enviando..." : "Enviar"}
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}

export default SendHBDModal;
