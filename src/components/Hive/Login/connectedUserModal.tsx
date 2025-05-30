"use client"

import EditInfoModal from "@/components/Profile/EditInfoModal"
import { useUserData } from "@/contexts/UserContext"
// import { updateProfile } from "@/lib/hive/client-functions"
import useAuthHiveUser from "@/lib/useHiveAuth"
import {
    Center, ModalBody, ModalCloseButton, ModalFooter, ModalHeader, VStack, HStack,
    Heading, Text, UnorderedList, ListItem, Link,
    Button
} from "@chakra-ui/react"
import { useState } from "react"
import { FaRocket, FaHourglassHalf, FaBug } from "react-icons/fa" // added react icons

function ConnectedUserModal({ onClose }: { onClose: () => void }) {
    const hiveUser = useUserData()
    const { logout } = useAuthHiveUser()

    const [isEditInfoModalOpen, setIsEditInfoModalOpen] = useState(false)

    const metadata = hiveUser?.json_metadata

    if (!hiveUser) {
        return null // or handle the case when hiveUser is null
    }

    return (
        <>
            {isEditInfoModalOpen && (
                <EditInfoModal
                    user={hiveUser}
                    isOpen={isEditInfoModalOpen}
                    onClose={() => setIsEditInfoModalOpen(false)}
                    onUpdate={() => window.location.reload()}
                />
            )}
            <ModalHeader>
                <Center>Wassup Weirdo!</Center>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
                <VStack spacing={4} align="start">
                    <Text>
                        Everyday skaters around the globe are building up this platform
                        and making our community stronger. Be sure to check out <Link color={"yellow"} href="https://docs.skatehive.app/docs/intro" isExternal>docs.skatehive.app </Link>
                        to learn how this shit works, invite friends, and discover skatehive hidden fatures!
                    </Text>
                    <Heading as="h2" size="md">
                        <HStack spacing={2}>
                            <FaRocket />
                            <Text as="span">Latest Features and News</Text>
                        </HStack>
                    </Heading>
                    <UnorderedList>
                        <ListItem>Skatehive <Link color={"yellow"} href="https://skatehive.app/leaderboard" isExternal>Leaderboard</Link></ListItem>
                        <ListItem>Finally a Follow Button in MainFeed</ListItem>
                        <ListItem>We have a newsletter, make sure to put your email <Link color={"yellow"} href="https://paragraph.xyz/@skatehive" isExternal>in that shit</Link> </ListItem>
                        <ListItem>Support for Luganda Language in the docs</ListItem>
                    </UnorderedList>
                </VStack>
            </ModalBody>
            <ModalFooter gap={2} justifyContent={"space-between"}>
                <Button onClick={logout} colorScheme="red" size="lg">
                    Log out
                </Button>
                <Button onClick={onClose} colorScheme="green" size="lg">
                    Shut up, go to app!
                </Button>

            </ModalFooter>
        </>
    )
}

export default ConnectedUserModal
