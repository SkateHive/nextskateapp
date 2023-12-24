"use client"

import UserModel, { UserProps } from "@/lib/models/user"
import { Avatar, HStack, Image, Text, VStack } from "@chakra-ui/react"

interface ProfileProps {
  userData: UserProps
}

export default function ProfileHeader({ userData }: ProfileProps) {
  const user = new UserModel(userData)

  return (
    <VStack align={"start"}>
      <Image
        w="100%"
        src={user.metadata?.profile.cover_image}
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
          src={user.metadata?.profile.profile_image}
          size={{ base: "xl", lg: "2xl" }}
          showBorder={true}
        />
        <VStack align={"flex-start"} gap={0}>
          <Text fontSize={{ base: "md", lg: "xl" }} fontWeight={"bold"}>
            @{user.name}
          </Text>
          <Text fontSize={"xs"} w={"100%"} noOfLines={3}>
            {user.metadata?.profile.about}
          </Text>
        </VStack>
      </HStack>
    </VStack>
  )
}
