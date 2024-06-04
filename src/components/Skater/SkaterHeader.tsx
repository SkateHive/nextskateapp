'use client'

import { useHiveUser } from "@/contexts/UserContext"
import { HiveAccount } from "@/lib/models/user"
import { Box, HStack, Image, Text, VStack, useDisclosure, useMediaQuery } from "@chakra-ui/react"
import { useEffect, useState } from "react"
import { FaGear } from "react-icons/fa6"
import AuthorAvatar from "../AuthorAvatar"
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
    const profileName = metadata?.profile?.name || user.name;
    const [isSmallerThan400] = useMediaQuery("(max-width: 400px)");
    const [boxSize, setBoxSize] = useState(20)
    // if mobile show smaller image
    useEffect(() => {
        if (isSmallerThan400) {
            setBoxSize(20)
        }
        else {
            setBoxSize(40)
        }
    }, [isSmallerThan400])

    return (
        <VStack align={"center"}>
            <Image
                mt={10}
                w="100%"
                src={coverImageUrl}
                objectFit="fill"
                borderRadius="md"
                alt={"Profile thumbnail"}
                loading="lazy"
            />
            <Box mt={-20}>
                <AuthorAvatar username={user.name} boxSize={boxSize} borderRadius={5} />
            </Box>

            <HStack align={"flex-start"} >
                <Text top={5} fontSize={{ base: "sm", lg: "3xl" }} fontWeight={"bold"}>
                    {profileName} <br />
                </Text>
                {user.name === hiveUser.hiveUser?.name && (
                    <FaGear onClick={onOpen} color="white" size="1em" />
                )}
            </HStack>
        </VStack>
    )
}
