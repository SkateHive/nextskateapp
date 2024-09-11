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
    color="white"      
    maxW={{ base: "95%", md: "80%", lg: "1200px" }} 
    p={{ base: 6, md: 2 }}
    gap={{ base: 4, md: 6 }}
      
>
      <ProfileHeader user={hiveAccount} />
      <ProfileTabs user={hiveAccount} />
    </Box>
  );
}
