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
    hbdAmount: string;
    pixAmount: number; 
    availableBalance: number;
    hbdToBrlRate: number;
    
}

const SendHBDModal: React.FC<SendHBDModalProps> = ({ username, visible, onClose, memo, hbdAmount, availableBalance, hbdToBrlRate }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [transactionStatus, setTransactionStatus] = useState<'success' | 'failure' | null>(null);

    const toast = useToast();
    const memoPix = "#" + memo;

    const calculatePixAmount = (amount: number) => {
        const hbdValue = amount * hbdToBrlRate;
        const fee = hbdValue * 0.01 + 2;
        const totalPayment = hbdValue - fee;
        return totalPayment;
    };

    const pixAmount = calculatePixAmount(parseFloat(hbdAmount));

    const sendHBD = async () => {
        setLoading(true);
        try {
            const amount = parseFloat(hbdAmount);

            if (pixAmount < 20) {
                throw new Error("O valor mínimo em reais é R$20.");
            }

            if (amount > availableBalance) {
                throw new Error("Saldo insuficiente.");
            }

            await transferWithKeychain(username, "pixbee", amount.toFixed(3), memoPix, "HBD");
            toast({
                title: "Transferência realizada.",
                description: `${amount.toFixed(3)} HBD foram trocados por R$${pixAmount.toFixed(2)}.`,
                status: "success",
                duration: 5000,
                isClosable: true,
            });
            onClose();
        } catch (error: any) {
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
                    description: `${parseFloat(hbdAmount).toFixed(3)} HBD foram trocados por ${pixAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'PIX' })}.`,
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
    }, [visible, transactionStatus, toast, hbdAmount, pixAmount]);

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
                    <Text mb={4} fontSize="22px">
                        Confirma trocar {hbdAmount} HBD por {pixAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'PIX' })}?
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
