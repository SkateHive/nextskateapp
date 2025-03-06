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
import { useEffect, useRef, useState } from "react"
import { FaCheck, FaHive } from "react-icons/fa"

function DisconnectedUserModal({
    onClose,
    username,
    setUsername,
    doLogin,
    isLogginIn,
    errorMessage,
}: {
    onClose: () => void
    username: string
    setUsername: (username: string) => void
    doLogin: () => void
    isLogginIn: boolean
    errorMessage: string
}) {
    const [isKeychainInstalled, setIsKeychainInstalled] = useState(false)
    const [activeField, setActiveField] = useState<"username" | "privateKey" | null>(null)
    const [isMobile] = useMediaQuery("(max-width: 768px)")
    const usernameRef = useRef<HTMLInputElement>(null)


    useEffect(() => {
        if (window.hive_keychain) {
            setIsKeychainInstalled(true)
        } else {
            setIsKeychainInstalled(false)
        }
    }, [])



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
                            // readOnly={isMobile} // only readOnly on mobile
                            onFocus={() => {
                                if (isMobile) {
                                    setActiveField("username")
                                }
                            }}
                            disabled={!isKeychainInstalled}
                            onChange={(e) => setUsername(e.target.value)} // handle input change for desktop
                        />
                        {!isKeychainInstalled && (
                            <Center>
                                <Text fontSize="xs" color="red.500">
                                    <a href="https://hive-keychain.com/" target="_blank" rel="noopener noreferrer" style={{ color: "yellow" }}>
                                        Install
                                    </a> Hive Keychain to login, learn more <a href="https://docs.skatehive.app/docs/create-account#hive-keychain-options-for-mobile" target="_blank" rel="noopener noreferrer" style={{ color: "yellow" }}>
                                        here
                                    </a>
                                </Text>
                            </Center>
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
                    onClick={() => window.open("https://discord.gg/SAWaRhh", '_blank', 'noopener,noreferrer')}
                    colorScheme="purple"
                    variant={"outline"}
                >
                    Get Help
                </Button>
            </ModalFooter>
        </>
    )
}

export default DisconnectedUserModal
