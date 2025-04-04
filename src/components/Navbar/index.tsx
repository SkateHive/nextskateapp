"use client"

import NotificationsPage from "@/app/notifications/page"
import AuthorSearchBar from "@/app/upload/components/searchBar"
import { useHiveUser } from "@/contexts/UserContext"
import {
  Box,
  Button,
  Divider,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerOverlay,
  Flex,
  HStack,
  Heading,
  Icon,
  IconButton,
  Image,
  Text,
  Tooltip,
  keyframes,
  useDisclosure,
  useMediaQuery,
} from "@chakra-ui/react"
import { useAccountModal, useConnectModal } from "@rainbow-me/rainbowkit"
import { Home } from "lucide-react"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { FaBell, FaHive, FaHome, FaSpeakap, FaUser, FaWallet } from "react-icons/fa"
import { FaEthereum } from "react-icons/fa6"
import { useReward } from "react-rewards"
import { useAccount } from "wagmi"
import LoginModal from "../Hive/Login/LoginModal"
import CommunityTotalPayout from "../communityTotalPayout"
import AvatarLogin from "./AvatarLogin"
import checkRewards from "./utils/checkReward"
import { claimRewards } from "./utils/claimRewards"
import { formatETHaddress } from "@/lib/utils"
import { useIsClient } from "@/hooks/useIsClient"; // Add this import
import NextLink from "next/link" // Add this import

const blink = keyframes`
  0% { opacity: 1; }
  50% { opacity: 0.1; }
  100% { opacity: 1; }
`

export default function Navbar() {
  const isClient = useIsClient(); // Add this line
  const pathname = usePathname()
  const { hiveUser } = useHiveUser()
  const [hasRewards, setHasRewards] = useState(false)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [notifications, setNotifications] = useState(false)
  const ethAccount = useAccount()

  const {
    isOpen: isLoginOpen,
    onOpen: onLoginOpen,
    onClose: onLoginClose,
  } = useDisclosure()

  const { openConnectModal } = useConnectModal()
  const { openAccountModal } = useAccountModal()

  const [isSmallerThan400] = useMediaQuery("(max-width: 400px)")

  const { reward: confettiReward } = useReward("rewardId", "emoji", {
    emoji: ["$", "*", "#"],
    spread: 60,
  });

  useEffect(() => {
    if (hiveUser !== null) {
      checkRewards(hiveUser.name)
    }
  }, [hiveUser])

  const handleClaimRewards = () => {
    if (hiveUser) {
      claimRewards(hiveUser);
      confettiReward();
    }
  };

  const handleNotifications = () => {
    setNotifications(!notifications)
  }

  if (!isClient) return null; // Add this line

  return (
    <Box>
      <Drawer
        placement={isSmallerThan400 ? "bottom" : "left"}
        onClose={onClose}
        isOpen={isOpen}
      >
        <DrawerOverlay />
        <DrawerContent
          bg={"black"}
          color={"white"}
          borderRight={"1px solid #A5D6A7"}
        >
          <DrawerBody
            marginTop={"8px"}
            display={"flex"}
            flexDir={"column"}
            gap={2}
          >
            <Image
              src="/skatehive-banner.png" w={"100%"} h={"auto"} alt="SkateHive" />
            <Divider mb={3} mt={3} style={{ color: '#A5D6A7', borderColor: '#A5D6A7' }} />
            <CommunityTotalPayout />
            {hasRewards && (
              <Button
                gap={1}
                justifyContent={"center"}
                colorScheme="yellow"
                variant="outline"
                animation={`${blink} 1s linear infinite`}
                onClick={handleClaimRewards}
              >
                Claim Rewards !
              </Button>
            )}
            <HStack padding={0} gap={3} fontSize={"22px"}>
              <FaHome size={"22px"} />
              <NextLink href={"/"}>Home</NextLink>
            </HStack>
            <HStack padding={0} gap={3} fontSize={"22px"}>
              <FaSpeakap size={"22px"} />
              <NextLink href={"/plaza"}>Plaza</NextLink>
            </HStack>
            <HStack padding={0} gap={3} fontSize={"22px"}>
              <FaEthereum size={"22px"} />
              <NextLink href={"/dao"}>Dao</NextLink>
            </HStack>
            <HStack padding={0} gap={3} fontSize={"22px"}>
              <FaEthereum size={"22px"} />
              <NextLink href={"/landingPage"}>landing</NextLink>
            </HStack>
            {hiveUser ? (
              <>
                <HStack padding={0} gap={3} fontSize={"22px"}>
                  <FaUser size={"22px"} />
                  <NextLink href={`/profile/${hiveUser.name}`}>Profile</NextLink>
                </HStack>
                <HStack padding={0} gap={3} fontSize={"22px"}>
                  <FaWallet size={"22px"} />
                  <NextLink href={`/wallet`}>Wallet</NextLink>
                </HStack>
                <HStack cursor={"pointer"} onClick={handleNotifications} padding={0} gap={3} fontSize={"22px"}>
                  <FaBell size={"22px"} />
                  <Text> Notifications</Text>
                </HStack>
                {notifications ? <NotificationsPage /> : null}

              </>
            ) : null}
          </DrawerBody>
          <DrawerFooter
            display={"flex"}
            flexDirection={"column"}
            alignItems={"stretch"}
            gap={2}
          >
            <LoginModal onClose={onLoginClose} isOpen={isLoginOpen} />
            <HStack>
              <Button
                justifyContent={"center"}
                fontSize={"14px"}
                variant={"outline"}
                borderColor={"red.400"}
                width={"100%"}
                bg="black"
                leftIcon={
                  <Icon color={hiveUser ? "red.400" : "white"} as={FaHive} />
                }
                onClick={() => (hiveUser ? null : onLoginOpen())}
              >
                {hiveUser ? <p>{hiveUser.name}</p> : <span>Login</span>}
              </Button>
              <Button
                justifyContent={"center"}
                fontSize={"14px"}
                variant={"outline"}
                borderColor={"blue.400"}
                width={"100%"}
                bg="black"
                leftIcon={
                  <Icon
                    color={ethAccount.address ? "blue.400" : "white"}
                    as={FaEthereum}
                  />
                }
                onClick={() =>
                  !ethAccount.address && openConnectModal
                    ? openConnectModal()
                    : openAccountModal && openAccountModal()
                }
              >
                {ethAccount.address ? (
                  formatETHaddress(ethAccount.address)
                ) : (
                  <span>Connect</span>
                )}
              </Button>
            </HStack>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>


      <Flex m={3} align="center" justify="space-between" zIndex={999}>
        <Heading ml={3} size="2xl">
          <HStack>
            <Image
              onClick={onOpen}
              boxSize={"58px"}
              src="SKATE_HIVE_VECTOR_FIN.svg"
              alt="SkateHive"
              borderRadius={"5px"}
              _hover={{ cursor: "pointer" }}
            />
            {pathname === "/" ? null : (
              <Tooltip label="Return Home">
                <NextLink href="/" scroll={false}>
                  <IconButton
                    aria-label="Home"
                    icon={<Home color="#A5D6A7" />}
                    size="lg"
                    color={"white"}
                    bg={"transparent"}
                  />
                </NextLink>
              </Tooltip>
            )}
          </HStack>
        </Heading>

        <AuthorSearchBar
          onSearch={(selectedUsername: string) => {
            window.location.href = `/profile/${selectedUsername}`
          }}
        />
        <HStack>

          <AvatarLogin />
        </HStack>
      </Flex>
      <Divider mb={[0, 3]} color="darkgray" />
    </Box>
  )
}
