'use client'

import { HiveAccount } from "@/lib/models/user"
import { Avatar, Button, HStack, Image, Text, VStack, useDisclosure } from "@chakra-ui/react"
import EditInfoModal from "./EditInfoModal"
import { FaGear } from "react-icons/fa6"
import { useHiveUser } from "@/contexts/UserContext"

interface ProfileProps {
  user: HiveAccount
}

export default function ProfileHeader({ user }: ProfileProps) {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const hiveUser = useHiveUser()
  const metadata = hiveUser.hiveUser?.json_metadata ? JSON.parse(hiveUser.hiveUser?.json_metadata) : (hiveUser.hiveUser?.posting_json_metadata ? JSON.parse(hiveUser.hiveUser?.posting_json_metadata) : {});


  const coverImageUrl = metadata?.profile?.cover_image || "https://i.pinimg.com/originals/4b/c7/91/4bc7917beb4aac43d2d405b05911e35f.gif"
  const profileImageUrl = metadata?.profile?.profile_image || "/loading.gif"
  const profileName = metadata?.profile?.name || user.name
  const profileAbout = metadata?.profile?.about || "No bio available"

  return (
    <VStack align={"start"}>
      {isOpen && <EditInfoModal isOpen={isOpen} onClose={onClose} user={user} />}
      <Image
        w="100%"
        src={coverImageUrl}
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
          src={profileImageUrl}
          size={{ base: "xl", lg: "2xl" }}
          showBorder={true}
        />
        {user.name === hiveUser.hiveUser?.name && (
          <VStack ml={-10} mt={1} zIndex={1}>
            <FaGear onClick={onOpen} color="white" size="2em" />
          </VStack>
        )}
        <VStack align={"flex-start"} gap={0}>
          <Text mb={3} fontSize={{ base: "sm", lg: "xl" }} fontWeight={"bold"}>
            {profileName}
            <br />
            {profileAbout}
          </Text>
        </VStack>
      </HStack>
    </VStack>
  )
}
