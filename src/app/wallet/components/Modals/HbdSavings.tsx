import { useHiveUser } from "@/contexts/UserContext";
import { Avatar, Box, Button, HStack, Input, SkeletonCircle, SkeletonText, Text, useToast, VStack } from "@chakra-ui/react";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

type HiveKeychainResponse = {
    success: boolean;
    message?: string;
  };

interface HbdSavingsModalProps {
    isDepositHbd: boolean;
    onCloseDepositHbd: Dispatch<SetStateAction<boolean>>;
    isWithdrawHb: boolean;
    onCloseWithdrawHbd: Dispatch<SetStateAction<boolean>>;
}

const HBDSavingsModal: React.FC<HbdSavingsModalProps> = ({
    isDepositHbd,
    onCloseDepositHbd,
    isWithdrawHb,
    onCloseWithdrawHbd,
}) => {
    const toast = useToast();
    const { hiveUser } = useHiveUser();
    const username = hiveUser?.name;
    const [formattedDepositHbd, setFormattedDepositHbd] = useState('');
    const [formattedWithdrawHbd, setFormattedWithdrawHbd] = useState("");
    const closeDepositHbdModal = () => onCloseDepositHbd(false);
    const closeWithdrawHbdModal = () => onCloseWithdrawHbd(false);
    const [isLoading, setIsLoading] = useState(true);
    
    useEffect(() => {
        setTimeout(() => setIsLoading(false), 1000);
    }, []);
   
    const WithdrawHBDSavings = async () => {
        if (typeof window !== "undefined") {
            if (!username) {
                toast({
                    title: "Error in HBD Withdrawal.",
                    description: "Username not found. Please check and try again.",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
                return;
            }

            if (!formattedWithdrawHbd) {
                toast({
                    title: "Error in HBD Withdrawal.",
                    description: "The withdrawal amount is not defined.",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
                return;
            }

            try {
                const amount = parseFloat(formattedWithdrawHbd).toFixed(3);
                if (isNaN(Number(amount))) {
                    throw new Error("The withdrawal amount is invalid.");
                }

                const requestId = Math.floor(Math.random() * 1000000000);

                const response = await new Promise<HiveKeychainResponse>((resolve, reject) => {
                    if (typeof window.hive_keychain !== "undefined") {
                        const transferOperation = [
                            "transfer_from_savings",
                            {
                                from: username,
                                to: username,
                                request_id: requestId,
                                amount: `${amount} HBD`,
                                memo: "",
                            },
                        ];

                        window.hive_keychain.requestBroadcast(
                            username,
                            [transferOperation],
                            "active",
                            (response: HiveKeychainResponse) => {
                                if (response.success) {
                                    resolve(response);
                                } else {
                                    reject(new Error(response.message || "Unknown error during withdrawal"));
                                }
                            }
                        );
                    } else {
                        toast({
                            title: "Error withdrawing from HBD.",
                            description: "Your passkey is deactivated. Activate it and try again.",
                            status: "error",
                            duration: 5000,
                            isClosable: true,
                        });
                    }
                });

                if (response.success) {
                    toast({
                        title: "Successful withdrawal!",
                        description: `You have successfully withdrawn ${amount} HBD from your savings.`,
                        status: "success",
                        duration: 5000,
                        isClosable: true,
                    });
                    closeWithdrawHbdModal();
                }
            } catch (error: any) {
                toast({
                    title: "HBD withdrawal failed.",
                    description: error.message || "An error occurred while trying to withdraw from HBD savings.",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
            }
        }
    };

    const DepositHBDSavings = async () => {
        if (typeof window !== "undefined") {
            if (!username) {
                toast({
                    title: "Error in HBD Deposit.",
                    description: "Username not found. Please check and try again.",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
                return;
            }

            try {
                const amount = parseFloat(formattedDepositHbd).toFixed(3);
                if (isNaN(Number(amount))) {
                    throw new Error("The deposit amount is invalid.");
                }

                const response = await new Promise<HiveKeychainResponse>((resolve, reject) => {
                    if (typeof window.hive_keychain !== "undefined") {
                        const transferOperation = [
                            "transfer_to_savings",
                            {
                                from: username,
                                to: username,
                                amount: `${amount} HBD`,
                                memo: "",
                            },
                        ];

                        window.hive_keychain.requestBroadcast(
                            username,
                            [transferOperation],
                            "active",
                            (response: HiveKeychainResponse) => {
                                if (response.success) {
                                    resolve(response);
                                } else {
                                    reject(new Error(response.message || "Unknown error during deposit"));
                                }
                            }
                        );
                    } else {
                        toast({
                            title: "Error in HBD Deposit.",
                            description: "Your passkey is deactivated. Activate it and try again.",
                            status: "error",
                            duration: 5000,
                            isClosable: true,
                        });
                    }
                });

                if (response.success) {
                    toast({
                        title: "Successful Deposit!",
                        description: `You have successfully deposited ${amount} HBD into your savings.`,
                        status: "success",
                        duration: 5000,
                        isClosable: true,
                    });
                    closeDepositHbdModal();
                }
            } catch (error: any) {
                toast({
                    title: "HBD Deposit Failure.",
                    description: error.message || "An error occurred when trying to make the HBD deposit.",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
            }
        }
    };

    return (
        <>
            {/* DepositHBD Modal */}
            {isDepositHbd && (
                <Box
                    width="100vw"
                    height="100vh"
                    pos="fixed"
                    top="0"
                    left="0"
                    bg="rgba(0, 0, 0, 0.6)"
                    display={isDepositHbd ? 'flex' : 'none'}

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
                                value={formattedDepositHbd}
                                onChange={(e) => setFormattedDepositHbd(e.target.value)}
                                bg="white"
                                color="black"
                                borderRadius="5px"
                                variant="outline"
                                _placeholder={{ color: 'gray.500' }} 
                            />

                            <HStack spacing={4} mt={4}>
                                <Button colorScheme="red" onClick={DepositHBDSavings} width="full">Deposit HBD</Button>
                                <Button colorScheme="gray" onClick={closeDepositHbdModal} width="full">Cancel</Button>
                            </HStack>
                        </VStack>
                    </Box>
                </Box>
            )}

            {/* Withdraw HBD Modal */}
            {isWithdrawHb && (
                <Box
                    width="100vw"
                    height="100vh"
                    pos="fixed"
                    top="0"
                    left="0"
                    bg="rgba(0, 0, 0, 0.6)"
                    display={isWithdrawHb ? 'flex' : 'none'}
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
                                value={formattedWithdrawHbd}
                                onChange={(e) => setFormattedWithdrawHbd(e.target.value)}
                                bg="white"
                                color="black"
                                borderRadius="5px"
                                variant="outline"
                                _placeholder={{ color: 'gray.500' }} 
                            />

                            <HStack spacing={4} mt={4}>
                                <Button colorScheme="red" onClick={WithdrawHBDSavings} width="full">Withdraw HBD</Button>
                                <Button colorScheme="gray" onClick={closeWithdrawHbdModal} width="full">Cancel</Button>
                            </HStack>
                        </VStack>
                    </Box>
                </Box>
            )}
        </>
    )
}

export default HBDSavingsModal