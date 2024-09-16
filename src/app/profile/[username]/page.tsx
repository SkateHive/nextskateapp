'use client'

import ETHprofile from "@/components/Profile/ETHprofile";
import ProfileHeader from "@/components/Profile/ProfileHeader";
import ProfileTabs from "@/components/Profile/profileTabs";
import useHiveAccount from "@/hooks/useHiveAccount";
import { Box, Center } from "@chakra-ui/react";

interface ProfilePageProps {
  params: {
    username: string
  }
}

export default function ProfilePage({ params }: ProfilePageProps) {
  const { hiveAccount } = useHiveAccount(params.username);
  if (params.username.length === 42 && params.username.startsWith("0x")) {
    return (
      <Box w="100%">
        <ETHprofile eth_address={params.username} />
      </Box>
    );
  }

  if (!hiveAccount) {
    return (
      <Box w="100%">
        <Center>
          Account not found
        </Center>
      </Box>
    );
  }


  return (
    <Box
      color={"white"}
      w={"100%"}
      h={"100vh"}
      overflow={"scroll"}
      id="SkaterPage"
      mt={4}
    >
      <ProfileHeader user={hiveAccount} />
      <ProfileTabs user={hiveAccount} />
    </Box>
  );
}
