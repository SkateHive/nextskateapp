'use client'

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
  const { hiveAccount } = useHiveAccount(params.username)
  if (!hiveAccount) return <Box w={"100%"}>
    <Center>

      Loading...
    </Center>
  </Box>
  return (
    <Box h={'101vh'} color={"white"} w={{ base: "100%", lg: "80%" }}
    >
      <ProfileHeader user={hiveAccount} />
      <ProfileTabs user={hiveAccount} />
    </Box>
  )
}
