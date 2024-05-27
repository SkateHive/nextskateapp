'use client'

import { HiveAccount } from "@/lib/models/user"
import { Avatar, Button, HStack, Image, Text, VStack, useDisclosure } from "@chakra-ui/react"
import { getReputation } from "@/lib/hive/client-functions"
import EditInfoModal from "./EditInfoModal"
import { FaGear } from "react-icons/fa6"
import { useHiveUser } from "@/contexts/UserContext"

interface ProfileProps {
  user: HiveAccount
}

export default function ProfileHeader({ user }: ProfileProps) {
  //console.log(user, "here")
  //const user = new UserModel(userData)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const hiveUser = useHiveUser()
  const metadata = JSON.parse(hiveUser.hiveUser?.json_metadata || "{}")
  return (
    <VStack align={"start"}>
      {isOpen && <EditInfoModal isOpen={isOpen} onClose={onClose} user={user} />}
      <Image
        w="100%"
        src={metadata?.profile?.cover_image || "https://i.pinimg.com/originals/4b/c7/91/4bc7917beb4aac43d2d405b05911e35f.gif"}
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
          src={metadata?.profile?.profile_image || "/loading.gif"}
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
            {metadata?.profile?.name}
            {/* {getReputation(Number(hiveUser.hiveUser?.name))} */}
            <br />
            {metadata?.profile?.about}<br />
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
