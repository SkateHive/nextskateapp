"use client";
import NotificationsPage from "@/app/notifications/page";
import { useHiveUser } from "@/contexts/UserContext";
import { claimRewards } from "@/lib/hive/client-functions";
import { formatETHaddress } from "@/lib/utils";
import {
  Box,
  Button,
  Divider,
  HStack,
  Heading,
  Icon,
  Image,
  Link,
  Text,
  keyframes,
  useDisclosure
} from "@chakra-ui/react";
import { useAccountModal, useConnectModal } from "@rainbow-me/rainbowkit";
import { useEffect, useState } from "react";
import {
  FaBell,
  FaBook,
  FaDiscord,
  FaEthereum,
  FaHive,
  FaSpeakap,
  FaUser,
  FaWallet,
} from "react-icons/fa";
import { useAccount } from "wagmi";
import LoginModal from "../Hive/Login/LoginModal";
import CommunityTotalPayout from "../communityTotalPayout";
import checkRewards from "./utils/checkReward";

const blink = keyframes`
  0% { opacity: 1; }
  50% { opacity: 0.1; }
  100% { opacity: 1; }
`;

const SidebarDesktop = () => {
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

  const [isMoreToggle, setIsMoreToggle] = useState(false);

  const handleMoreToggle = () => {
    setIsMoreToggle(!isMoreToggle);
  };

  return (
    <>
      <LoginModal isOpen={isLoginOpen} onClose={onLoginClose} />
      <Box
        bg="Black"
        w={{ base: "full", md: 280 }}
        px={2}
        py={8}
        h="100vh"
        display="flex"
        flexDirection="column"
      >
        <Heading size="md">
          <Image
            boxSize={"58px"}
            src="/skatehive_square_green.png"
            alt="SkateHive"
            borderRadius={"5px"}
            _hover={{
              cursor: "pointer",
              transform: "scale(1.03)",
              border: "1px solid limegreen",
            }}
            minW={"100%"}
            h={"auto"}
            onClick={() => {
              window.location.href = "/";
            }}
          />
        </Heading>
        <Divider
          my={4}
          style={{ color: "limegreen", borderColor: "limegreen" }}
        />
        <CommunityTotalPayout />

        <HStack padding={0} mt={8} gap={3} fontSize={"22px"}>
          <FaSpeakap size={"22px"} />
          <Link href={"/"}>Feed</Link>
        </HStack>
        <HStack padding={0} gap={3} fontSize={"22px"}>
          <FaBook size={"22px"} />
          <Link href={"/mag"}>Magazine</Link>
        </HStack>
        <HStack padding={0} gap={3} fontSize={"22px"}>
          <FaEthereum size={"22px"} />
          <Link href={"/dao"}>Dao</Link>
        </HStack>
        {!hiveUser && (
          <HStack padding={0} gap={3} fontSize={"22px"}>
            <FaDiscord size={"22px"} />
            <Link href={"https://discord.gg/skateboard"}>Chat</Link>
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
            <HStack
              cursor={"pointer"}
              onClick={handleNotifications}
              padding={0}
              gap={3}
              fontSize={"22px"}
            >
              <FaBell size={"22px"} />
              <Text> Notifications</Text>
            </HStack>
            {notifications ? <NotificationsPage /> : null}
          </>
        ) : null}
        <HStack mt="auto">
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
            onClick={() => onLoginOpen()}
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
                marginRight={0}
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
      </Box>
    </>
  );
};

export default SidebarDesktop;
