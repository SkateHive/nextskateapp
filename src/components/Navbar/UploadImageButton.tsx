'use client';

import { useUserData } from "@/contexts/UserContext";
import { IconButton, Input } from "@chakra-ui/react";
import { useCallback, useRef, useState } from "react";
import { GiVideoCamera } from "react-icons/gi";
import { SlLogin } from "react-icons/sl";
import LoginModal from "../Hive/Login/LoginModal";
import MobileUploadModal from "./MobileUploadModal";
import { CSSProperties } from 'react';

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

type UploadImageButtonProps = {
    styles: CSSProperties;
    onClick: () => void;
};

const UploadImageButton: React.FC<UploadImageButtonProps> = ({ styles, onClick }) => {
    const hiveUser = useUserData();
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
                aria-label="camera"
                onClick={onClick}
                icon={hiveUser ? <GiVideoCamera color="black" size={35} /> : <SlLogin color="black" size={45} />}
                style={styles}
            />
        </>
    );
};

export default UploadImageButton;
