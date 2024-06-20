import { HStack, Input } from '@chakra-ui/react';
import React from 'react';
import { FaEye } from 'react-icons/fa';

interface ModalHeaderSectionProps {
    editedTitle: string;
    setEditedTitle: (value: string) => void;
    handlePreview: () => void;
}

const ModalHeaderSection: React.FC<ModalHeaderSectionProps> = ({ editedTitle, setEditedTitle, handlePreview }) => {
    return (
        <HStack>
            <Input
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                placeholder=" Title"
                fontSize="18px"
                 color="white"
                bg="gray.900"
                variant="unstyled"
                _placeholder={{ color: 'gray.100' }}
                border="2px solid"
                paddingLeft="10px" 
            />
            <FaEye onClick={handlePreview} size={'28px'} />
        </HStack>
    );
};

export default ModalHeaderSection;
