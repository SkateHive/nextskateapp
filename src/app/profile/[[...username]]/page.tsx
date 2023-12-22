"use client"

import { useHiveUser } from "@/contexts/UserContext"
import HiveClient from "@/lib/hiveclient"
import { HiveAccount } from "@/lib/useHiveAuth"
import {
  Avatar,
  Container,
  HStack,
  Image,
  Text,
  VStack,
} from "@chakra-ui/react"
import { useCallback, useEffect, useState } from "react"

async function getUserData(username: string) {
  const client = HiveClient()
  const userData = await client.database.getAccounts([username])
  if (Array.isArray(userData) && userData.length > 0) return userData[0]
  return {} as HiveAccount
}

export default function ProfilePage({
  params,
}: {
  params: { username: string }
}) {
  const [profile, setProfile] = useState<HiveAccount | null>()
  const { hiveUser, isLoading } = useHiveUser()

  const getProfile = useCallback(async () => {
    let userData: HiveAccount = {} as HiveAccount
    if (Array.isArray(params.username) && params.username.length > 0) {
      userData = await getUserData(params.username[0])
    } else if (!isLoading && hiveUser) {
      userData = hiveUser
    }
    userData.metadata = JSON.parse(userData.posting_json_metadata)
    console.log(userData.metadata?.profile)
    setProfile(userData)
  }, [hiveUser, isLoading, params.username])

  useEffect(() => {
    getProfile()
  }, [getProfile])

  if (!profile) return <Text>No Profile</Text>

  return (
    <VStack align={"start"}>
      <Image
        w="100%"
        src={profile?.metadata && profile?.metadata?.profile.cover_image}
        height={"200px"}
        objectFit="cover"
        borderRadius="md"
        alt={"Profile thumbnail"}
        loading="lazy"
      />
      <Container>
        <HStack align={"start"}>
          <Avatar
            mt={-12}
            name={profile.name}
            src={profile.metadata?.profile.profile_image}
            size="2xl"
            showBorder={true}
          />
          <VStack align={"flex-start"} gap={0}>
            <Text fontSize={"xl"} fontWeight={"bold"}>
              @{profile.name}
            </Text>
            <Text fontSize={"xs"} w={"100%"} noOfLines={3}>
              {profile?.metadata?.profile.about}
            </Text>
          </VStack>
        </HStack>
      </Container>
    </VStack>
  )
}
