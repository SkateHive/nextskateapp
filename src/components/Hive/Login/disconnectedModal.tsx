import {
    Button,
    Center,
    FormControl,
    FormErrorMessage,
    Image,
    Input,
    InputGroup,
    InputRightElement,
    ModalBody,
    ModalCloseButton,
    ModalFooter,
    ModalHeader,
    Spinner,
    Text,
    VStack,
    useMediaQuery
} from "@chakra-ui/react"
import { useEffect, useRef, useState } from "react"
import { FaCheck, FaHive, FaPaste } from "react-icons/fa"
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
    const [showKeyboard, setShowKeyboard] = useState(false)
    const [activeField, setActiveField] = useState<"username" | "privateKey" | null>(null)
    const [isMobile] = useMediaQuery("(max-width: 768px)")
    const usernameRef = useRef<HTMLInputElement>(null)
    const privateKeyRef = useRef<HTMLInputElement>(null)
    const [pasted, setPasted] = useState(false)

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

    const handlePaste = async () => {
        try {
            const text = await navigator.clipboard.readText()
            if (text) {
                setPrivateKey(text)
                setPasted(true)
                setTimeout(() => setPasted(false), 2000)
            }
        } catch (err) {
            console.error("Error pasting:", err)
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
                        />
                        {!isKeychainInstalled && (
                            <InputGroup>
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
                                {isMobile && (
                                    <InputRightElement>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            colorScheme={pasted ? "green" : "gray"}
                                            onClick={handlePaste}
                                        >
                                            {pasted ? <FaCheck /> : <FaPaste />}
                                        </Button>
                                    </InputRightElement>
                                )}
                            </InputGroup>
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
                    onKeyPress={(key) => {
                        if (activeField === "username") {
                            setUsername(username + key)
                        } else if (activeField === "privateKey") {
                            setPrivateKey(privateKey + key)
                        }
                    }}
                    onBackspace={() => {
                        if (activeField === "username") {
                            setUsername(username.slice(0, -1))
                        } else if (activeField === "privateKey") {
                            setPrivateKey(privateKey.slice(0, -1))
                        }
                    }}
                    onClose={() => setShowKeyboard(false)}
                    isActive={showKeyboard}
                />
            )}
        </>
    )
}

export default DisconnectedUserModal
