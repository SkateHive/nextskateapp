"use client"

import { HiveAccount } from "@/lib/models/user"
import { Avatar, HStack, Image, Text, VStack } from "@chakra-ui/react"
//import { getUserAccount } from "@/lib/hive/client-functions"

interface ProfileProps {
  user: HiveAccount
}

export default function ProfileHeader( { user } : ProfileProps) {
  //const user = new UserModel(userData)

  return (
    <VStack align={"start"}>
      <Image
        w="100%"
        src={user.metadata?.profile?.cover_image || "https://storage.googleapis.com/zapper-fi-assets/nfts/medias/07b1116b23c5da3851fee73002dc1b049c90c5f7dfa54d2ba14a562b38023ed0.svg"}
        height={"200px"}
        objectFit="cover"
        borderRadius="md"
        alt={"Profile thumbnail"}
        loading="lazy"
      />
      <HStack ml={2} align={"start"}>
        <Avatar
          mt={-12}
          name={user.name}
          src={user.metadata?.profile?.profile_image}
          size={{ base: "xl", lg: "2xl" }}
          showBorder={true}
        />
        <VStack align={"flex-start"} gap={0}>
          <Text fontSize={{ base: "md", lg: "xl" }} fontWeight={"bold"}>
            @{user.name}
          </Text>
          {/* <Text fontSize={"xs"} w={"100%"} noOfLines={3}>
            {user.metadata?.profile?.about || "No bio available"}
          </Text> */}
        </VStack>
      </HStack>
    </VStack>
  )
}
