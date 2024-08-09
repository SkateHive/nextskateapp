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
import React, { useState } from 'react';

interface SendHBDModalProps {
    username: string;
    visible: boolean;
    onClose: () => void;
    memo: string;
    hbdAmount: string;
    pixAmount: number;
    availableBalance: number;
}

const SendHBDModal: React.FC<SendHBDModalProps> = ({ username, visible, onClose, memo, hbdAmount, pixAmount, availableBalance }) => {
    const [loading, setLoading] = useState(false);
    const toast = useToast();
    const memoPix = "#" + memo;

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



    return (
        <Modal
            isOpen={visible}
            onClose={onClose}
            isCentered
            size="xl"
        >
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>
                    <Text mb={4} fontSize="22px">
                        Confirma trocar {hbdAmount} HBD por R${pixAmount}?
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
