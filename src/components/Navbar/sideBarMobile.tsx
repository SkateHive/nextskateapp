import { Link } from "@chakra-ui/next-js"
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
    Tooltip,
    keyframes,
    useDisclosure,
    useMediaQuery,
    Text,
} from "@chakra-ui/react"
import { FaBell, FaEthereum, FaHome, FaSpeakap, FaUser, FaWallet } from "react-icons/fa";
import { useHiveUser } from "@/contexts/UserContext";
import { useAccount } from "wagmi";
import { formatETHaddress } from "@/lib/utils";
import CommunityTotalPayout from "../communityTotalPayout";
import NotificationsPage from "@/app/notifications/page";
import { useEffect, useState } from "react";
import checkRewards from "./utils/checkReward"
import { useAccountModal, useConnectModal } from "@rainbow-me/rainbowkit"
import { claimRewards } from "@/lib/hive/client-functions";
import LoginModal from "../Hive/Login/LoginModal";
import { FaHive, FaBook } from "react-icons/fa";

const blink = keyframes`
  0% { opacity: 1; }
  50% { opacity: 0.1; }
  100% { opacity: 1; }
`


const SideBarMobile = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
    const user = useHiveUser();
    const hiveUser = user.hiveUser;

    const ethAccount = useAccount()
    const [notifications, setNotifications] = useState(false)
    const [hasRewards, setHasRewards] = useState(false)
    const {
        isOpen: isLoginOpen,
        onOpen: onLoginOpen,
        onClose: onLoginClose,
    } = useDisclosure()
    const { openConnectModal } = useConnectModal()
    const { openAccountModal } = useAccountModal()


    useEffect(() => {
        if (hiveUser !== null) {
            checkRewards(setHasRewards, hiveUser)
        }
    }, [hiveUser])

    const handleClaimRewards = () => {
        if (hiveUser) {
            claimRewards(hiveUser)
        }
    }
    const handleNotifications = () => {
        setNotifications(!notifications)
    }

    return (
        <>
            <LoginModal isOpen={isLoginOpen} onClose={onLoginClose} />

            <Drawer
                placement={"bottom"}
                onClose={onClose}
                isOpen={isOpen}
                returnFocusOnClose={false}
                trapFocus={false}
            >
                <DrawerOverlay style={{ pointerEvents: 'none' }} />

                <DrawerContent
                    bg={"black"}
                    color={"white"}
                    borderRight={"1px solid limegreen"}
                >
                    <DrawerBody
                        marginTop={"8px"}
                        display={"flex"}
                        flexDir={"column"}
                        gap={2}
                    >
                        <Image
                            src="/skatehive-banner.png" w={"100%"} h={"auto"} alt="SkateHive" />
                        <Divider mb={3} mt={3} style={{ color: 'limegreen', borderColor: 'limegreen' }} />
                        <CommunityTotalPayout />

                        <HStack padding={0} mt={8} gap={3} fontSize={"22px"}>
                            <FaSpeakap size={"22px"} />
                            <Link href={"/"}>Feed</Link>
                        </HStack>
                        <HStack padding={0} gap={3} fontSize={"22px"}>
                            <FaBook size={"22px"} />
                            <Link href={"/mag"}>Magazine</Link>
                        </HStack>
                        {ethAccount.address && (

                            <HStack padding={0} gap={3} fontSize={"22px"}>
                                <FaEthereum size={"22px"} />
                                <Link href={"/dao"}>Dao</Link>
                            </HStack>
                        )}
                        {hiveUser ? (
                            <>
                                <HStack padding={0} gap={3} fontSize={"22px"}>
                                    <FaUser size={"22px"} />
                                    <Link href={`/profile/${hiveUser.name}`}>Profile</Link>
                                </HStack>
                                <HStack padding={0} gap={3} fontSize={"22px"}>
                                    <FaWallet size={"22px"} />
                                    <Link href={`/wallet`}>Wallet</Link>
                                    {hasRewards && (
                                        <Button
                                            gap={0}
                                            leftIcon={<Icon as={FaHive} />}
                                            ml={-2}
                                            p={2}
                                            justifyContent={"center"}
                                            colorScheme="yellow"
                                            variant="outline"
                                            border={"none"}
                                            animation={`${blink} 1s linear infinite`}
                                            onClick={handleClaimRewards}
                                        >
                                            Rewards
                                        </Button>
                                    )}
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
                                onClick={() => (onLoginOpen())}
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
        </>
    )
}

export default SideBarMobile;