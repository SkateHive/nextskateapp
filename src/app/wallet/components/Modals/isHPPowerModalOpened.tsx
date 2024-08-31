import AuthorAvatar from "@/components/AuthorAvatar";
import { useHiveUser } from "@/contexts/UserContext";
import { Avatar, Box, Button, HStack, Input, SkeletonCircle, SkeletonText, Text, useToast, VStack } from "@chakra-ui/react";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

interface isHpDelegateProps {
    isHPPowerModalOpened: boolean;
    setIsHPPowerModalOpened: Dispatch<SetStateAction<boolean>>;
    isHpDelegatesModalOpened: boolean;
    setIsHpDelegatesModalOpened: Dispatch<SetStateAction<boolean>>;
}

const HpDelegateModal: React.FC<isHpDelegateProps> = ({
    isHPPowerModalOpened,
    setIsHPPowerModalOpened,
    isHpDelegatesModalOpened,
    setIsHpDelegatesModalOpened,
}) => {
    const toast = useToast();
    const { hiveUser } = useHiveUser();

    const username = hiveUser?.name;

    const [recipient, setRecipient] = useState("");
    const [formattedHppowerDown, setFormattedHppowerDown] = useState("");
    const [formattedHpDelegate, setFormattedHpDelegate] = useState('')
    const closeHPowerModal = () => setIsHPPowerModalOpened(false);
    const closeHpDelegatesModal = () => setIsHpDelegatesModalOpened(false);
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
    //HP
    const HPDelegate = async () => {
        if (!username || !recipient || !formattedHpDelegate) {
            toast({
                title: "HP Delegate error.",
                description: "Username not found. Please check and try again.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
            return;
        }
        try {
            const response = await new Promise<{ success: boolean; message?: string }>((resolve, reject) => {
                if (typeof window.hive_keychain !== "undefined") {
                    const transferOperation = {
                        type: "delegate_vesting_shares",
                        username: username,
                        delegate: recipient,
                        vesting_shares: `${parseFloat(formattedHpDelegate).toFixed(3)}`,
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
                                reject(new Error(response.message || "Erro desconhecido"));
                            }
                        }
                    );
                } else {
                    toast({
                        title: "Error when delegating HP",
                        description: "Your passkey is deactivated. Activate it and try again.",
                        status: "error",
                        duration: 5000,
                        isClosable: true,
                    });
                    return;
                }
            });
            if (response.success) {
                toast({
                    title: "Successful HP Delegate!",
                    description: "You have just delegated HP",
                    status: "success",
                    duration: 5000,
                    isClosable: true,
                });
                closeHpDelegatesModal();
            }
        } catch (error: any) {
            toast({
                title: "Failure to delegate HP ",
                description: error.message || "An error occurred when trying to Delegate HP",
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
            try {
                const response = await new Promise<{
                    success: boolean;
                    message?: string;
                }>((resolve, reject) => {
                    if (typeof window.hive_keychain !== "undefined") {
                        window.hive_keychain.requestPowerDown(
                            username,
                            formattedHppowerDown,
                            "HP",
                            "withdraw_vesting",
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
                            title: "Power-Down error.",
                            description: "Your passkey is deactivated. Activate it and try again.",
                            status: "error",
                            duration: 5000,
                            isClosable: true,
                        });
                    }
                });
                if (response.success) {
                    toast({
                        title: "HPPowerDown successful!",
                        description: "You have just done an HPPowerDown.",
                        status: "success",
                        duration: 5000,
                        isClosable: true,
                    });
                }
            } catch (error: any) {
                toast({
                    title: "HPPowerDown failed.",
                    description: error.message || "An error occurred when trying to perform HPPowerDown.",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
            }
        };
    }
    return (
        <>
            {/* Hp Delegate*/}
            {isHpDelegatesModalOpened && (
                <Box
                    width="100vw"
                    height="100vh"
                    pos="fixed"
                    top="0"
                    left="0"
                    bg="rgba(0, 0, 0, 0.6)"
                    display={isHpDelegatesModalOpened ? 'flex' : 'none'}
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
                                    placeholder="@Username"
                                    value={recipient}
                                    onChange={(e) => setRecipient(e.target.value)}
                                    bg="white"
                                    color="black"
                                    borderRadius="5px"
                                    variant="outline"
                                    ml={4}
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
            {isHPPowerModalOpened && (
                <Box
                    width="100vw"
                    height="100vh"
                    pos="fixed"
                    top="0"
                    left="0"
                    bg="rgba(0, 0, 0, 0.6)"
                    display={isHPPowerModalOpened ? 'flex' : 'none'}
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