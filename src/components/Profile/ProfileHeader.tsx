'use client'

import { useHiveUser } from "@/contexts/UserContext"
import { HiveAccount } from "@/lib/models/user"
import { HStack, Text, VStack, useDisclosure } from "@chakra-ui/react"
import { FaPencil } from "react-icons/fa6"
import EditInfoModal from "./EditInfoModal"

interface ProfileProps {
  user: HiveAccount
}

export default function ProfileHeader({ user }: ProfileProps) {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const hiveUser = useHiveUser()

  const safeParse = (jsonString: string) => {
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

  return (
    <VStack>
      {isOpen && <EditInfoModal onUpdate={handleProfileUpdate} isOpen={isOpen} onClose={onClose} user={user} />}
      
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
