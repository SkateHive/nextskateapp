import { Button } from '@chakra-ui/react';
import React from 'react';

interface ModalFooterSectionProps {
    handleSave: () => void;
    onClose: () => void;
}

const ModalFooterSection: React.FC<ModalFooterSectionProps> = ({ handleSave, onClose }) => {
    return (
        <>
            <Button onClick={handleSave} loadingText="Saving" colorScheme="green">
                Save
            </Button>
            <Button onClick={onClose} colorScheme="red">
                Cancel
            </Button>
        </>
    );
};

export default ModalFooterSection;
