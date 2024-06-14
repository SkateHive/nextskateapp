'use client'

import { useHiveUser } from "@/contexts/UserContext"
import { HiveAccount } from "@/lib/models/user"
import { Button, Center, Flex, HStack, Image, Text, VStack, useDisclosure, useMediaQuery } from "@chakra-ui/react"
import { useEffect, useState } from "react"
import AuthorAvatar from "../AuthorAvatar"
interface ProfileProps {
    user: HiveAccount
}

export default function SkaterHeader({ user }: ProfileProps) {
    const { isOpen, onOpen, onClose } = useDisclosure()
    const hiveUser = useHiveUser()
    const metadata = user.json_metadata ? JSON.parse(user.json_metadata) : (user.posting_json_metadata ? JSON.parse(user.posting_json_metadata) : {});
    const isMobile = useMediaQuery("(max-width: 400px)")[0];

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
        <>

            <VStack align={"center"} mb={"-40px"}>
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


                </HStack>


            </VStack>

            {isMobile ? null :
                <Flex justifyContent={"flex-end"}>
                    <Button mt={"-85px"} mr={'15px'} mb={"75px"}
                        variant={"outline"}
                        colorScheme="green"
                        _hover={{ bg: "black", color: 'white' }}
                    >
                        Follow
                    </Button>
                </Flex >
            }

        </>
    )
}
