"use client";
import NotificationsPage from "@/app/notifications/page";
import { useHiveUser } from "@/contexts/UserContext";
import { claimRewards } from "./utils/claimRewards";
import HiveClient from "@/lib/hive/hiveclient";
import { HiveAccount } from "@/lib/models/user";
import { formatETHaddress } from "@/lib/utils";
import {
  Box,
  Button,
  Divider,
  HStack,
  Heading,
  Icon,
  Image,
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
  const [hiveAccount, setHiveAccount] = useState<HiveAccount>();
  // fix maluco, melhorar isso
  const client = HiveClient;
  useEffect(() => {
    if (hiveUser?.name) {
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


  const {
    isOpen: isLoginOpen,
    onOpen: onLoginOpen,
    onClose: onLoginClose,
  } = useDisclosure();

  const [notifications, setNotifications] = useState(false);
  const [hasRewards, setHasRewards] = useState(false);
  useEffect(() => {
    const checkUserRewards = async () => {
      if (hiveUser) {
        setHasRewards(await checkRewards(String(hiveUser.name)));
        console.log(hasRewards ? "User has rewards" : "User has no rewards");
      }
    };

    checkUserRewards();
  }, [hiveUser]);

  const handleNotifications = () => {
    setNotifications(!notifications);
  };

  const handleClaimRewards = () => {

    console.log("Claiming rewards");
    console.log(hiveAccount);
    if (hiveAccount) {
      claimRewards(hiveAccount);
    }
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
              border: "1px solid #A5D6A7",
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
          style={{ color: "#A5D6A7", borderColor: "#A5D6A7" }}
        />
        <CommunityTotalPayout />

        <HStack padding={0} mt={8} gap={3} fontSize={"22px"}>
          <FaSpeakap size={"22px"} />
          <Text cursor={"pointer"} onClick={() => {
            window.location.href = "/";
          }}>Feed</Text>
        </HStack>
        <HStack padding={0} gap={3} fontSize={"22px"}>
          <FaBook size={"22px"} />
          <Text cursor={"pointer"} onClick={() => {
            window.location.href = "/mag";
          }}>Magazine</Text>
        </HStack>
        <HStack padding={0} gap={3} fontSize={"22px"}>
          <FaEthereum size={"22px"} />
          <Text cursor={"pointer"} onClick={() => {
            window.location.href = "/dao";
          }}>Dao</Text>
        </HStack>
        {!hiveUser && (
          <HStack padding={0} gap={3} fontSize={"22px"}>
            <FaDiscord size={"22px"} />
            <Text cursor={"pointer"} onClick={() => {
              window.location.href = "https://discord.gg/skateboard";
            }}>Chat</Text>
          </HStack>
        )}

        {hiveUser ? (
          <>
            <HStack padding={0} gap={3} fontSize={"22px"}>
              <FaUser size={"22px"} />
              <Text cursor={"pointer"} onClick={() => {
                window.location.href = `/profile/${hiveUser.name}`;
              }}>Profile</Text>
            </HStack>
            <HStack padding={0} gap={3} fontSize={"22px"}>
              <FaWallet size={"22px"} />
              <Text cursor={"pointer"} onClick={() => {
                window.location.href = `/wallet`;
              }}>Wallet</Text>
              {hasRewards && (console.log(hasRewards),
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
