import { KeychainSDK, Transfer } from "keychain-sdk";
import { Box, Button, Image, Modal, ModalBody,
         ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, 
         Spinner, Text, useToast } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';

interface SendHBDModalProps {
    username: string;
    memo: string;
    keyType: string;
    userInputHBD: string;
    valueTotalPIX: string;
    visible: boolean;
    onClose: () => void;
}

const SendHBDModal: React.FC<SendHBDModalProps> = ({
    username,
    userInputHBD,
    memo,
    keyType,
    valueTotalPIX,
    visible,
    onClose,
}) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formattedPixKey, setFormattedPixKey] = useState<string>(memo);
    const [formattedPixKeyType, setFormattedPixKeyType] = useState<string>(keyType);
    const [transactionStatus, setTransactionStatus] = useState<'success' | 'failure' | null>(null);
    const toast = useToast();

    const sendHBD = async () => {
        setLoading(true);
        var memoPix = "# ";
        if(formattedPixKeyType == "Telefone")
            memoPix += formattedPixKey.replace("(", "").replace(") ", "").replace("-", "");
        else
            memoPix += formattedPixKey;

        const keychain = new KeychainSDK(window);

        const formParamsAsObject = {
            "data": {
                "username": username,
                "to": 'pixbee',
                "amount": userInputHBD,
                "memo": memoPix,
                "enforce": false,
                "currency": "HBD",
            }
        }

        keychain.transfer(formParamsAsObject.data as Transfer).then((resultado) => {
            if (resultado?.success == true) {
                // console.log(resultado); //debug
                setTransactionStatus('success');
                toast({
                    title: "Solicitacao Pix Enviada com Sucesso.",
                    description: resultado?.message + resultado?.request_id,
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
                setLoading(false);
                onClose();
            } else {
                console.error(resultado);
                setLoading(false);
            }
        }).catch((err) => {
            // console.log(err); //debug
            setError("Houve um problema ao realizar a transferência.");
            setTransactionStatus('failure');
            toast({
                title: "Erro na transferência.",
                description: err.message || "Houve um problema ao realizar a transferência. Tente novamente.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
            setLoading(false);
            onClose();
        });
        // console.log("aguardando resposta");
    };

    useEffect(() => {
        if (!visible && transactionStatus) {
            if (transactionStatus === 'success') {
                toast({
                    title: "Transferência realizada.",
                    description: `${userInputHBD} HBD foram trocados por R$${valueTotalPIX}.`,
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
    }, [visible, transactionStatus, toast, userInputHBD, valueTotalPIX]);
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
                        Confirma trocar {userInputHBD} HBD por {valueTotalPIX}?
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
