import { useHiveUser } from "@/contexts/UserContext";
import { Avatar, Box, Button, HStack, Input, SkeletonCircle, SkeletonText, Text, useToast, VStack } from "@chakra-ui/react";
import { Dispatch, SetStateAction, useEffect, useState } from "react";


interface HbdSavingsModalProps {
    isDepositHbdSavingsModalOpened: boolean;
    setIsDepositHbdSavingsModalOpened: Dispatch<SetStateAction<boolean>>;
    isWithdrawHbdModalOpened: boolean;
    setIsWithdrawHbdModalOp: Dispatch<SetStateAction<boolean>>;
}

const HBDSavingsModal: React.FC<HbdSavingsModalProps> = ({
    isDepositHbdSavingsModalOpened,
    setIsDepositHbdSavingsModalOpened,
    isWithdrawHbdModalOpened,
    setIsWithdrawHbdModalOp,
}) => {
    const toast = useToast();
    const { hiveUser } = useHiveUser();
    const username = hiveUser?.name;
    const [formattedDepositHbd, setFormattedDepositHbd] = useState('');
    const [formattedWithdrawHbd, setFormattedWithdrawHbd] = useState("");
    const closeDepositHbdModal = () => setIsDepositHbdSavingsModalOpened(false);
    const closeWithdrawHbdModal = () => setIsWithdrawHbdModalOp(false);
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        setTimeout(() => setIsLoading(false), 1000);
    }, []);
    //Savings
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

                const response = await new Promise<{ success: boolean; message?: string }>((resolve, reject) => {
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
                        description: "You have successfully withdrawn from your HBD savings.",
                        status: "success",
                        duration: 5000,
                        isClosable: true,
                    });
                    closeDepositHbdModal();
                }
            } catch (error: any) {
                toast({
                    title: "HBD withdrawal failed.",
                    description: error.message || "Ocorreu um erro ao tentar realizar a retirada HBD.",
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
                    throw new Error("The withdrawal amount is invalid.");
                }

                const response = await new Promise<{ success: boolean; message?: string }>((resolve, reject) => {
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
                        title: "Successful deposit!",
                        description: "You have just made a deposit into your savings account.",
                        status: "success",
                        duration: 5000,
                        isClosable: true,
                    });
                    closeDepositHbdModal();
                }
            } catch (error: any) {
                toast({
                    title: "HBD Deposit Failure.",
                    description: error.message || "An error occurred when trying to make the HBD Deposit.",
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
            {isDepositHbdSavingsModalOpened && (
                <Box
                    width="100vw"
                    height="100vh"
                    pos="fixed"
                    top="0"
                    left="0"
                    bg="rgba(0, 0, 0, 0.6)"
                    display={isDepositHbdSavingsModalOpened ? 'flex' : 'none'}

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
            {isWithdrawHbdModalOpened && (
                <Box
                    width="100vw"
                    height="100vh"
                    pos="fixed"
                    top="0"
                    left="0"
                    bg="rgba(0, 0, 0, 0.6)"
                    display={isWithdrawHbdModalOpened ? 'flex' : 'none'}
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