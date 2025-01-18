import AuthorAvatar from "@/components/AuthorAvatar";
import { useHiveUser } from "@/contexts/UserContext";
import { Box, Button, HStack, Input, useToast, VStack } from "@chakra-ui/react";
import { Dispatch, SetStateAction, useEffect, useState } from "react";


interface isHbdSendProps {
    isHbdModalOpened: boolean;
    setIsHbdModalOpened: Dispatch<SetStateAction<boolean>>;
}

const HBDSendModal: React.FC<isHbdSendProps> = ({
    isHbdModalOpened,
    setIsHbdModalOpened,
}) => {
    const { hiveUser } = useHiveUser();
    const username = hiveUser?.name;
    const [recipient, setRecipient] = useState("");
    const [formattedAmountHbd, setFormattedAmountHbd] = useState("");
    const [memo, setMemo] = useState("");
    const memoWallet = "#" + memo;
    const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(null);
    const [TempRecipient, setTempRecipient] = useState("");
    const [previousRecipient, setPreviousRecipient] = useState("");

    useEffect(() => {
        if (debounceTimeout) {
            clearTimeout(debounceTimeout);
        }
        const timeout = setTimeout(() => {
            setRecipient(TempRecipient);
        }, 300);

        setDebounceTimeout(timeout);

        return () => {
            clearTimeout(timeout);
        };
    }, [TempRecipient]);

    useEffect(() => {
        if (recipient.trim() !== previousRecipient.trim()) {
            setPreviousRecipient(recipient);
        }
    }, [recipient]);


    const toast = useToast();
    // HBD
    const sendHBD = async () => {
        if (typeof window !== "undefined") {
            try {
                const response = await new Promise<{
                    success: boolean;
                    message?: string;
                }>((resolve, reject) => {
                    if (typeof window.hive_keychain !== "undefined") {
                        window.hive_keychain.requestTransfer(
                            username,
                            recipient,
                            formattedAmountHbd,
                            memoWallet,
                            "HBD",
                            (response: { success: boolean; message?: string }) => {
                                if (response.success) {
                                    resolve(response);
                                } else {
                                    reject(new Error(response.message));
                                }
                            }
                        );
                    } else {
                        toast({
                            title: "Transfer error.",
                            description: "Your passkey is deactivated. Activate it and try again.",
                            status: "error",
                            duration: 5000,
                            isClosable: true,
                        });
                    }
                });

                if (response.success) {
                    toast({
                        title: "Transfer successful!",
                        description: "The HBD has been sent successfully.",
                        status: "success",
                        duration: 5000,
                        isClosable: true,
                    });
                    setIsHbdModalOpened(false);
                    setRecipient('')

                    setMemo('')
                }
            } catch (error: any) {
                toast({
                    title: "Transfer failed.",
                    description: error.message || "An error occurred while trying to send the HBD.",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
            }
        } else {
            toast({
                title: "Erro.",
                description: "Hive Keychain is not available.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        }
    };
    return (
        <>
            {/* HBD Modal */}
            {isHbdModalOpened && (
                <Box
                    width="100vw"
                    height="100vh"
                    pos="fixed"
                    top="0"
                    left="0"
                    bg="rgba(0, 0, 0, 0.6)"
                    display={isHbdModalOpened ? 'flex' : 'none'}
                    alignItems="center"
                    justifyContent="center"
                    zIndex={1000}
                >
                    <Box
                        bg="red.900"
                        p={6}
                        borderRadius="10px"
                        w={{ base: "90%", sm: "70%", md: "50%", lg: "40%" }}
                        maxW="500px"
                        boxShadow="0 4px 6px rgba(0, 0, 0, 0.1)"
                        position="relative"
                    >
                        <VStack spacing={4} align="stretch">
                            <Box display="flex" alignItems="center">
                                {previousRecipient == recipient && (
                                    <AuthorAvatar username={previousRecipient} borderRadius={100} />
                                )}
                                <Input
                                    placeholder="Username"
                                    value={recipient}
                                    onChange={(e) => setRecipient(e.target.value)}
                                    bg="white"
                                    color="black"
                                    borderRadius="5px"
                                    variant="outline"
                                    ml={4}
                                    _placeholder={{ color: 'gray.500' }} 
                                />
                            </Box>
                            <Input
                                placeholder="0.000"
                                value={formattedAmountHbd}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/[^0-9.]/g, "");
                                    setFormattedAmountHbd(value);
                                }}
                                onBlur={() => {
                                    const formattedValue = parseFloat(formattedAmountHbd || "0").toFixed(3);
                                    setFormattedAmountHbd(formattedValue);
                                }}
                                bg="white"
                                color="black"
                                borderRadius="5px"
                                variant="outline"
                                _placeholder={{ color: 'gray.500' }} 
                            />
                            <Input
                                placeholder="Memo (Optional)"
                                value={memo}
                                onChange={(e) => setMemo(e.target.value)}
                                bg="white"
                                color="black"
                                borderRadius="5px"
                                variant="outline"
                                _placeholder={{ color: 'gray.500' }} 
                            />
                            <HStack spacing={4} mt={4}>
                                <Button
                                    colorScheme="red"
                                    onClick={sendHBD}
                                    width="full"
                                >
                                    Send HBD
                                </Button>
                                <Button
                                    colorScheme="gray"
                                    onClick={() => setIsHbdModalOpened(false)}
                                    width="full"
                                >
                                    Cancel
                                </Button>
                            </HStack>
                        </VStack>
                    </Box>
                </Box>
            )}
        </>
    )
}

export default HBDSendModal;