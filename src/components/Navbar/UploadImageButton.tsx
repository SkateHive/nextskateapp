'use client';

import { useHiveUser } from "@/contexts/UserContext";
import { IconButton, Input } from "@chakra-ui/react";
import { useCallback, useRef, useState } from "react";
import { GiVideoCamera } from "react-icons/gi";
import { SlLogin } from "react-icons/sl";
import LoginModal from "../Hive/Login/LoginModal";
import MobileUploadModal from "./MobileUploadModal";


const useFileUpload = () => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isMobileUploadModalOpen, setIsMobileUploadModalOpen] = useState<boolean>(false);

    const handleCameraClick = useCallback(() => {
        fileInputRef.current?.click();
    }, []);

    const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setIsMobileUploadModalOpen(true);
        }

    }, []);

    const closeModal = useCallback(() => {
        setIsMobileUploadModalOpen(false);
        setSelectedFile(null);
    }, []);

    return {
        fileInputRef,
        selectedFile,
        isMobileUploadModalOpen,
        handleCameraClick,
        handleFileChange,
        closeModal
    };
};

const UploadImageButton: React.FC = () => {
    const { hiveUser } = useHiveUser();
    const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
    const {
        fileInputRef,
        selectedFile,
        isMobileUploadModalOpen,
        handleCameraClick,
        handleFileChange,
        closeModal
    } = useFileUpload();

    return (
        <>
            <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
            <MobileUploadModal file={selectedFile} isOpen={isMobileUploadModalOpen} onClose={closeModal} />
            <Input
                type="file"
                accept="image/*, video/*"
                capture="environment"
                display="none"
                ref={fileInputRef}
                onChange={handleFileChange}
            />
            <IconButton
                border="1px solid black"
                p={5}
                aria-label="camera"
                onClick={hiveUser ? handleCameraClick : () => setIsLoginModalOpen(true)}
                icon={hiveUser ? <GiVideoCamera color="black" size={45} /> : <SlLogin color="black" size={45} />}
                isRound
                size="lg"
                bg="limegreen"
                _hover={{ bg: 'limegreen', transform: 'scale(1.1)', transition: '0.3s' }}
                color="black"
            />
        </>
    );
};

export default UploadImageButton;
