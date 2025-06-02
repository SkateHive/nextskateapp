import { useUserData } from "@/contexts/UserContext";
import { transferWithKeychain } from "@/lib/hive/client-functions";
import PostModel from "@/lib/models/post";
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
  Text,
} from "@chakra-ui/react";
import React, { useState, memo, useCallback, useMemo } from "react";

interface HiveTipModalProps {
  isOpen: boolean;
  onClose: () => void;
  author: string;
  permlink: string;
  post?: PostModel;
}

const HiveTipModal: React.FC<HiveTipModalProps> = memo(
  ({ isOpen, onClose, author, post }) => {
    const user = useUserData();
    const [amount, setAmount] = useState<string>("0.000");
    const [currency, setCurrency] = useState<string>("HIVE");

    const handleTip = useCallback(async () => {
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
        `Thank you for your great post, @${author}! Here's a tip for sharing your insights: ${post.title}`,
        `Supporting your content on Hive! Thanks for sharing: ${post.title}`,
        `Enjoy this tip as a token of appreciation for your work on: ${post.title}. Looking forward to more!`,
        `Your post really resonated with me, @${author}. Keep up the great work! - ${post.title}`,
        `Loved your insights on "${post.title}". Keep inspiring us!`,
        `Thanks for your thoughts on "${post.title}"! Here's a tip to show my appreciation.`,
      ];

      const randomMessage =
        messages[Math.floor(Math.random() * messages.length)];

      try {
        await transferWithKeychain(
          String(user?.name),
          author,
          fixedAmount.toFixed(3),
          randomMessage,
          currency
        );
        onClose();
      } catch (error) {
        console.error("Error sending tip:", error);
      }
    }, [post, amount, author, user?.name, currency, onClose]);

    const handleAmountChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setAmount(e.target.value);
      },
      []
    );

    const handleHiveCurrency = useCallback(() => setCurrency("HIVE"), []);
    const handleHBDCurrency = useCallback(() => setCurrency("HBD"), []);

    const currencyImage = useMemo(() => {
      return currency === "HBD" ? (
        <Image
          alt="HBD"
          mr={3}
          boxSize={"20px"}
          src="https://i.ibb.co/C6TPhs3/HBD.png"
        />
      ) : (
        <Image alt="HIVE" mr={3} boxSize={"20px"} src="/logos/hiveLogo.png" />
      );
    }, [currency]);

    return (
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent color={"white"} bg={"black"} border={"1px solid red"}>
          <ModalHeader>
            Support @{author} with
            <ButtonGroup
              ml={2}
              size="sm"
              isAttached
              variant="outline"
              colorScheme="red"
            >
              <Button
                onClick={handleHiveCurrency}
                isActive={currency === "HIVE"}
              >
                HIVE
              </Button>
              <Button onClick={handleHBDCurrency} isActive={currency === "HBD"}>
                HBD
              </Button>
            </ButtonGroup>
          </ModalHeader>

          <ModalCloseButton />

          <ModalBody>
            <Box mb={4}>
              <Text>Amount of {currency}</Text>
              <InputGroup>
                <InputLeftElement>{currencyImage}</InputLeftElement>
                <Input
                  type="text"
                  placeholder="0.000"
                  textAlign={"right"}
                  value={amount}
                  onChange={handleAmountChange}
                />
              </InputGroup>
            </Box>
          </ModalBody>

          <ModalFooter>
            <Button
              colorScheme="red"
              variant="outline"
              mr={3}
              onClick={handleTip}
            >
              Send {amount} of {currency} to @{author}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
  }
);

HiveTipModal.displayName = "HiveTipModal";

export default HiveTipModal;
