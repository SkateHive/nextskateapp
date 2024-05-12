'use client'
import NotificationsPage from '@/app/notifications/page';
import { useHiveUser } from '@/contexts/UserContext';
import {
    Box,
    Divider,
    Flex,
    HStack,
    Heading,
    Image,
    Link,
    Text,
    Button,
    Icon,
    keyframes

} from '@chakra-ui/react';
import React from 'react';
import { FaBell, FaEthereum, FaHome, FaSpeakap, FaUser, FaWallet } from 'react-icons/fa';
import CommunityTotalPayout from '../communityTotalPayout';
import { FaHive, FaDiscord } from 'react-icons/fa';
import { useAccount } from 'wagmi';
import { formatETHaddress } from '@/lib/utils';
import { useConnectModal, useAccountModal } from '@rainbow-me/rainbowkit';
import LoginModal from '../Hive/Login/LoginModal';
import { useDisclosure, useMediaQuery } from '@chakra-ui/react';
import { claimRewards } from '@/lib/hive/client-functions';
import checkRewards from './utils/checkReward';
import { useState, useEffect } from 'react';


const blink = keyframes`
  0% { opacity: 1; }
  50% { opacity: 0.1; }
  100% { opacity: 1; }
`

const Sidebar2 = () => {
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

    const [notifications, setNotifications] = useState(false);
    const [hasRewards, setHasRewards] = useState(false);

    useEffect(() => {
        if (hiveUser !== null) {
            checkRewards(setHasRewards, hiveUser);
        }
    }, [hiveUser]);

    const handleNotifications = () => {
        setNotifications(!notifications);
    };

    const handleClaimRewards = () => {
        if (hiveUser) {
            claimRewards(hiveUser);
        }
    };

    return (
        <>
            <LoginModal isOpen={isLoginOpen} onClose={onLoginClose} />
            <Box
                bg='Black'
                w={{ base: "full", md: 250 }}
                px={4}
                py={8}
                h="100vh"
                display="flex"
                flexDirection="column"
            >
                <Heading size="md">
                    <Image mb={1} src="/skatehive-banner.png" w={"100%"} h={"auto"} alt="SkateHive" />
                </Heading>
                <Divider my={4} style={{ color: 'limegreen', borderColor: 'limegreen' }} />
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
                <HStack padding={0} mt={8} gap={3} fontSize={"22px"}>
                    <FaHome size={"22px"} />
                    <Link href={"/skatecast"}>Home</Link>
                </HStack>
                <HStack padding={0} gap={3} fontSize={"22px"}>
                    <FaSpeakap size={"22px"} />
                    <Link href={"/"}>Mag</Link>
                </HStack>
                <HStack padding={0} gap={3} fontSize={"22px"}>
                    <FaEthereum size={"22px"} />
                    <Link href={"/dao"}>Dao</Link>
                </HStack>
                {hiveUser ? (
                    <>
                        <HStack padding={0} gap={3} fontSize={"22px"}>
                            <FaUser size={"22px"} />
                            <Link href={`/profile/${hiveUser.name}`}>Profile</Link>
                        </HStack>
                        <HStack padding={0} gap={3} fontSize={"22px"}>
                            <FaWallet size={"22px"} />
                            <Link href={`/wallet`}>Wallet</Link>
                        </HStack>
                        <HStack cursor={"pointer"} onClick={handleNotifications} padding={0} gap={3} fontSize={"22px"}>
                            <FaBell size={"22px"} />
                            <Text> Notifications</Text>
                        </HStack>
                        {notifications ? <NotificationsPage /> : null}
                    </>
                ) : null}
                <Flex mt="auto" direction="column" align="flex-start">
                    <HStack>
                        <Button
                            justifyContent={"center"}
                            fontSize={"14px"}
                            variant={"outline"}
                            borderColor={"red.400"}
                            width={"100%"}
                            bg="black"
                            leftIcon={<Icon color={hiveUser ? "red.400" : "white"} as={FaHive} />}
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
                            leftIcon={<Icon color={ethAccount.address ? "blue.400" : "white"} as={FaEthereum} />}
                            onClick={() => !ethAccount.address && openConnectModal ? openConnectModal() : openAccountModal && openAccountModal()}
                        >
                            {ethAccount.address ? formatETHaddress(ethAccount.address) : <span>Connect</span>}
                        </Button>
                    </HStack>
                </Flex>
            </Box>
        </>
    );

};

export default Sidebar2;
