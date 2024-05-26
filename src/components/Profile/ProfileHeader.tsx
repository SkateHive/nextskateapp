"use client"

import { HiveAccount } from "@/lib/models/user"
import { Avatar, Button, HStack, Image, Text, VStack, useDisclosure } from "@chakra-ui/react"
import { getReputation } from "@/lib/hive/client-functions"
import EditInfoModal from "./EditInfoModal"
import { FaGear } from "react-icons/fa6"

interface ProfileProps {
  user: HiveAccount
}

export default function ProfileHeader({ user }: ProfileProps) {
  //console.log(user, "here")
  //const user = new UserModel(userData)
  const { isOpen, onOpen, onClose } = useDisclosure()
  return (
    <VStack align={"start"}>
      {isOpen && <EditInfoModal isOpen={isOpen} onClose={onClose} user={user} />}
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
          mt={-14}
          name={user.name}
          src={user.metadata?.profile?.profile_image}
          size={{ base: "xl", lg: "2xl" }}
          showBorder={true}
        />
        <VStack ml={-10} mt={1} zIndex={1}>
          <FaGear onClick={onOpen} color="white" size="2em" />
        </VStack>
        <VStack align={"flex-start"} gap={0}>
          <Text mt={-12} fontSize={{ base: "sm", lg: "xl" }} fontWeight={"bold"}>
            @{user.name} {getReputation(Number(user.reputation))}<br />
            {user.metadata?.profile?.name}<br />
            {user.metadata?.profile?.about}<br />
            {user.metadata?.profile?.location}
          </Text>
          {/* <Button onClick={onOpen}>edit</Button>*/}
          {/* <Text fontSize={"xs"} w={"100%"} noOfLines={3}>
            {user.metadata?.profile?.about || "No bio available"}
          </Text> */}
        </VStack>
      </HStack>
    </VStack>
  )
}
