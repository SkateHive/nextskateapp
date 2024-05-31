'use client';
import { Image } from "@chakra-ui/react";
import { useState } from "react";
import SideBarMobile from "./Navbar/sideBarMobile";

const MobileMenuButton = () => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    }

    const closeMenu = () => {
        setIsOpen(false);
    }

    return (
        <div>
            <SideBarMobile onClose={closeMenu} isOpen={isOpen} />

            <Image onClick={toggleMenu} boxSize={"128px"} p={0} src="/skatehive_square_green.png" alt="menu" width="64px" height="64px" />
        </div>
    );
};

export default MobileMenuButton;
