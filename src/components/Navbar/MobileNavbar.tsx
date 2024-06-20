'use client';
import { Box, Flex } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { FaHome, FaWallet } from "react-icons/fa";
import { ImMenu } from "react-icons/im";
import { MdOutlineMenuBook } from "react-icons/md";
import UploadImageButton from "./UploadImageButton";
import WalletButton from "./WalletButton";
import MagButton from "./magButton";
import SideBarMobile from "./sideBarMobile";
import UploadPageButton from "./uploadPageButton";

const MobileNavbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [dynamicButton, setDynamicButton] = useState(<UploadImageButton />);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    const closeMenu = () => {
        setIsOpen(false);
    };

    useEffect(() => {
        const renderDynamicButton = () => {
            if (window.location.pathname === '/') {
                return <UploadImageButton />
            } else if (window.location.pathname === '/wallet') {
                return <WalletButton />;
            } else if (window.location.pathname === '/mag') {
                return <MagButton />;
            } else if (window.location.pathname === '/upload') {
                return <UploadPageButton />;
            }

            return <UploadImageButton />;
        };

        if (typeof window !== 'undefined') {
            setDynamicButton(renderDynamicButton());
        }
    }, []);

    return (
        <Box position="fixed" bottom="0" width="100%" bg="black" borderTop="0.6px solid grey">
            <Flex m={2} justify="space-between" align="center">
                <Box m={2}>
                    <ImMenu size={25} onClick={toggleMenu} color='white' />
                </Box>
                <Box m={2}>
                    <FaHome size={25} color='white' onClick={() => window.location.href = '/'} />
                </Box>
                <Box position="relative" right={"2px"} top="-20px">
                    {dynamicButton}
                </Box>
                <Box>
                    <FaWallet onClick={() => window.location.href = '/wallet'} size={25} color="white" />
                </Box>
                <Box>
                    <MdOutlineMenuBook onClick={() => window.location.href = '/mag'} size={25} color="white" />
                </Box>
            </Flex>
            <SideBarMobile onClose={closeMenu} isOpen={isOpen} />
        </Box>
    );
};

export default MobileNavbar;
