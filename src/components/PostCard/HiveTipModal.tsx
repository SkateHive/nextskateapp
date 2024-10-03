import { usePostContext } from '@/contexts/PostContext';
import { useHiveUser } from '@/contexts/UserContext';
import { transferWithKeychain } from '@/lib/hive/client-functions';
import {
    Box,
    Button,
    ButtonGroup,
    Image,
    Input,
    InputGroup,
    InputLeftElement,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Text
} from "@chakra-ui/react";
import React, { useState } from 'react';

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

    const handleAmountBlur = (e: React.ChangeEvent<HTMLInputElement>) => {
        var currentValue = e.target.value;
        if (currentValue == "") currentValue = "0";
        e.target.value = parseFloat(currentValue).toFixed(3);
        setAmount(e.target.value);
    }

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // const rawValue = e.target.value;
        // const newRawValue = [];

        // for (let i = 0; i < rawValue.length; i++) {
        //     const char = rawValue[i];
        //     if (char === 'Backspace') {
        //         // ignore backspace key press
        //         if (newRawValue.length > 0) {
        //             newRawValue.pop();
        //         }
        //     } else if (/\d/.test(char) || char === '.') {
        //         newRawValue.push(char);
        //     } else if (char === ',') {
        //         newRawValue.push('.');
        //     }
        // }
        // const formattedValue = newRawValue.join('');
        // setAmount(formattedValue);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent color={"white"} bg={"black"} border={"1px solid red"}>
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
                            <InputLeftElement>
                                {currency === "HBD" ? (
                                    <Image alt='HBD' mr={3} boxSize={"20px"} src="https://i.ibb.co/C6TPhs3/HBD.png" />
                                ) : (
                                    <Image alt="HBD" mr={3} boxSize={"20px"} src="https://cryptologos.cc/logos/hive-blockchain-hive-logo.png" />
                                )}
                            </InputLeftElement>
                            <Input
                                type="number"
                                placeholder="0.000"
                                // value={amount}
                                textAlign={'right'}
                                onBlur={handleAmountBlur}
                                onChange={handleAmountChange}
                            // style={{ direction: 'rtl' }}
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
