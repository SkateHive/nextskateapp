import { useHiveUser } from '@/contexts/UserContext';
import { IconButton } from '@chakra-ui/react';
import React, { useState } from 'react';
import { FaRobot } from 'react-icons/fa';
import { SlLogin } from 'react-icons/sl';
import ImproveWithAiModal from './ImproveWithAiModal';
import improveWithAi from './utils/improveWithAi';
const UploadPageButton: React.FC = () => {
    const { hiveUser } = useHiveUser();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {isOpen && <ImproveWithAiModal isOpen={isOpen} onClose={() => setIsOpen(false)} improveWithAi={improveWithAi} />}
            <IconButton
                onClick={() => setIsOpen(true)}
                border="1px solid black"
                p={5}
                aria-label="camera"
                icon={hiveUser ? <FaRobot color="black" size={45} /> : <SlLogin color="black" size={45} />}
                size="lg"
                bg="limegreen"
                _hover={{ bg: 'limegreen', transform: 'scale(1.1)', transition: '0.3s' }}
                color="black"
                isRound
            />
        </>
    );
};

export default UploadPageButton;
