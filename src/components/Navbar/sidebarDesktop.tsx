"use client";
import { useHiveUser } from "@/contexts/UserContext";
import {
  Box,
  Button,
  Divider,
  HStack,
  Icon,
  Image,
  Text,
  VStack,
  useDisclosure,
} from "@chakra-ui/react";
import { useAccountModal, useConnectModal } from "@rainbow-me/rainbowkit";
import { useRouter } from "next/navigation";
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
import { useLastAuction } from "@/hooks/auction";
import { FormattedAddress } from "../NNSAddress";
import React from "react";
import ClaimRewardsButton from "./ClaimRewardsButton";

const SidebarDesktop = () => {
  const user = useHiveUser();
  const hiveUser = user.hiveUser;
  const ethAccount = useAccount();
  const { openConnectModal } = useConnectModal();
  const { openAccountModal } = useAccountModal();
  const { data: activeAuction } = useLastAuction();
  const router = useRouter();

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
    { icon: FaTrophy, label: "Ranking", path: "/leaderboard" },
  ];

  const conditionalItems = [
    { icon: FaUser, label: "Profile", path: `/profile/${hiveUser?.name}`, condition: hiveUser },
    { icon: FaDiscord, label: "Chat", path: "https://discord.gg/G4bamNkZuE", condition: !hiveUser },
  ];

  const hasRewards = hiveUser && (
    parseFloat(hiveUser.reward_hbd_balance.toString()) > 0 ||
    parseFloat(hiveUser.reward_hive_balance.toString()) > 0 ||
    parseFloat(hiveUser.reward_vesting_balance.toString()) > 0
  );

  return (
    <>
      <LoginModal isOpen={isLoginOpen} onClose={onLoginClose} />
      <Box
        w={{ base: "full", md: 240 }}
        px={2}
        py={8}
        h="100vh"
        display="flex"
        flexDirection="column"
        color={"white"}
        fontSize={"20px"}
      >
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
          onClick={() => router.push(`https://nouns.build/dao/base/${activeAuction?.token?.tokenContract}`)}
        />
        <Divider
          my={4}
          style={{ color: "#A5D6A7", borderColor: "#A5D6A7" }}
        />
        <CommunityTotalPayout />

        {menuItems.map((item) => (
          <HStack key={item.label} padding={0} gap={3}>
            <item.icon color="white" size={"22px"} />
            <Text fontFamily="Joystix" color={"white"} cursor={"pointer"} _hover={{ color: 'lime' }} onClick={() => router.push(item.path)}>
              {item.label}
            </Text>
          </HStack>
        ))}

        {conditionalItems.map((item) => item.condition && (
          <HStack key={item.label} padding={0} gap={3}>
            <item.icon color="white" size={"22px"} />
            <Text fontFamily="Joystix" color={"white"} cursor={"pointer"} _hover={{ color: 'lime' }} onClick={() => router.push(item.path)}>
              {item.label}
            </Text>
          </HStack>
        ))}

        {hiveUser && (
          <HStack padding={0} gap={3} _hover={{ color: 'lime' }}>
            <FaWallet color="white" size={"22px"} />
            <Text fontFamily="Joystix" color={"white"} cursor={"pointer"} _hover={{ color: 'lime' }} onClick={() => {
              router.push(`/wallet`);
            }}>Wallet</Text>
            {hasRewards && (
              <ClaimRewardsButton
                hiveAccount={hiveUser}
              />
            )}
          </HStack>
        )}

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