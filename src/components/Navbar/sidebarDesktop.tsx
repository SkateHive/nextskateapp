"use client";
import { useHiveUser } from "@/contexts/UserContext";
import HiveClient from "@/lib/hive/hiveclient";
import { HiveAccount } from "@/lib/useHiveAuth";
import {
  Box,
  Button,
  Divider,
  HStack,
  Heading,
  Icon,
  Image,
  Text,
  VStack,
  keyframes,
  useDisclosure,
  useToast,
  Skeleton
} from "@chakra-ui/react";
import { useAccountModal, useConnectModal } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  FaBook,
  FaDiscord,
  FaEthereum,
  FaHive,
  FaMapMarkerAlt,
  FaSpeakap,
  FaTrophy,
  FaUser,
  FaWallet
} from "react-icons/fa";
import { useAccount } from "wagmi";
import "../../styles/fonts.css";
import LoginModal from "../Hive/Login/LoginModal";
import CommunityTotalPayout from "../communityTotalPayout";
// import checkRewards from "./utils/checkReward";
import { useLastAuction } from "@/hooks/auction";
import { useIsClient } from "@/hooks/useIsClient";
import Confetti from 'react-confetti';
import { FormattedAddress } from "../NNSAddress";
import { claimRewards } from "./utils/claimRewards";
import { FaRankingStar } from "react-icons/fa6";
import type { Image as ChakraImage } from "@chakra-ui/react";

const blink = keyframes`
  0% { color: gold; opacity: 1; }
  50% { opacity: 0.1; }
  100% { opacity: 1; }
`;

interface Asset {
  toString(): string;
}

const SidebarDesktop = () => {
  const isClient = useIsClient();
  const user = useHiveUser();
  const hiveUser = user.hiveUser;
  const ethAccount = useAccount();
  const { openConnectModal } = useConnectModal();
  const { openAccountModal } = useAccountModal();
  const [hiveAccount, setHiveAccount] = useState<HiveAccount>();
  const [globalProps, setGlobalProps] = useState<any>(null); // Store global props
  const [showConfetti, setShowConfetti] = useState(false);
  const toast = useToast();
  const { data: activeAuction } = useLastAuction();
  const [imageLoaded, setImageLoaded] = useState(false);

  const client = HiveClient;

  useEffect(() => {
    const fetchGlobalProps = async () => {
      try {
        const props = await client.database.getDynamicGlobalProperties();
        setGlobalProps(props);
      } catch (error) {
        console.error("Failed to fetch global properties:", error);
      }
    };

    fetchGlobalProps();
  }, []);

  useEffect(() => {
    if (hiveUser?.name) {
      const getUserAccount = async () => {
        try {
          const userAccount = await client.database.getAccounts([hiveUser.name]);
          if (userAccount.length > 0) {
            const account = userAccount[0];

            const getBalance = (balance: string | Asset): number => {
              const balanceStr = typeof balance === "string" ? balance : balance.toString();
              return Number(balanceStr.split(" ")[0]);
            };

            const hbdBalance = getBalance(account.reward_hbd_balance);
            const hiveBalance = getBalance(account.reward_hive_balance);
            const vestingHive = getBalance(account.reward_vesting_hive);

            const hasRewards = hbdBalance > 0 || hiveBalance > 0 || vestingHive > 0;
            setHiveAccount(userAccount[0]);
            setHasRewards(hasRewards);
          }
        } catch (error) {
          console.error("Failed to fetch user account", error);
        }
      };

      getUserAccount();
    }
  }, [hiveUser?.name]);

  useEffect(() => {
    if (activeAuction?.token?.image) {
      const img = new window.Image();
      img.src = activeAuction.token.image;
      img.onload = () => setImageLoaded(true);
    }
  }, [activeAuction?.token?.image]);

  const {
    isOpen: isLoginOpen,
    onOpen: onLoginOpen,
    onClose: onLoginClose,
  } = useDisclosure();


  const [hasRewards, setHasRewards] = useState(false);

  const handleClaimRewards = async () => {
    if (hiveAccount && globalProps) {
      const { reward_hive_balance, reward_hbd_balance, reward_vesting_balance } = hiveAccount;

      try {
        const totalVestingShares = parseFloat(globalProps.total_vesting_shares.split(" ")[0]);
        const totalVestingFundHive = parseFloat(globalProps.total_vesting_fund_hive.split(" ")[0]);

        // Convert reward_vesting_balance to Hive Power
        const vestingShares = parseFloat(reward_vesting_balance.toString().split(" ")[0]);
        const hivePower = (vestingShares / totalVestingShares) * totalVestingFundHive;

        // Claim rewards
        await claimRewards(hiveAccount);

        // Reset rewards state
        setHasRewards(false);

        // Display a success toast with the claimed amounts
        toast({
          title: "Rewards Claimed!",
          description: `You claimed ${reward_hive_balance}, ${reward_hbd_balance}, and ${hivePower.toFixed(3)} HP.`,
          status: "success",
          duration: 5000,
          isClosable: true,
        });

        // Show confetti
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 7000);
      } catch (error) {
        console.error("Failed to claim rewards:", error);

        // Display an error toast
        toast({
          title: "Error Claiming Rewards",
          description: "There was an issue claiming your rewards. Please try again.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    }
  };

  const handleClick = () => {
    const url = "https://discord.gg/G4bamNkZuE";
    if (/Mobi|Android/i.test(navigator.userAgent)) {
      // For mobile devices, use the Discord URL scheme to open the app
      window.location.href = url;
    } else {
      // For desktop, open in a new tab
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  if (!isClient) return null;

  return (
    <>
      {showConfetti && <Confetti />}

      <LoginModal isOpen={isLoginOpen} onClose={onLoginClose} />
      <Box
        bg="Black"
        w={{ base: "full", md: 240 }}
        px={2}
        py={8}
        h="100vh"
        display="flex"
        flexDirection="column"
        color={"white"}
        fontSize={"20px"}
      >
        <Link href={`https://nouns.build/dao/base/${activeAuction?.token?.tokenContract}`} passHref target="_blank" rel="noopener noreferrer">
          <Skeleton isLoaded={imageLoaded} bg={"green.200"} borderRadius={"5px"}>
            <Image
              width={"48px"}
              height={"auto"}
              src={"/SKATE_HIVE_VECTOR_FIN.svg"}
              alt="SkateHive"
              _hover={{
                cursor: "pointer",
                transform: "scale(1.03)",
                zIndex: 1,
                content: `url(${activeAuction?.token?.image || "/SKATE_HIVE_VECTOR_FIN_HOVER.svg"})`,
              }}
              transition="transform 0.3s ease-out"
              minW={"100%"}
              h={"auto"}
            />
          </Skeleton>
        </Link>
        <Divider
          my={4}
          style={{ color: "#A5D6A7", borderColor: "#A5D6A7" }}
        />
        <CommunityTotalPayout />

        <HStack padding={0} mt={8} gap={3}>
          <FaSpeakap color="white" size={"22px"} />
          <Text fontFamily="Joystix" color={"white"} cursor={"pointer"} _hover={{ color: 'lime' }} onClick={() => {
            window.location.href = "/";
          }}>Feed</Text>
        </HStack>
        {/* <HStack gap={3}>
          <ImProfile color="white" size={"22px"} />
          <Text fontFamily="Joystix" color={"white"} cursor={"pointer"} _hover={{ color: 'lime' }} onClick={() => {
            window.location.href = "/leaderboard";
          }}>ProfileHive</Text>
        </HStack> */}
        <HStack padding={0} gap={3} >
          <FaMapMarkerAlt color="white" size={"22px"} />
          <Text fontFamily="Joystix" color={"white"} cursor={"pointer"} _hover={{ color: 'lime' }} onClick={() => {
            window.location.href = "/map";
          }}>Map</Text>
        </HStack>
        <HStack padding={0} gap={3} >
          <FaBook color="white" size={"22px"} />
          <Text fontFamily="Joystix" color={"white"} cursor={"pointer"} _hover={{ color: 'lime' }} onClick={() => {
            window.location.href = "/mag";
          }}>Magazine</Text>
        </HStack>
        <HStack padding={0} gap={3} >
          <FaEthereum color={'white'} size={"22px"} />
          <Text fontFamily="Joystix" color={"white"} cursor={"pointer"} _hover={{ color: 'lime' }} onClick={() => {
            window.location.href = "/dao";
          }}>Dao</Text>
        </HStack>
        <HStack padding={0} gap={3} >
          <FaTrophy color={'white'} size={"22px"} />
          <Text fontFamily="Joystix" color={"white"} cursor={"pointer"} _hover={{ color: 'lime' }} onClick={() => {
            window.location.href = "/leaderboard";
          }}>Ranking</Text>
        </HStack>
        {hiveUser ? (
          <>
            <HStack padding={0} gap={3}>
              <FaUser color="white" size={"22px"} />
              <Text fontFamily="Joystix" color={"white"} cursor={"pointer"} _hover={{ color: 'lime' }} onClick={() => {
                window.location.href = `/profile/${hiveUser.name}`;
              }}>Profile</Text>
            </HStack>
            <HStack padding={0} gap={3} _hover={{ color: 'lime' }}>
              <FaWallet color="white" size={"22px"} />
              <Text fontFamily="Joystix" color={"white"} cursor={"pointer"} _hover={{ color: 'lime' }} onClick={() => {
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
                  border={"1px dashed black"}
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

            {!hiveUser &&
              <HStack padding={0} gap={3}>
                <FaDiscord size={"22px"} />
                <Text
                  fontFamily="Joystix"
                  color={"white"}
                  cursor={"pointer"}
                  _hover={{ color: 'lime' }}
                  onClick={handleClick}
                >
                  Chat
                </Text>
              </HStack>
            }


            {/* <HStack
              cursor={"pointer"}
              onClick={handleNotifications}
              padding={0}
              gap={3}
              fontSize={"22px"}
            >
              <FaBell size={"22px"} />
              <Text fontFamily="Joystix" color={"white"} _hover={{ color: 'lime' }}>Notifications</Text>
            </HStack>
            {notifications ? <NotificationsPage /> : null} */}
          </>
        ) : null}
        <VStack mt="auto">
          <Button
            justifyContent={"center"}
            fontSize={"14px"}
            variant={"outline"}
            borderColor={"red.400"}
            width={"100%"}
            color={"white"}
            bg="black"
            _hover={{ bg: "red.400", color: "black" }}
            leftIcon={
              <Icon color={hiveUser ? "red.200" : "white"} as={FaHive} />
            }
            onClick={() => onLoginOpen()}
          >
            {hiveUser ? <p>{hiveUser.name}</p> : <span>Login with Hive</span>}
          </Button>
          <Button
            justifyContent={"center"}
            fontSize={"14px"}
            variant={"outline"}
            borderColor={"blue.400"}
            width={"100%"}
            bg="black"
            color={"white"}
            _hover={{ bg: "blue.400", color: "black" }}
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
              <FormattedAddress address={ethAccount.address} />
            ) : (
              <span>Connect with Ethereum</span>
            )}
          </Button>
        </VStack>
      </Box>
    </>
  );
};

export default SidebarDesktop;