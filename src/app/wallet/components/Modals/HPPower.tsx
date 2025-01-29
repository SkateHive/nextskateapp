import AuthorAvatar from "@/components/AuthorAvatar";
import { useHiveUser } from "@/contexts/UserContext";
import { Avatar, Box, Button, HStack, Input, SkeletonCircle, SkeletonText, Text, useToast, VStack } from "@chakra-ui/react";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

interface isHpDelegateProps {
    isHPPowerDown: boolean;
    onCloseHPPowerDown: Dispatch<SetStateAction<boolean>>;
    isHpDelegates: boolean;
    onCloseHpDelegates: Dispatch<SetStateAction<boolean>>;
}

const HpDelegateModal: React.FC<isHpDelegateProps> = ({
    isHPPowerDown,
    onCloseHPPowerDown,
    isHpDelegates,
    onCloseHpDelegates,
}) => {
    const toast = useToast();
    const { hiveUser } = useHiveUser();

    const username = hiveUser?.name;

    const [recipient, setRecipient] = useState("");
    const [formattedHppowerDown, setFormattedHppowerDown] = useState("");
    const [formattedHpDelegate, setFormattedHpDelegate] = useState('')
    const closeHPowerModal = () => onCloseHPPowerDown(false);
    const closeHpDelegatesModal = () => onCloseHpDelegates(false);
    const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(null);
    const [TempRecipient, setTempRecipient] = useState("");
    const [previousRecipient, setPreviousRecipient] = useState("");
    const [isLoading, setIsLoading] = useState(true);

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
 
    const HPDelegate = async () => {
        if (!username || !recipient || !formattedHpDelegate) {
            toast({
                title: "HP Delegate error.",
                description: "Username, recipient, or HP amount is missing. Please check and try again.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
            return;
        }
    
        const hpAmount = parseFloat(formattedHpDelegate);
        if (isNaN(hpAmount) || hpAmount <= 0) {
            toast({
                title: "Invalid HP amount.",
                description: "Please enter a valid amount greater than zero for delegation.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
            return;
        }
    
        try {
            if (typeof window.hive_keychain === "undefined") {
                toast({
                    title: "Hive Keychain Error",
                    description: "Hive Keychain is not installed or available. Please install it and try again.",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
                return;
            }
    
            const response = await new Promise<{ success: boolean; message?: string }>((resolve, reject) => {
                const transferOperation = {
                    type: "delegate_vesting_shares",
                    username: username,
                    delegate: recipient,
                    vesting_shares: `${hpAmount.toFixed(3)}`,
                    unit: "HP",
                };
    
                window.hive_keychain.requestDelegation(
                    transferOperation.username,
                    transferOperation.delegate,
                    transferOperation.vesting_shares,
                    transferOperation.unit,
                    (response: { success: boolean; message?: string }) => {
                        if (response.success) {
                            resolve(response);
                        } else {
                            reject(new Error(response.message || "Unknown error"));
                        }
                    }
                );
            });
    
            if (response.success) {
                toast({
                    title: "Successful HP Delegate!",
                    description: `You have successfully delegated ${hpAmount.toFixed(3)} HP.`,
                    status: "success",
                    duration: 5000,
                    isClosable: true,
                });
                closeHpDelegatesModal();
            }
    
        } catch (error: any) {
            toast({
                title: "Failure to delegate HP",
                description: error.message || "An error occurred when trying to delegate HP.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        }
    };
    
    
    const HPPowerDown = async () => {
        if (typeof window !== "undefined") {
            if (!username) {
                toast({
                    title: "HPPowerDown error.",
                    description: "Username not found. Please check and try again.",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
                return;
            }
    
            if (!window.hive_keychain) {
                toast({
                    title: "Hive Keychain not available.",
                    description: "Please make sure Hive Keychain is installed and active.",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
                return;
            }
    
            try {
                const hpAmount = parseFloat(formattedHppowerDown);
                if (isNaN(hpAmount) || hpAmount <= 0) {
                    toast({
                        title: "Invalid Power Down amount.",
                        description: "Please enter a valid amount greater than zero.",
                        status: "error",
                        duration: 5000,
                        isClosable: true,
                    });
                    return;
                }
    
                const response = await new Promise<{ success: boolean; message?: string }>((resolve, reject) => {
                    if (window.hive_keychain) {
                        window.hive_keychain.requestPowerDown(
                            username, 
                            `${hpAmount.toFixed(3)}`, // Convert to 3 decimal places
                            (response: { success: boolean; message?: string }) => {
                                if (response.success) {
                                    resolve(response);
                                } else {
                                    reject(new Error(response.message || "Unknown error"));
                                }
                            }
                        );
                    } else {
                        reject(new Error("Hive Keychain not available"));
                    }
                });
    
                if (response.success) {
                    toast({
                        title: "HPPowerDown successful!",
                        description: `You have successfully powered down ${formattedHppowerDown} Hive Power.`,
                        status: "success",
                        duration: 5000,
                        isClosable: true,
                    });
                }
            } catch (error: any) {
                console.error("Error during HPPowerDown:", error);
                toast({
                    title: "HPPowerDown failed.",
                    description: error.message || "An error occurred when trying to perform HPPowerDown.",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
            }
        }
    };

    return (
        <>
            {/* Hp Delegate*/}
            {isHpDelegates && (
                <Box
                    width="100vw"
                    height="100vh"
                    pos="fixed"
                    top="0"
                    left="0"
                    bg="rgba(0, 0, 0, 0.6)"
                    display={isHpDelegates ? 'flex' : 'none'}
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
                                value={formattedHpDelegate}
                                onChange={(e) => setFormattedHpDelegate(e.target.value)}
                                bg="white"
                                color="black"
                                borderRadius="5px"
                                variant="outline"
                                _placeholder={{ color: 'gray.500' }} 
                            />

                            <HStack spacing={4} mt={4}>
                                <Button
                                    colorScheme="red"
                                    onClick={HPDelegate}
                                    width="full"
                                >
                                    Delegate HP
                                </Button>
                                <Button colorScheme="gray" onClick={closeHpDelegatesModal} width="full">Cancel</Button>

                            </HStack>
                        </VStack>

                    </Box>
                </Box>
            )}

            {/* Power Down Modal */}
            {isHPPowerDown && (
                <Box
                    width="100vw"
                    height="100vh"
                    pos="fixed"
                    top="0"
                    left="0"
                    bg="rgba(0, 0, 0, 0.6)"
                    display={isHPPowerDown ? 'flex' : 'none'}
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
                                value={formattedHppowerDown}
                                onChange={(e) => setFormattedHppowerDown(e.target.value)}
                                bg="white"
                                color="black"
                                borderRadius="5px"
                                variant="outline"
                                _placeholder={{ color: 'gray.500' }} 
                            />
                            <HStack spacing={4} mt={4}>
                                <Button colorScheme="red" onClick={HPPowerDown} width="full">Power Down</Button>
                                <Button colorScheme="gray" onClick={closeHPowerModal} width="full">Cancel</Button>
                            </HStack>
                        </VStack>
                    </Box>
                </Box>
            )}
        </>
    )
}

export default HpDelegateModal;