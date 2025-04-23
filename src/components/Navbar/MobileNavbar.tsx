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
import { useRouter, usePathname } from "next/navigation";

const buttonStyles = {
  border: "1px solid black",
  p: 5,
  size: "lg",
  bg: "transparent",
  _hover: { bg: "limegreen", transform: "scale(1.1)", transition: "0.3s" },
  isRound: true,
};

const MobileNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [dynamicButton, setDynamicButton] = useState(
    <UploadImageButton
      styles={buttonStyles}
      onClick={() => router.push("/upload-image")}
    />
  );
  const router = useRouter();
  const pathname = usePathname();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  useEffect(() => {
    const renderDynamicButton = () => {
      if (pathname === "/") {
        return (
          <UploadImageButton
            styles={buttonStyles}
            onClick={() => router.push("/upload-image")}
          />
        );
      } else if (pathname === "/wallet") {
        return (
          <WalletButton
            styles={buttonStyles}
            onClick={() => router.push("/wallet")}
          />
        );
      } else if (pathname === "/mag") {
        return (
          <MagButton
            styles={buttonStyles}
            onClick={() => router.push("/magazine")}
          />
        );
      } else if (pathname === "/upload") {
        return (
          <UploadPageButton
            styles={buttonStyles}
            onClick={() => router.push("/upload")}
          />
        );
      }

      return (
        <UploadImageButton
          styles={buttonStyles}
          onClick={() => router.push("/upload-image")}
        />
      );
    };

    setDynamicButton(renderDynamicButton());
  }, [pathname]);

  const dockItems = [
    {
      icon: <ImMenu size={22} />,
      label: "Menu",
      onClick: toggleMenu,
    },
    {
      icon: <FaHome size={22} />,
      label: "Home",
      onClick: () => router.push("/"),
    },
    {
      icon: dynamicButton,
      label: "Upload",
      onClick: () => router.push("/upload"),
    },
    {
      icon: <FaWallet size={22} />,
      label: "Wallet",
      onClick: () => router.push("/wallet"),
    },
    {
      icon: <MdOutlineMenuBook size={22} />,
      label: "Magazine",
      onClick: () => router.push("/mag"),
    },
  ];

  if (pathname === "/invite") {
    return null; // Hide the navbar on the invite page
  }

  return (
    <>
      <Box
        zIndex={9999}
        position="fixed"
        bottom="0"
        width="100%"
        padding="5px 0"
      >
        <Dock
          items={dockItems}
          panelHeight={70}
          baseItemSize={45}
          magnification={60}
          className="m-2"
        />
        {isOpen && <SideBarMobile onClose={closeMenu} isOpen={isOpen} />}
      </Box>
    </>
  );
};

export default MobileNavbar;
