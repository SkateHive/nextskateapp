import React from 'react';
import { transferWithKeychain } from '@/lib/hive/client-functions';
import { Button, Image, Modal, ModalBody, ModalHeader, Text } from '@chakra-ui/react';

interface SendHBDModalProps {
    username: string;
    visible: boolean;
    onClose: () => void;
    amount: number;
    memo: string;
}

const SendHBDModal: React.FC<SendHBDModalProps> = ({ username, visible, onClose, amount, memo }) => {
    const memoPix = "#" + memo
    const sendHBD = async () => {
        await transferWithKeychain(username, "pixbee", amount.toString(), memoPix, "HBD");
        onClose();
    }

    return (
        <Modal
            isOpen={visible}
            onClose={onClose}
            isCentered
        >
            <ModalHeader>Send HBD</ModalHeader>
            <ModalBody
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
            >
                <Text mb={4}>Are you sure you want to send {amount} HBD to pixbee?</Text>
                <Button onClick={sendHBD}>Send</Button>
                <Image width={'70%'} src="/brl.webp" alt="PixBee" />
            </ModalBody>
        </Modal>
    );

}

export default SendHBDModal;
