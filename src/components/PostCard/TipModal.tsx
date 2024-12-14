import { memberABI } from "@/lib/abi/memberABI";
import { nogsABI } from "@/lib/abi/nogsABI";
import { formatETHaddress } from "@/lib/utils";
import {
    Box, Button, Image, Input, InputGroup, InputLeftElement, Modal, ModalBody,
    ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Text
} from "@chakra-ui/react";
import React from "react";
import { parseUnits } from "viem";
import { useAccount, useWriteContract } from "wagmi";
import { SenditABI } from "../../lib/abi/senditABI";
import { TokenInfo } from "@/app/mainFeed/utils/types";
import { tokenDictionary } from "@/app/mainFeed/utils/tokenDictionary";

interface TipModalProps {
    isOpen: boolean;
    onClose: () => void;
    token: string | null;
    author: string;
    authorETHwallet: string;
}

const TipModal: React.FC<TipModalProps> = ({ isOpen, onClose, token, author, authorETHwallet }) => {
    const account = useAccount();
    const { data: hash, writeContract } = useWriteContract();
    const [amount, setAmount] = React.useState<string>("0");

    const handleAmountOnBlur = (event: React.ChangeEvent<HTMLInputElement>) => {
        var currentValue = event.target.value;
        if (currentValue == "") currentValue = "0";
        // event.target.value = currentValue.toFixed(18);
        setAmount(event.target.value);
    }

    const sendToken = async (amount: string, tokenKey: string) => {
        if (tokenKey in tokenDictionary) {
            const { address, abi } = tokenDictionary[tokenKey];
            try {
                await writeContract({
                    address, // contract address of the token
                    abi, // ABI for the token's contract
                    functionName: 'transfer',
                    args: [authorETHwallet, parseUnits(amount, 18)], // Assuming the recipient's address is `author` and token decimals is 18
                });
                console.log(`Transaction hash: ${hash}`);
            } catch (error) {
                console.error(error);
            }
        } else {
            console.log("Unsupported token");
        }
    };
    const tokenInfo = token ? tokenDictionary[token] : null;

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent color={"white"} bg={"black"} border={"1px solid #A5D6A7"}>
                <ModalHeader>Support {author} with {token}</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Text>From: {formatETHaddress(String(account.address))}</Text>
                    <Text>To: {formatETHaddress(String(authorETHwallet))}</Text>

                    <Box mt={5}>
                        <InputGroup>
                            <InputLeftElement>
                                {tokenInfo && tokenInfo.tokenLogo && (
                                    <Image src={tokenInfo.tokenLogo} alt={`${token} Logo`} width="100px" mx="auto" my={4} />
                                )}
                            </InputLeftElement>
                            <Input
                                type="number"
                                placeholder="0.000000000000000000"
                                textAlign={'right'}
                                onBlur={handleAmountOnBlur}
                            />
                        </InputGroup>

                    </Box>
                </ModalBody>

                <ModalFooter>
                    <Button onClick={() => token && sendToken(amount, token)} variant="outline" border="1px solid #A5D6A7">
                        Send
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}

export default TipModal;
