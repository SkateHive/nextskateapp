"use client"

import {
    Button,
    Center,
    FormControl,
    FormErrorMessage,
    Image,
    Input,
    ModalBody,
    ModalCloseButton,
    ModalFooter,
    ModalHeader,
    Spinner,
    Text,
    VStack
} from "@chakra-ui/react"
import { useEffect, useState } from "react"
import { FaHive } from "react-icons/fa"

function DisconnectedUserModal({
    onClose,
    username,
    setUsername,
    privateKey,
    setPrivateKey,
    doLogin,
    isLogginIn,
    errorMessage,
}: {
    onClose: () => void
    username: string
    setUsername: (username: string) => void
    privateKey: string
    setPrivateKey: (privateKey: string) => void
    doLogin: () => void
    isLogginIn: boolean
    errorMessage: string
}) {
    const [isKeychainInstalled, setIsKeychainInstalled] = useState(false)

    useEffect(() => {
        if (window.hive_keychain) {
            setIsKeychainInstalled(true)
        } else {
            setIsKeychainInstalled(false)
        }
    }, [])

    const handleKeyDown = (event: any) => {
        if (event.key === "Enter") {
            doLogin()
        }
    }

    return (
        <>
            <ModalHeader>
                <Center>
                    <Text mr={2}>Connect with HIVE </Text>
                    <FaHive color="red" />
                </Center>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
                <Image mb={2} src="/pepe-login.png" alt="Hive Logo" />
                <FormControl isInvalid={Boolean(errorMessage)}>
                    <VStack align={"normal"}>
                        <Input
                            borderColor={"green.600"}
                            color={"#A5D6A7"}
                            _placeholder={{ color: "#A5D6A7", opacity: 0.4 }}
                            focusBorderColor="#A5D6A7"
                            placeholder="Hive Username"
                            onChange={(event) => setUsername(event.target.value.toLowerCase())}
                            onKeyDown={handleKeyDown}
                        />
                        {!isKeychainInstalled && (
                            <Input
                                type="password"
                                borderColor={"green.600"}
                                color={"#A5D6A7"}
                                _placeholder={{ color: "#A5D6A7", opacity: 0.4 }}
                                focusBorderColor="#A5D6A7"
                                placeholder="Password"
                                onChange={(event1) => setPrivateKey(event1.target.value)}
                            />
                        )}
                    </VStack>
                    {Boolean(errorMessage) && (
                        <FormErrorMessage>{errorMessage}</FormErrorMessage>
                    )}
                </FormControl>
            </ModalBody>
            <ModalFooter>
                <Button
                    w={"100%"}
                    onClick={() => doLogin()}
                    colorScheme="green"
                    variant={"outline"}
                    disabled={isLogginIn}
                >
                    {isLogginIn ? <Spinner size={"sm"} /> : "Log In"}
                </Button>
                <Button
                    w={"100%"}
                    onClick={() => window.open("https://hiveonboard.com/create-account")}
                    colorScheme="blue"
                    variant={"outline"}
                >
                    Sign Up
                </Button>
            </ModalFooter>
        </>
    )
}

export default DisconnectedUserModal
