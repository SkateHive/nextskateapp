import React from 'react';
import { transferWithKeychain } from '@/lib/hive/client-functions';
import { Button, Image, Modal, ModalBody, ModalHeader, ModalCloseButton, Text, ModalContent, ModalOverlay, ModalFooter } from '@chakra-ui/react';

interface SendHBDModalProps {
    username: string;
    visible: boolean;
    onClose: () => void;
    memo: string;
    hbdAmount: string;
    pixAmount: number;
}

const SendHBDModal: React.FC<SendHBDModalProps> = ({ username, visible, onClose, memo, hbdAmount, pixAmount }) => {
    const memoPix = "#" + memo;

    const sendHBD = async () => {
        await transferWithKeychain(username, "pixbee", hbdAmount.toString(), memoPix, "HBD");
        onClose();
    };

    return (
        <Modal
            isOpen={visible}
            onClose={onClose}
            isCentered
            size={'xl'}
        >
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>
                    <Text mb={4} fontSize={'22px'}>Confirma trocar {hbdAmount} HBD por R${pixAmount}?</Text>
                </ModalHeader>
                <ModalCloseButton />
                <ModalBody
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="center"
                >
                    <Image width={'70%'} src="/brl.webp" alt="PixBee" />
                </ModalBody>
                <ModalFooter>
                    <Button onClick={sendHBD}>Send</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}

export default SendHBDModal;
