import { Button, VStack } from '@chakra-ui/react';
import React from 'react';

interface ModalFooterButtonsProps {
    onClose: () => void;
    handlePost: () => void;
}

const ModalFooterButtons: React.FC<ModalFooterButtonsProps> = ({ onClose, handlePost }) => {
    return (
        <VStack width={'100%'}>
            <Button width={'100%'} colorScheme='red' onClick={onClose}>Let me try again, I am high</Button>
            <Button width={'100%'} colorScheme='green' onClick={handlePost}>Looks dope, confirm!</Button>
        </VStack>
    );
};

export default ModalFooterButtons;
