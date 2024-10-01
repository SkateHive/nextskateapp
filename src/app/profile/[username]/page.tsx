'use client'

import ETHprofile from "@/components/Profile/ETHprofile";
// import ProfileHeader from "@/components/Profile/ProfileHeader";
import ProfileTabs from "@/components/Profile/profileTabs";
import useHiveAccount from "@/hooks/useHiveAccount";
import { Box, Center } from "@chakra-ui/react";
import { useState, useEffect } from 'react';

interface ProfilePageProps {
  params: {
    username: string
  }
}

export default function ProfilePage({ params }: ProfilePageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const { hiveAccount, error } = useHiveAccount(params.username);

  useEffect(() => {
    setIsLoading(false);
  }, [hiveAccount]);

  if (params.username.length === 42 && params.username.startsWith("0x")) {
    return (
      <Box w="100%">
        <ETHprofile eth_address={params.username} />
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
      {(isLoading) ? (
        <Center>
          Loading...
        </Center>
      ) : error != null ? (
        <Center>
          Error: {error}
        </Center>
      ) : hiveAccount ? (
        <Box>
          {hiveAccount && <ProfileTabs user={hiveAccount} />}
        </Box>
      ) : (
        error
      )}
    </Box>
  );
}