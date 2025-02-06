'use client'

import { useHiveUser } from "@/contexts/UserContext"
import { HiveAccount } from "@/lib/useHiveAuth"
import { Center, HStack, Image, Text, VStack, useDisclosure } from "@chakra-ui/react"
import { FaPencil } from "react-icons/fa6"
import EditInfoModal from "./EditInfoModal"
import UserAvatar from "../UserAvatar"

interface ProfileProps {
  user: HiveAccount
}

export default function ProfileHeader({ user }: ProfileProps) {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const hiveUser = useHiveUser()

  const safeParse = (jsonString: string): any => {
    try {
      return JSON.parse(jsonString);
    } catch (error) {
      return null;
    }
  };

  const postingMetadata = safeParse(user.posting_json_metadata);
  const jsonMetadata = safeParse(user.json_metadata);

  const metadata = postingMetadata?.profile ? postingMetadata : (jsonMetadata?.profile ? jsonMetadata : {});

  const profileName = metadata?.profile?.name || user.name

  const handleProfileUpdate = () => {
    // Logic to handle the profile update
    console.log("Profile updated");
  };
  const coverImageUrl = metadata?.profile?.cover_image || "https://i.pinimg.com/originals/4b/c7/91/4bc7917beb4aac43d2d405b05911e35f.gif";

  return (
    <VStack>
      {isOpen && <EditInfoModal onUpdate={handleProfileUpdate} isOpen={isOpen} onClose={onClose} user={user} />}

      <Image
        w={{ base: "100%", lg: "100%" }}
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
        <UserAvatar
          hiveAccount={user}
          borderRadius={4}
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
