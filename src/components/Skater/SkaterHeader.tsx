'use client'

import { HiveAccount } from "@/lib/models/user"
import { Avatar, Button, HStack, Image, Text, VStack, useDisclosure } from "@chakra-ui/react"
import { FaGear } from "react-icons/fa6"
import { useHiveUser } from "@/contexts/UserContext"

interface ProfileProps {
    user: HiveAccount
}

export default function SkateHeader({ user }: ProfileProps) {
    const { isOpen, onOpen, onClose } = useDisclosure()
    const hiveUser = useHiveUser()
    console.log(user)
    const metadata = user.json_metadata ? JSON.parse(user.json_metadata) : (user.posting_json_metadata ? JSON.parse(user.posting_json_metadata) : {});

    console.log(metadata)

    const coverImageUrl = metadata?.profile?.cover_image || "https://i.pinimg.com/originals/4b/c7/91/4bc7917beb4aac43d2d405b05911e35f.gif";
    const profileImageUrl = metadata?.profile?.profile_image || "/loading.gif";
    const profileName = metadata?.profile?.name || user.name;

    return (
        <VStack align={"start"}>
            <Image
                w="100%"
                src={coverImageUrl}
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
                    <Text fontSize={{ base: "sm", lg: "xl" }} fontWeight={"bold"}>
                        {profileName} <br />
                    </Text>
                </VStack>
            </HStack>
        </VStack>
    )
}
