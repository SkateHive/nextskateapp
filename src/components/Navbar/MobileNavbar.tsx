"use client";
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
import Dock from "@/app/mainFeed/components/Dock";
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

    const dockItems = [
        {
            icon: <ImMenu size={22} />,
            label: "Menu",
            onClick: toggleMenu,
        },
        {
            icon: <FaHome size={22} />,
            label: "Home",
            onClick: () => window.location.href = '/',
        },
        {
            icon: dynamicButton,
            label: "Upload",
            onClick: () => window.location.href = '/upload',
        },
        {
            icon: <FaWallet size={22} />,
            label: "Wallet",
            onClick: () => window.location.href = '/wallet',
        },
        {
            icon: <MdOutlineMenuBook size={22} />,
            label: "Magazine",
            onClick: () => window.location.href = '/mag',
        },
    ];

    return (
        <>
            <Box
                zIndex={9999}
                position="fixed"
                bottom="0"
                width="100%"
                padding="5px 0"
            >
                <Dock items={dockItems} panelHeight={70} baseItemSize={45} magnification={60} className="m-2" />
                {isOpen && <SideBarMobile onClose={closeMenu} isOpen={isOpen} />}
            </Box>
        </>
    );
};

export default MobileNavbar;
