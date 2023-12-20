"use client"

import { useHiveUser } from "@/contexts/UserContext"
import { HiveAccount } from "@/lib/useHiveAuth"
import { Avatar, Flex, Text } from "@chakra-ui/react"
import { useCallback, useEffect, useState } from "react"

export default function ProfilePage() {
  const [profile, setProfile] = useState<HiveAccount | null>()
  const { hiveUser, isLoading } = useHiveUser()

  const getProfile = useCallback(async () => {
    setProfile(hiveUser)
  }, [hiveUser])

  useEffect(() => {
    getProfile()
  }, [isLoading])

  if (!profile) return <Text>No Profile</Text>

  return (
    <Flex
      w={"100%"}
      align={"center"}
      justifyContent={"center"}
      direction={"column"}
      mt={12}
    >
      <Avatar
        name={profile.name}
        src={profile.metadata?.profile.profile_image}
        borderRadius={"100%"}
        size="md"
      />
      <Text fontSize={"2xl"} fontWeight={"bolder"}>
        {profile.name}
      </Text>
    </Flex>
  )
}
