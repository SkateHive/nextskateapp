'use client'
import { useHiveUser } from "@/contexts/UserContext";
import { useIsClient } from "@/hooks/useIsClient";
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
import { useAccount } from "wagmi";
import "../../styles/fonts.css";
import LoginModal from "../Hive/Login/LoginModal";
import { FormattedAddress } from "../NNSAddress";
import CommunityTotalPayout from "../communityTotalPayout";
import ClaimRewardsButton from "./ClaimRewardsButton";
import MenuItems from "./MenuItems";
import { FaBook, FaEthereum, FaHive, FaMapMarkerAlt, FaSpeakap, FaUser, FaWallet } from "react-icons/fa";

const blink = keyframes`
  0% { color: gold; opacity: 1; }
  50% { opacity: 0.1; }
  100% { opacity: 1; }
`;

const SideBarMobile = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
    const isClient = useIsClient();
    const user = useHiveUser();
    const hiveUser = user.hiveUser;
    const ethAccount = useAccount();
    const { openConnectModal } = useConnectModal();
    const { openAccountModal } = useAccountModal();

    const {
        isOpen: isLoginOpen,
        onOpen: onLoginOpen,
        onClose: onLoginClose,
    } = useDisclosure();

    const menuItems = [
        { icon: FaSpeakap, label: "Feed", path: "/" },
        { icon: FaMapMarkerAlt, label: "Map", path: "/map" },
        { icon: FaBook, label: "Magazine", path: "/mag" },
        { icon: FaEthereum, label: "Dao", path: "/dao" },
    ];

    const conditionalItems = [
        { icon: FaUser, label: "Profile", path: `/profile/${hiveUser?.name}`, condition: !!hiveUser },
    ];



    if (!isClient) return null;

    const hasRewards = hiveUser && (
        parseFloat(hiveUser.reward_hbd_balance.toString()) > 0 ||
        parseFloat(hiveUser.reward_hive_balance.toString()) > 0 ||
        parseFloat(hiveUser.reward_vesting_balance.toString()) > 0
    );
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

                        <MenuItems items={menuItems} onClose={onClose} />
                        <MenuItems items={conditionalItems} onClose={onClose} />

                        {hiveUser && (
                            <HStack padding={0} gap={3} fontSize={"22px"}>
                                <FaWallet size={"22px"} />
                                <Text fontFamily="Joystix" cursor={"pointer"} onClick={() => {
                                    window.location.href = `/wallet`;
                                }}>Wallet</Text>
                                {hasRewards && (
                                    <ClaimRewardsButton
                                        hiveAccount={hiveUser}
                                    />
                                )}
                            </HStack>
                        )}


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