"use client"
import { Box, Button, Divider, HStack, Image, useDisclosure } from "@chakra-ui/react"
import { useEffect, useState } from "react"
import { FaBell, FaUserPlus, FaBook, FaGift, FaDiscord, FaMap } from "react-icons/fa";
import AirdropModal from "./airdropModal"
import { useRouter } from "next/navigation";
import { useMediaQuery } from "@chakra-ui/react";
import { MagModal } from "@/components/Magazine/MagModal";

interface TopMenuProps {
  sortedComments: any[]
}

const TopMenu = ({ sortedComments }: TopMenuProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [loginMethod, setLoginMethod] = useState<string | null>(null)
  const router = useRouter()
  const [isMobile] = useMediaQuery("(max-width: 574px)")
  const { isOpen: isMagOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    if (typeof window !== "undefined") {
      setLoginMethod(localStorage.getItem("LoginMethod"))
    }
  }, []);

  const handleCloseModal = () => {
    setIsOpen(false)
  }

  const handleCreateClick = () => {
    if (loginMethod === null) {
      setIsOpen(true);
    } else {
      router.push("/upload");
    }
  };

  return (
    <>
      {isMagOpen && <MagModal username={"hive-173115"} query={"created"} isOpen={isMagOpen} onClose={onClose} />}
      {isOpen && <AirdropModal sortedComments={sortedComments} isOpen={isOpen} onClose={handleCloseModal} />}
      <Box
        w={"100%"}
        css={{ "&::-webkit-scrollbar": { display: "none" } }}
        overflowX="auto"
        minHeight={"60px"}
        px={4}
        mt={3}
      >
        <HStack justifyContent={"space-between"} w="100%">
          {loginMethod ? (
            <>
              <Button
                leftIcon={<FaGift />}
                colorScheme="red"
                variant="outline"
                size={{ base: "sm", md: "md" }}
                onClick={() => setIsOpen(true)}
              >
                AIRDROP
              </Button>
              <Button
                leftIcon={<FaUserPlus />}
                colorScheme="blue"
                variant="outline"
                size={{ base: "sm", md: "md" }}
                onClick={() => router.push("/invite")}
              >
                INVITE
              </Button>
              <Button
                leftIcon={<Image
                  src="/treboard.gif"
                  alt="tre flip Skateboard icon"
                  width={{ base: 6, md: 8 }}
                  height={{ base: 6, md: 8 }}
                />}
                onClick={handleCreateClick}
                colorScheme="green"
                variant={"outline"}
                size={{ base: "sm", md: "md" }}
              >
                WRITE {!isMobile && "IN MAG"}
              </Button>
              <Button
                colorScheme="yellow"
                variant="outline"
                size={{ base: "sm", md: "md" }}
                onClick={() => router.push("/notifications")}
              >
                <FaBell />
              </Button>
            </>
          ) : (
            <>
              <Button
                leftIcon={<FaBook />}
                colorScheme="blue"
                variant="outline"
                size={{ base: "sm", md: "md" }}
                onClick={() => router.push("https://docs.skatehive.app")}
              >
                ABOUT
              </Button>
              {!isMobile ? (
                <Button
                  leftIcon={<FaBook />}
                  colorScheme="green"
                  variant="outline"
                  size={{ base: "sm", md: "md" }}
                  onClick={() => onOpen()}
                >
                  READ MAGAZINE
                </Button>
              ) : (
                <Button
                  leftIcon={<FaMap />}
                  colorScheme="yellow"
                  variant="outline"
                  size={{ base: "sm", md: "md" }}
                  onClick={() => router.push("/map")}
                >
                  MAP
                </Button>
              )
              }
              <Button
                leftIcon={<FaDiscord />}
                colorScheme="purple"
                variant="outline"
                size={{ base: "sm", md: "md" }}
                onClick={() => window.open("https://discord.gg/G4bamNkZuE", "_blank")}
              >
                DISCORD
              </Button>

            </>
          )}
        </HStack>
      </Box>
      <Divider />
    </>
  )
}

export default TopMenu
