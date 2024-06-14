'use client'

import ProfileTabs from "@/components/Profile/profileTabs";
import SkaterHeader from "@/components/Skater/SkaterHeader";
import useHiveAccount from "@/hooks/useHiveAccount";
import { Box } from "@chakra-ui/react";

interface ProfilePageProps {
  params: {
    username: string
  }
}

export default function SkaterPage({ params }: ProfilePageProps) {
  const { hiveAccount } = useHiveAccount(params.username)
  if (!hiveAccount) return <Box w={"100%"}>Loading...</Box>
  return (
    <Box color={"white"} w={"100%"}>
      <SkaterHeader user={hiveAccount} />
      <ProfileTabs user={hiveAccount} />
    </Box>
  )
}
