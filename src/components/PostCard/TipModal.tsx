import { memberABI } from "@/lib/abi/memberABI";
import { nogsABI } from "@/lib/abi/nogsABI";
import { formatETHaddress } from "@/lib/utils";
import {
    Box,
    Button,
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
import React from "react";
import { parseUnits } from "viem";
import { useAccount, useWriteContract } from "wagmi";
import { SenditABI } from "../../lib/abi/senditABI";
interface TipModalProps {
    isOpen: boolean;
    onClose: () => void;
    token: string | null;
    author: string;
    authorETHwallet: string;
}
export interface TokenInfo {
    address: `0x${string}`;
    abi: any[];
    tokenLogo?: string;
}


const TipModal: React.FC<TipModalProps> = ({ isOpen, onClose, token, author, authorETHwallet }) => {
    const account = useAccount();
    const { data: hash, writeContract } = useWriteContract();
    const [amount, setAmount] = React.useState<string>("0");


    const tokenDictionary: { [key: string]: TokenInfo } = {
        SENDIT: {
            address: '0xBa5B9B2D2d06a9021EB3190ea5Fb0e02160839A4',
            abi: SenditABI as unknown as any[],
            tokenLogo: "https://sendit.city/assets/images/image03.jpg?v=c141f3fc"
        },
        NOGS: {
            address: '0x13741C5dF9aB03E7Aa9Fb3Bf1f714551dD5A5F8a',
            abi: nogsABI as unknown as any[],
            tokenLogo: "https://app.noggles.com/svg/moon-logo.svg"
        },
        MEMBER: {
            address: '0x7d89e05c0b93b24b5cb23a073e60d008fed1acf9',
            abi: memberABI as unknown as any[],
            tokenLogo: "https://member.clinic/images/01-1.jpg"
        }
    };

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
                                placeholder="Amount"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                style={{ direction: 'rtl' }}
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
