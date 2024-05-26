'use client'

import { HiveAccount } from "@/lib/models/user"
import { Avatar, Button, HStack, Image, Text, VStack, useDisclosure } from "@chakra-ui/react"
import { getReputation } from "@/lib/hive/client-functions"
import { FaGear } from "react-icons/fa6"
import { useHiveUser } from "@/contexts/UserContext"

interface ProfileProps {
    user: HiveAccount
}

export default function ProfileHeader({ user }: ProfileProps) {
    console.log(user, "here")
    const { isOpen, onOpen, onClose } = useDisclosure()
    const hiveUser = useHiveUser()
    const metadata = JSON.parse(user.json_metadata)
    console.log(metadata, "metadata")
    return (
        <VStack align={"start"}>
            <Image
                w="100%"
                src={metadata?.profile.cover_image || "https://storage.googleapis.com/zapper-fi-assets/nfts/medias/07b1116b23c5da3851fee73002dc1b049c90c5f7dfa54d2ba14a562b38023ed0.svg"}
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
                    src={metadata?.profile.profile_image}
                    size={{ base: "xl", lg: "2xl" }}
                    showBorder={true}
                />
                {user.name === hiveUser.hiveUser?.name && (
                    <VStack ml={-10} mt={1} zIndex={1}>
                        <FaGear onClick={onOpen} color="white" size="2em" />
                    </VStack>
                )}
                <VStack align={"flex-start"} gap={0}>
                    <Text fontSize={{ base: "sm", lg: "xl" }} fontWeight={"bold"}>
                        {metadata?.profile.name} {getReputation(Number(user.reputation))}<br />
                        <br />
                        {/* {user.metadata?.about}<br />
            {user.metadata?.location} */}
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
