import { useHiveUser } from '@/contexts/UserContext';
import { transferWithKeychain } from '@/lib/hive/client-functions';
import PostModel from '@/lib/models/post';
import {
    Box, Button, ButtonGroup, Image, Input, InputGroup, InputLeftElement, Modal, ModalBody,
    ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Text
} from "@chakra-ui/react";
import React, { useState } from 'react';

interface HiveTipModalProps {
    isOpen: boolean;
    onClose: () => void;
    author: string;
    permlink: string;
    post?: PostModel;
}

const HiveTipModal: React.FC<HiveTipModalProps> = ({ isOpen, onClose, author, post }) => {
    const user = useHiveUser();
    const [amount, setAmount] = useState<string>("0.000");
    const [currency, setCurrency] = useState<string>("HIVE");

    const handleTip = async () => {
        if (!post) {
            console.error("The post is not loaded.");
            return;
        }
    
        const fixedAmount = parseFloat(amount);
        if (isNaN(fixedAmount) || fixedAmount <= 0) {
            console.error("The value must be a positive number.");
            return;
        }
    
        const messages = [
            `Thank you for your great post, @${author}! Here’s a tip for sharing your insights: ${post.title}`,
            `Supporting your content on Hive! Thanks for sharing: ${post.title}`,
            `Enjoy this tip as a token of appreciation for your work on: ${post.title}. Looking forward to more!`,
            `Your post really resonated with me, @${author}. Keep up the great work! - ${post.title}`,
            `Loved your insights on "${post.title}". Keep inspiring us!`,
            `Thanks for your thoughts on "${post.title}"! Here’s a tip to show my appreciation.`
        ];
    
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    
        try {
            await transferWithKeychain(
                String(user.hiveUser?.name),
                author,
                fixedAmount.toFixed(3),
                randomMessage,
                currency
            );
            onClose();
        } catch (error) {
            console.error("Error sending tip:", error);
        }
    };
    

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent color={"white"} bg={"black"} border={"1px solid red"}>
                <ModalHeader>
                    Support @{author} with
                    <ButtonGroup ml={2} size="sm" isAttached variant="outline" colorScheme="red">
                        <Button onClick={() => setCurrency("HIVE")} isActive={currency === "HIVE"}>HIVE</Button>
                        <Button onClick={() => setCurrency("HBD")} isActive={currency === "HBD"}>HBD</Button>
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
                                    <Image alt="HIVE" mr={3} boxSize={"20px"} src="/logos/hiveLogo.png" />
                                )}
                            </InputLeftElement>
                            <Input
                                type="text"
                                placeholder="0.000"
                                textAlign={'right'}
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
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
