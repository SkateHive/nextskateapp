// Lets create a HiveTip Modal component that will allow users to tip authors with HIVE tokens.

// Path: src/components/PostCard/HiveTipModal.tsx
import React, { useState } from 'react';
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Button,
    useDisclosure,
    Text,
    Box,
    Image,
    Input,
    InputGroup,
    InputLeftElement,
    ButtonGroup,
} from "@chakra-ui/react";
import { FaDonate } from "react-icons/fa";
import { transferWithKeychain } from '@/lib/hive/client-functions';
import { usePostContext } from '@/contexts/PostContext';
import { useHiveUser } from '@/contexts/UserContext';

interface HiveTipModalProps {
    isOpen: boolean;
    onClose: () => void;
    author: string;
}

const HiveTipModal: React.FC<HiveTipModalProps> = ({ isOpen, onClose, author }) => {
    const { post } = usePostContext();
    const [amount, setAmount] = useState<string>("0.000");
    const [currency, setCurrency] = useState<string>("HIVE");
    const user = useHiveUser();

    const handleCurrencyChange = (currency: string) => {
        setCurrency(currency);
    }

    const handleTip = async () => {
        const fixedAmount = parseFloat(amount).toFixed(3);
        await transferWithKeychain(
            String(user.hiveUser?.name),
            author,
            fixedAmount,
            "Tip for your post",
            currency
        );
        onClose();
    }
    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAmount(e.target.value);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent bg={"black"} border={"1px solid red"}>
                <ModalHeader>Support @{author} with
                    <ButtonGroup ml={2} size="sm" isAttached variant="outline" colorScheme="red">
                        <Button
                            onClick={() => handleCurrencyChange("HIVE")}
                            isActive={currency === "HIVE"}
                        >
                            HIVE
                        </Button>
                        <Button
                            onClick={() => handleCurrencyChange("HBD")}
                            isActive={currency === "HBD"}
                        >
                            HBD
                        </Button>
                    </ButtonGroup>
                </ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Box mb={4}>
                        <Text>Amount of {currency}</Text>
                        <InputGroup>
                            <InputLeftElement

                            >
                                {currency === "HBD" ? (
                                    <Image alt='HBD' mr={3} boxSize={"20px"} src="https://i.ibb.co/C6TPhs3/HBD.png" />
                                ) : (
                                    <Image alt="HBD" mr={3} boxSize={"20px"} src="https://cryptologos.cc/logos/hive-blockchain-hive-logo.png" />


                                )}
                            </InputLeftElement>
                            <Input
                                type="number"
                                placeholder="0.00"
                                value={amount}
                                onChange={handleAmountChange}
                                style={{ direction: 'rtl' }}
                            />
                        </InputGroup>
                    </Box>
                </ModalBody>
                <ModalFooter>
                    <Button colorScheme="red" variant="outline" mr={3} onClick={handleTip}>
                        Send {amount} of {currency} to @{author}
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default HiveTipModal;