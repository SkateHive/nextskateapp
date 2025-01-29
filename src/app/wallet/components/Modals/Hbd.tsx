import AuthorAvatar from "@/components/AuthorAvatar";
import { useHiveUser } from "@/contexts/UserContext";
import { Box, Button, HStack, Input, useToast, VStack } from "@chakra-ui/react";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

type HiveKeychainResponse = {
  success: boolean;
  message?: string;
};

interface HBDSendModalProps {
  isSendHBD: boolean; 
  onCloseSendHBD: Dispatch<SetStateAction<boolean>>; 
}

const HBDSendModal: React.FC<HBDSendModalProps> = ({ isSendHBD, onCloseSendHBD }) => {
  const { hiveUser } = useHiveUser();
  const username = hiveUser?.name || ""; 
  const toast = useToast();

  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");

  const [debouncedRecipient, setDebouncedRecipient] = useState("");
  const [previousRecipient, setPreviousRecipient] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedRecipient(recipient), 300);
    return () => clearTimeout(handler);
  }, [recipient]);

  useEffect(() => {
    if (debouncedRecipient.trim() !== previousRecipient.trim()) {
      setPreviousRecipient(debouncedRecipient);
    }
  }, [debouncedRecipient]);

  const SendHBD = async () => {
    if (typeof window === "undefined" || typeof window.hive_keychain === "undefined") {
      return toast({
        title: "Keychain unavailable",
        description: "Hive Keychain is not available or activated.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }

    try {
      const response = await new Promise<HiveKeychainResponse>((resolve, reject) => {
        window.hive_keychain.requestTransfer(
          username,
          recipient,
          amount,
          `#${memo}`,
          "HBD",
          (res: HiveKeychainResponse) => {
            if (res.success) {
              resolve(res);
            } else {
              reject(new Error(res.message || "Transfer failed"));
            }
          }
        );
      });

      if (response.success) {
        toast({
          title: "Success!",
          description: "HBD transfer completed successfully.",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        resetForm();
        onCloseSendHBD(false); 
      }
    } catch (error: any) {
      toast({
        title: "Transfer failed",
        description: error.message || "An error occurred during the transfer.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const resetForm = () => {
    setRecipient("");
    setAmount("");
    setMemo("");
  };

  return (
    isSendHBD && (
      <Box
        position="fixed"
        top="0"
        left="0"
        width="100vw"
        height="100vh"
        bg="rgba(0, 0, 0, 0.6)"
        display="flex"
        alignItems="center"
        justifyContent="center"
        zIndex="1000"
      >
        <Box
          bg="red.900"
          p={6}
          borderRadius="10px"
          width={{ base: "90%", sm: "70%", md: "50%", lg: "40%" }}
          maxWidth="500px"
          boxShadow="0 4px 6px rgba(0, 0, 0, 0.1)"
        >
          <VStack spacing={4} align="stretch">
            <Box display="flex" alignItems="center">
              {previousRecipient === recipient && (
                <AuthorAvatar username={previousRecipient} borderRadius={100} />
              )}
              <Input
                placeholder="username"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                bg="white"
                color="black"
                borderRadius="5px"
                variant="outline"
                ml={previousRecipient === recipient ? 4 : 0}
                _placeholder={{ color: "gray.500" }}
              />
            </Box>
            <Input
              placeholder="0.000"
              value={amount}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9.]/g, "");
                setAmount(value);
              }}
              onBlur={() => {
                const formattedValue = parseFloat(amount || "0").toFixed(3);
                setAmount(formattedValue);
              }}
              bg="white"
              color="black"
              borderRadius="5px"
              variant="outline"
              _placeholder={{ color: "gray.500" }}
            />
            <Input
              placeholder="Memo (optional)"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              bg="white"
              color="black"
              borderRadius="5px"
              variant="outline"
              _placeholder={{ color: "gray.500" }}
            />
            <HStack spacing={4} mt={4}>
              <Button colorScheme="red" onClick={SendHBD} width="full">
                Send HBD
              </Button>
              <Button colorScheme="gray" onClick={() => onCloseSendHBD(false)} width="full">
                Cancel
              </Button>
            </HStack>
          </VStack>
        </Box>
      </Box>
    )
  );
};

export default HBDSendModal;
