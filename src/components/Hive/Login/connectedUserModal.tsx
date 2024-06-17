"use client"

import UserAvatar from "@/components/UserAvatar"
import { useHiveUser } from "@/contexts/UserContext"
import useAuthHiveUser from "@/lib/useHiveAuth"
import {
    Button,
    Center,
    HStack,
    ModalBody,
    ModalCloseButton,
    ModalFooter,
    ModalHeader,
    VStack
} from "@chakra-ui/react"
import StepByStep from "./StepByStep"

function ConnectedUserModal({ onClose }: { onClose: () => void }) {
    const { logout } = useAuthHiveUser()
    const { hiveUser } = useHiveUser()

    if (!hiveUser) {
        return null // or handle the case when hiveUser is null
    }
    console.log(hiveUser)
    return (
        <>
            <ModalHeader>
                <Center>Connected as {hiveUser.name}</Center>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
                <VStack align={"normal"}>
                    <HStack>
                        <UserAvatar hiveAccount={hiveUser} borderRadius={5} boxSize={16} />
                        <StepByStep hiveAccount={hiveUser} />
                    </HStack>
                    <Button
                        w={"100%"}
                        onClick={() => {
                            logout()
                            onClose()
                        }}
                        colorScheme="red"
                        variant={"outline"}
                    >
                        Log Out
                    </Button>
                </VStack>
            </ModalBody>
            <ModalFooter></ModalFooter>
        </>
    )
}

export default ConnectedUserModal
