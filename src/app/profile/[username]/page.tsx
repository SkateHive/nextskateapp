'use client';
import ETHprofile from "@/components/Profile/ETHprofile";
import ProfileHeader from "@/components/Profile/ProfileHeader";
import ProfileTabs from "@/components/Profile/profileTabs";
import useHiveAccount from "@/hooks/useHiveAccount";
import { Box, Center } from "@chakra-ui/react";
import { Address } from "viem";

interface ProfilePageProps {
  params: {
    username: string
  }
}

export default function ProfilePage({ params }: ProfilePageProps) {
  const { hiveAccount, error, isLoading } = useHiveAccount(params.username);

  if (params.username.length === 42 && params.username.startsWith("0x")) {
    return (
      <Box w="100%">
        <ETHprofile eth_address={params.username as Address} />
      </Box>
    );
  }

  return (
    <Box
      color={"white"}
      w={{ base: "100%", lg: "55vw" }}
      h={"100vh"}
      overflow={"scroll"}
      id="SkaterPage"
      mt={10}
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
          <ProfileHeader user={hiveAccount} />

          {hiveAccount && <ProfileTabs user={hiveAccount} />}
        </Box>
      ) : (
        error
      )}
    </Box>
  );
}