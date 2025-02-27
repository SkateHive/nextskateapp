import {
    Button,
    Center,
    FormControl,
    FormErrorMessage,
    Image,
    Input,
    InputGroup,
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
    const [activeField, setActiveField] = useState<"username" | "privateKey" | null>(null)
    const [isMobile] = useMediaQuery("(max-width: 768px)")
    const usernameRef = useRef<HTMLInputElement>(null)
    const privateKeyRef = useRef<HTMLInputElement>(null)
    const [pasted, setPasted] = useState(false)
    const [pasteError, setPasteError] = useState(false)

    useEffect(() => {
        if (window.hive_keychain) {
            setIsKeychainInstalled(true)
        } else {
            setIsKeychainInstalled(false)
        }
    }, [])



    const checkClipboardAPI = () => {
        return !!(
            navigator &&
            navigator.clipboard &&
            typeof navigator.clipboard.readText === 'function'
        );
    };

    const handlePaste = () => {
        // Create temporary textarea outside viewport
        const textarea = document.createElement('textarea');
        textarea.style.cssText = 'position:fixed;top:-999px;left:-999px;';
        document.body.appendChild(textarea);

        // Paste without focusing
        const successful = document.execCommand('paste');
        const text = textarea.value;
        document.body.removeChild(textarea);

        if (successful && text) {
            setPrivateKey(text);
            setPasted(true);
            setTimeout(() => setPasted(false), 2000);
        } else {
            setPasteError(true);
            setTimeout(() => setPasteError(false), 2000);
        }
    };

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
                            onChange={(e) => setUsername(e.target.value)} // handle input change for desktop
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
                                // readOnly={isMobile} // only readOnly on mobile
                                onFocus={() => {
                                    if (isMobile) {
                                        setActiveField("privateKey")
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
        </>
    )
}

export default DisconnectedUserModal
