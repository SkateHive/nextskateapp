"use client"
import { useLastAuction } from "@/hooks/auction"
import { Avatar, Box, Link as ChakraLink, Divider, HStack, Text, useDisclosure } from "@chakra-ui/react"
import Link from "next/link";
import { useEffect, useState } from "react"
import { useAccount } from "wagmi"
import AirdropModal from "./airdropModal"

interface TopMenuProps {
  sortedComments: any[]
}

interface AvatarButtonProps {
  onClick: () => void;
  tooltipLabel: string | undefined;
  tooltipColor: string;
  tooltipBorder: string;
  avatarProps: {
    border: string;
    name: string | undefined;
    boxSize: number;
    bg: string;
    src: string;
    borderHover: string;
  };
  text: string;
}

const TopMenu = ({ sortedComments }: TopMenuProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [loginMethod, setLoginMethod] = useState<string | null>(null)
  const eth_user = useAccount()
  const { data: activeAuction } = useLastAuction();
  const { isOpen: isAuctionModalOpen, onOpen: onAuctionModalOpen, onClose: onAuctionModalClose } = useDisclosure();

  useEffect(() => {
    if (typeof window !== "undefined") {
      setLoginMethod(localStorage.getItem("LoginMethod"))
    }
  }, [])

  const handleCloseModal = () => {
    setIsOpen(false)
  }

  const AvatarButton = ({ onClick, tooltipLabel, tooltipColor, tooltipBorder, avatarProps, text }: AvatarButtonProps) => (
    <Box
      w={{ base: "40px", md: "150px" }}
      h={"40px"}
      borderRadius={"10px"}
      display={"flex"}
      justifyContent={"center"}
      alignItems={"center"}
      onClick={onClick}
      p={2}
      cursor="pointer"
    >
      <Avatar
        {...avatarProps}
        loading="lazy"
        borderRadius={5}
        mr={{ base: 0, md: 2 }}
        _hover={{ cursor: "pointer", border: avatarProps.borderHover }}
      />
      <Text
        display={{ base: "none", md: "block" }}
        isTruncated
        fontSize={{ base: "xs", md: "sm" }}
        fontWeight="bold"
      >
        {text}
      </Text>
    </Box>
  );

  return (
    <>
      <HStack
        flexWrap={"nowrap"}
        w={"100%"}
        css={{ "&::-webkit-scrollbar": { display: "none" } }}
        overflowX="auto"
        minHeight={"60px"}
        px={4}
        spacing={{ base: 2, md: 4 }} // Adjust spacing for mobile and desktop
        mt={1}
        justifyContent={{ base: "space-between", md: "flex-start" }} // Add this line to space icons in mobile mode
      >
        <AvatarButton
          onClick={onAuctionModalOpen}
          tooltipLabel={activeAuction?.token?.name}
          tooltipColor={"purple"}
          tooltipBorder={"1px dashed purple"}
          avatarProps={{
            border: "1px dashed purple",
            name: activeAuction?.token?.name,
            boxSize: 12,
            bg: "black",
            src: activeAuction?.token?.image || "/auction.gif",
            borderHover: "1px solid purple"
          }}
          text="ART"
        />
        {loginMethod && (
          <Link href="/notifications" passHref>
            <AvatarButton
              onClick={() => { }}
              tooltipLabel={"Notific"}
              tooltipColor={"yellow"}
              tooltipBorder={"1px dashed yellow"}
              avatarProps={{
                border: "1px dashed yellow",
                name: "Notifications",
                boxSize: 12,
                bg: "black",
                src: "/Notification.gif",
                borderHover: "1px dashed red"
              }}
              text="NOTIFIC"
            />
          </Link>
        )}
        <AvatarButton
          onClick={() => setIsOpen(true)}
          tooltipLabel={"Create Community Airdrop"}
          tooltipColor={"gold"}
          tooltipBorder={"1px dashed gold"}
          avatarProps={{
            border: "1px solid red",
            name: "airdrop",
            boxSize: 12,
            bg: "black",
            src: "https://i.ibb.co/cgykmcc/image.png",
            borderHover: "1px solid gold"
          }}
          text="AIRDROP"
        />
        {isOpen && <AirdropModal sortedComments={sortedComments} isOpen={isOpen} onClose={handleCloseModal} />}
        <Link href="/invite" passHref>
          <AvatarButton
            onClick={() => { }}
            tooltipLabel={"Invite someone cool enough"}
            tooltipColor={"#A5D6A7"}
            tooltipBorder={"1px dashed #A5D6A7"}
            avatarProps={{
              border: "1px dashed limegreen",
              name: "+",
              boxSize: 12,
              bg: "black",
              src: "/loading.gif",
              borderHover: "1px dashed limegreen"
            }}
            text="INVITE"
          />
        </Link>
      </HStack>
      <Divider />
    </>
  )
}

export default TopMenu
