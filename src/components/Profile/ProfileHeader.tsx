'use client'

import { useHiveUser } from "@/contexts/UserContext"
import { HiveAccount } from "@/lib/models/user"
import { Center, HStack, Image, Text, VStack, useDisclosure } from "@chakra-ui/react"
import { FaPencil } from "react-icons/fa6"
import AuthorAvatar from "../AuthorAvatar"
import EditInfoModal from "./EditInfoModal"

interface ProfileProps {
  user: HiveAccount
}

export default function ProfileHeader({ user }: ProfileProps) {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const hiveUser = useHiveUser()
  const metadata = JSON.parse(user.posting_json_metadata).profile ? JSON.parse(user.posting_json_metadata) : (user.json_metadata ? JSON.parse(user.json_metadata) : {});

  //let metadata = JSON.parse(user.posting_json_metadata)
  //if (!metadata.profile) {
  //  metadata = JSON.parse(user.json_metadata)
  //}

  const coverImageUrl = metadata?.profile.cover_image || "https://i.pinimg.com/originals/4b/c7/91/4bc7917beb4aac43d2d405b05911e35f.gif"
  const profileImageUrl = metadata?.profile.profile_image || "/loading.gif"
  const profileName = metadata?.profile.name || user.name
  const profileAbout = metadata?.profile.about || "No bio available"


  return (
    <VStack >
      {isOpen && <EditInfoModal isOpen={isOpen} onClose={onClose} user={user} />}
      <Image
        w={{ base: "100%", lg: "80%" }}
        src={coverImageUrl}
        height={"200px"}
        objectFit="cover"
        borderRadius="md"
        alt={"Profile thumbnail"}
        loading="lazy"
        mt={{ base: "0px", lg: 5 }}
        border={"1px solid limegreen"}
      />
      <Center border={"3px solid limegreen"} borderRadius={7} mt={'-80px'}>
        <AuthorAvatar
          username={user.name}
          borderRadius={4}
          hover={{ cursor: "pointer" }}
          boxSize={100}
        />

      </Center>

      <HStack cursor={'pointer'} onClick={onOpen} ml={2} align={"start"}>
        <br />
        <Text mb={3} fontSize={{ base: "sm", lg: "xl" }} fontWeight={"bold"}>
          {profileName}
        </Text>
        {user.name === hiveUser.hiveUser?.name && (

          <FaPencil color="white" size="1em" />
        )}

      </HStack>
    </VStack>
  )
}
