import AuthorAvatar from "@/components/AuthorAvatar";
import { useHiveUser } from "@/contexts/UserContext";
import { Avatar, Box, Button, HStack, Input, SkeletonCircle, SkeletonText, Text, useToast, VStack } from "@chakra-ui/react";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

interface HiveModalOpenProps {
    isHive: boolean;
    onCloseHive: Dispatch<SetStateAction<boolean>>;
    isHivePowerUp: boolean;
    onCloseHivePowerUp: Dispatch<SetStateAction<boolean>>;
}

const HiveModalOpen: React.FC<HiveModalOpenProps> = ({
    isHive,
    onCloseHive,
    isHivePowerUp,
    onCloseHivePowerUp,
}) => {
    const { hiveUser } = useHiveUser();
    const username = hiveUser?.name;
    const [formattedAmountHive, setFormattedAmountHive] = useState("");
    const [formattedAmountHivePower, setFormattedAmountHivePower] = useState("");
    const [recipient, setRecipient] = useState("");
    const [previousRecipient, setPreviousRecipient] = useState("");
    const [TempRecipient, setTempRecipient] = useState("");
    const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const [memo, setMemo] = useState("");
    const memoWallet = "#" + memo;

    const toast = useToast();
    const closeHivePowerModal = () => onCloseHivePowerUp(false);

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

    useEffect(() => {

        setTimeout(() => setIsLoading(false), 1000);
    }, []);

    // Hive
    const sendHive = async () => {
        if (typeof window !== "undefined") {

            if (!recipient) {
                toast({
                    title: "Error in HBD Withdrawal.",
                    description: "Username not found. Please check and try again.",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
                return;
            }
            try {
                const response = await new Promise<{
                    success: boolean;
                    message?: string;
                }>((resolve, reject) => {
                    if (typeof window.hive_keychain !== "undefined") {
                        window.hive_keychain.requestTransfer(
                            username,
                            recipient,
                            formattedAmountHive,
                            memoWallet,
                            "HIVE",
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
                        description: "HIVE has been sent successfully.",
                        status: "success",
                        duration: 5000,
                        isClosable: true,
                    });
                    onCloseHive(false);
                    setRecipient('')
                    setMemo('')
                }
            } catch (error: any) {
                toast({
                    title: "Transfer failed.",
                    description: error.message || "An error occurred while trying to send the HIVE.",
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
    const sendPowerUp = async () => {
        if (typeof window !== "undefined") {
            try {
                const response = await new Promise<{
                    success: boolean;
                    message?: string;
                }>((resolve, reject) => {
                    if (typeof window.hive_keychain !== "undefined") {
                        window.hive_keychain.requestPowerUp(
                            username,
                            username,
                            formattedAmountHivePower,
                            memoWallet,
                            "transfer_to_vesting",
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
                            title: "Power-Up error.",
                            description: "Your passkey is deactivated. Activate it and try again.",
                            status: "error",
                            duration: 5000,
                            isClosable: true,
                        });
                    }
                });

                if (response.success) {
                    toast({
                        title: "Successful Power-Up!",
                        description: "You just won HIVE Power.",
                        status: "success",
                        duration: 5000,
                        isClosable: true,
                    });
                }
            } catch (error: any) {
                toast({
                    title: "Power-Up failed.",
                    description: error.message || "An error occurred when trying to perform the Power-Up.",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
            }
        };
    }
    return (
        <>
            {/* HIVE Modal */}
            {isHive && (
                <Box
                    width="100vw"
                    height="100vh"
                    pos="fixed"
                    top="0"
                    left="0"
                    bg="rgba(0, 0, 0, 0.6)"
                    display={isHive ? 'flex' : 'none'}
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
                                value={formattedAmountHive}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/[^0-9.]/g, "");
                                    setFormattedAmountHive(value);
                                }}
                                onBlur={() => {
                                    const formattedValue = parseFloat(formattedAmountHive || "0").toFixed(3);
                                    setFormattedAmountHive(formattedValue);
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
                                    onClick={sendHive}
                                    width="full"
                                >
                                    Send HIVE
                                </Button>
                                <Button
                                    colorScheme="gray"
                                    onClick={() => onCloseHive(false)}
                                    width="full"
                                >
                                    Cancel
                                </Button>
                            </HStack>
                        </VStack>
                    </Box>
                </Box>
            )}

            {/* HIVE Power Modal */}
            {isHivePowerUp && (
                <Box
                    width="100vw"
                    height="100vh"
                    pos="fixed"
                    top="0"
                    left="0"
                    bg="rgba(0, 0, 0, 0.6)"
                    display={isHivePowerUp ? 'flex' : 'none'}
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
                            <HStack
                                w="100%"
                                border="1px solid white"
                                p={5}
                                borderTopRadius={10}
                                justifyContent="start"
                                bg="red.900"
                                cursor="pointer"
                                alignItems="center"

                            >
                                <SkeletonCircle size="48px" isLoaded={!isLoading} p={0}>
                                    <Avatar
                                        p={0}
                                        boxSize="48px"
                                        name={hiveUser?.name}
                                        src={hiveUser?.metadata?.profile.profile_image}
                                    >

                                    </Avatar>
                                </SkeletonCircle>
                                <Box p={0} ml={4}>
                                    <SkeletonText isLoaded={!isLoading} noOfLines={1}>
                                        <Text
                                            p={0}
                                            fontSize={14}
                                            maxWidth="200px"
                                            whiteSpace="nowrap"
                                            overflow="hidden"
                                            textOverflow="ellipsis"
                                            textAlign="center"
                                        >
                                            {hiveUser?.name || "Loading..."}
                                        </Text>
                                    </SkeletonText>
                                </Box>
                            </HStack>
                            <Input
                                placeholder="0.000"
                                value={formattedAmountHivePower}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/[^0-9.]/g, "");

                                    if ((value.match(/\./g) || []).length > 1) {
                                        return;
                                    }

                                    setFormattedAmountHivePower(value);
                                }}
                                onBlur={() => {
                                    const formattedValue = parseFloat(formattedAmountHivePower || "0").toFixed(3);
                                    setFormattedAmountHivePower(formattedValue);
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
                                <Button colorScheme="red" onClick={sendPowerUp} width="full">Power Up</Button>
                                <Button colorScheme="gray" onClick={closeHivePowerModal} width="full">Cancel</Button>
                            </HStack>
                        </VStack>
                    </Box>
                </Box>
            )}
        </>
    )
}



export default HiveModalOpen;