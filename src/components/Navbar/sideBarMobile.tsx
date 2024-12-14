import NotificationsPage from "@/app/notifications/page";
import { useHiveUser } from "@/contexts/UserContext";
import HiveClient from "@/lib/hive/hiveclient";
import { HiveAccount } from "@/lib/models/user";
import { formatETHaddress } from "@/lib/utils";
import { Link } from "@chakra-ui/next-js";
import {
    Button,
    Divider,
    Drawer,
    DrawerBody,
    DrawerContent,
    DrawerFooter,
    DrawerOverlay,
    HStack,
    Icon,
    Image,
    Text,
    keyframes,
    useDisclosure
} from "@chakra-ui/react";
import { useAccountModal, useConnectModal } from "@rainbow-me/rainbowkit";
import { useEffect, useState } from "react";
import { FaBell, FaBook, FaEthereum, FaHive, FaMapMarkerAlt, FaSpeakap, FaUser, FaWallet } from "react-icons/fa";
import { useAccount } from "wagmi";
import "../../styles/fonts.css";
import LoginModal from "../Hive/Login/LoginModal";
import CommunityTotalPayout from "../communityTotalPayout";
import checkRewards from "./utils/checkReward";
import { claimRewards } from "./utils/claimRewards";
import { FormattedAddress } from "../NNSAddress";
const blink = keyframes`
  0% { color: gold; opacity: 1; }
  50% { opacity: 0.1; }
  100% { opacity: 1; }
`;


const SideBarMobile = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
    const user = useHiveUser();
    const hiveUser = user.hiveUser;
    const client = HiveClient;

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
    const [hiveAccount, setHiveAccount] = useState<HiveAccount>();


    useEffect(() => {
        if (hiveUser?.metadata?.profile?.name && !hiveAccount) {
            const getUserAccount = async () => {
                try {
                    const userAccount = await client.database.getAccounts([hiveUser.name]);
                    if (userAccount.length > 0) {
                        setHiveAccount(userAccount[0]);
                    }
                } catch (error) {
                    console.error("Failed to fetch user account", error);
                }
            };

            getUserAccount();
        }
    }, [hiveUser?.name]);

    useEffect(() => {
        const checkUserRewards = async () => {
            if (hiveUser) {
                setHasRewards(await checkRewards(String(hiveUser.name)));
            }
        };

        checkUserRewards();
    }, [hiveUser]);
    const handleClaimRewards = () => {
        if (hiveAccount) {
            claimRewards(hiveAccount);
        }
    };
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

                        <HStack onClick={() => { setNotifications(false); onClose(); }} padding={0} mt={8} gap={3} fontSize={"22px"}>
                            <FaSpeakap size={"22px"} />
                            <Link fontFamily="Joystix" href={"/"}>Feed</Link>
                        </HStack>
                        <HStack onClick={() => { setNotifications(false); onClose(); }} padding={0} gap={3} fontSize={"22px"}>
                            <FaMapMarkerAlt size={"22px"} />
                            <Link fontFamily="Joystix" href={"/map"}>Map</Link>
                        </HStack>
                        <HStack onClick={() => { setNotifications(false); onClose(); }} padding={0} gap={3} fontSize={"22px"}>
                            <FaBook size={"22px"} />
                            <Link fontFamily="Joystix" href={"/mag"}>Magazine</Link>
                        </HStack>
                        {ethAccount.address && (

                            <HStack onClick={() => { setNotifications(false); onClose(); }} padding={0} gap={3} fontSize={"22px"}>
                                <FaEthereum size={"22px"} />
                                <Link fontFamily="Joystix" href={"/dao"}>Dao</Link>
                            </HStack>
                        )}
                        {hiveUser ? (
                            <>
                                <HStack onClick={() => { setNotifications(false); onClose(); }} padding={0} gap={3} fontSize={"22px"}>
                                    <FaUser size={"22px"} />
                                    <Text fontFamily="Joystix" cursor={"pointer"} onClick={() => {
                                        window.location.href = `/profile/${hiveUser.name}`;
                                    }}>Profile</Text>
                                </HStack>
                                <HStack onClick={() => { setNotifications(false); onClose(); }} padding={0} gap={3} fontSize={"22px"}>
                                    <FaWallet size={"22px"} />
                                    <Text fontFamily="Joystix" cursor={"pointer"} onClick={() => {
                                        window.location.href = `/wallet`;
                                    }}>Wallet</Text>
                                    {hasRewards && (
                                        <Button
                                            gap={0}
                                            leftIcon={<Icon as={FaHive} />}
                                            ml={-2}
                                            p={2}
                                            justifyContent={"center"}
                                            color="gold"
                                            variant="outline"
                                            border={"none"}
                                            animation={`${blink} 1s linear infinite`}
                                            onClick={handleClaimRewards}
                                            _hover={{
                                                animation: "none",
                                                border: "1px dashed yellow",
                                            }}
                                        >
                                            Rewards
                                        </Button>
                                    )}
                                </HStack>
                                <HStack
                                    cursor={"pointer"}
                                    onClick={handleNotifications}
                                    padding={0}
                                    gap={3}
                                    fontSize={"22px"}
                                    fontFamily="Joystix"
                                >
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
                                colorScheme="red"
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
                                colorScheme="blue"

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
                                    <FormattedAddress address={ethAccount.address} />
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