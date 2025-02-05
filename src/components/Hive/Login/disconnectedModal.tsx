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
    VStack,
    useMediaQuery
} from "@chakra-ui/react"
import { useEffect, useState, useRef } from "react"
import { FaHive } from "react-icons/fa"
import Keyboard from "../Keyboard"

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
    // New states for custom keyboard
    const [showKeyboard, setShowKeyboard] = useState(false)
    const [activeField, setActiveField] = useState<"username" | "privateKey" | null>(null)
    // New: determine if on mobile device
    const [isMobile] = useMediaQuery("(max-width: 768px)")
    // New: refs for input fields
    const usernameRef = useRef<HTMLInputElement>(null)
    const privateKeyRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (window.hive_keychain) {
            setIsKeychainInstalled(true)
        } else {
            setIsKeychainInstalled(false)
        }
    }, [])

    useEffect(() => {
        if (showKeyboard && activeField === "username" && usernameRef.current) {
            usernameRef.current.focus()
        } else if (showKeyboard && activeField === "privateKey" && privateKeyRef.current) {
            privateKeyRef.current.focus()
        }
    }, [showKeyboard, activeField])

    const handleKeyDown = (event: any) => {
        if (event.key === "Enter") {
            doLogin()
        }
    }

    const handleKeyPress = (key: string) => {
        if (activeField === "username") {
            setUsername(username + key)
        } else if (activeField === "privateKey") {
            setPrivateKey(privateKey + key)
        }
    }

    const handleBackspace = () => {
        if (activeField === "username") {
            setUsername(username.slice(0, -1))
        } else if (activeField === "privateKey") {
            setPrivateKey(privateKey.slice(0, -1))
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
                            ref={usernameRef} // attach ref
                            borderColor={"green.600"}
                            color={"#A5D6A7"}
                            _placeholder={{ color: "#A5D6A7", opacity: 0.4 }}
                            focusBorderColor="#A5D6A7"
                            placeholder="Hive Username"
                            value={username}
                            readOnly={isMobile} // only readOnly on mobile
                            onFocus={() => {
                                if (isMobile) {
                                    setActiveField("username")
                                    setShowKeyboard(true)
                                }
                            }}
                            onChange={(e) => setUsername(e.target.value)} // handle input change for desktop
                            onKeyDown={handleKeyDown}
                        />
                        {!isKeychainInstalled && (
                            <Input
                                ref={privateKeyRef} // attach ref
                                type="password"
                                borderColor={"green.600"}
                                color={"#A5D6A7"}
                                _placeholder={{ color: "#A5D6A7", opacity: 0.4 }}
                                focusBorderColor="#A5D6A7"
                                placeholder="Password"
                                value={privateKey}
                                readOnly={isMobile} // only readOnly on mobile
                                onFocus={() => {
                                    if (isMobile) {
                                        setActiveField("privateKey")
                                        setShowKeyboard(true)
                                    }
                                }}
                                onChange={(e) => setPrivateKey(e.target.value)} // handle input change for desktop
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
                    color="limgreen"
                    variant={"outline"}
                    disabled={isLogginIn}
                    _hover={{ bg: "green.600", color: "white" }}
                >
                    {isLogginIn ? <Spinner size={"sm"} /> : "Log In"}
                </Button>
                <Button
                    w={"50%"}
                    onClick={() => window.open("https://discord.gg/skateboard", '_blank', 'noopener,noreferrer')}
                    colorScheme="purple"
                    variant={"outline"}
                >
                    Get Help
                </Button>
            </ModalFooter>
            {isMobile && showKeyboard && (
                <Keyboard
                    onKeyPress={handleKeyPress}
                    onBackspace={handleBackspace}
                    onClose={() => setShowKeyboard(false)}
                    isActive={showKeyboard}
                />
            )}
        </>
    )
}

export default DisconnectedUserModal
