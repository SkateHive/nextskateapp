import { useHiveUser } from '@/contexts/UserContext';
import { IconButton } from '@chakra-ui/react';
import React, { useState } from 'react';
import { FaRobot } from 'react-icons/fa';
import { SlLogin } from 'react-icons/sl';
import ImproveWithAiModal from './ImproveWithAiModal';
import improveWithAi from './utils/improveWithAi';
import { CSSProperties } from 'react';

type UploadPageButtonProps = {
    styles: CSSProperties;
    onClick: () => void;
};

const UploadPageButton: React.FC<UploadPageButtonProps> = ({ styles, onClick }) => {
    const { hiveUser } = useHiveUser();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {isOpen && <ImproveWithAiModal isOpen={isOpen} onClose={() => setIsOpen(false)} improveWithAi={improveWithAi} />}
            <IconButton
                onClick={onClick}
                aria-label="camera"
                icon={hiveUser ? <FaRobot color="black" size={35} /> : <SlLogin color="black" size={45} />}
                style={styles}
            />
        </>
    );
};

export default UploadPageButton;
