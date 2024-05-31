'use client'
import { TokenInfo } from "@/components/PostCard/TipModal";
import { airdropABI } from "@/lib/abi/airdropABI";
import { memberABI } from "@/lib/abi/memberABI";
import { nogsABI } from "@/lib/abi/nogsABI";
import { SenditABI } from "@/lib/abi/senditABI";
import {
    Box,
    Button,
    HStack,
    Image,
    Input,
    InputGroup,
    InputLeftElement,
    InputRightElement,
    Menu,
    MenuButton,
    MenuItem,
    MenuList,
    Portal,
    Text
} from "@chakra-ui/react";
import { useState } from "react";
import { useAccount, useWriteContract } from 'wagmi';

interface TokenSelectorProps {
    addressDict: any;
}

interface AuthorEthAddress {
    author: string;
    ethAddress: string;
}

const SkateAirdropContract = '0x8bD8F0D46c84feCBFbF270bac4Ad28bFA2c78F05';

const TokenSelector = ({ addressDict }: TokenSelectorProps) => {
    const [token, setToken] = useState("NOGS");
    const [isCustomToken, setIsCustomToken] = useState(false);
    const [customTokenContract, setCustomTokenContract] = useState("");
    const account = useAccount();
    const [amount, setAmount] = useState<string>("0");
    const ethAddressList = Object.values<AuthorEthAddress>(addressDict).map((item: AuthorEthAddress) => item.ethAddress);
    const dividedAmount = ethAddressList.length > 0 ? (Number(amount) / ethAddressList.length) : 0;
    const { data: hash, isPending, writeContract } = useWriteContract();

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
        },
    };

    const ethAddressListFormatted = ethAddressList.map((address) => address.startsWith("0x") ? address : `0x${address}`) as readonly `0x${string}`[];
    const dividedAmountFormatted = BigInt(Math.round(dividedAmount * 1e18));

    const handleBulkTransfer = async () => {
        if (!writeContract) return;
        console.log("ethAddressListFormatted", ethAddressListFormatted)
        console.log("dividedAmountFormatted", dividedAmountFormatted)
        const dividedAmountList = ethAddressListFormatted.map(() => dividedAmountFormatted);
        writeContract({
            address: SkateAirdropContract,
            abi: airdropABI,
            functionName: 'bulkTransfer',
            args: [tokenDictionary[token].address, ethAddressListFormatted, dividedAmountList],
        });
    }

    return (
        <>
            <HStack>
                <Text color="white">You are sponsoring with ${token}</Text>
                <Image src={tokenDictionary[token]?.tokenLogo} alt={`${token} Logo`} width="40px" mx="auto" my={4} />
            </HStack>
            <InputGroup zIndex="modal">
                <InputLeftElement zIndex="dropdown">
                    <Box borderRadius={5} position="relative" zIndex="dropdown">
                        <Menu>
                            <MenuButton as={Button} variant="ghost" size="sm">
                                <Image src={tokenDictionary[token]?.tokenLogo} alt={`${token} Logo`} width="50px" mx="auto" my={4} />
                            </MenuButton>
                            <Portal>
                                <MenuList bg="black" zIndex="9999">
                                    <MenuItem
                                        bg="black"
                                        _hover={{ bg: "green.500", color: "black" }}
                                        onClick={() => {
                                            setToken("SENDIT");
                                            setIsCustomToken(false);
                                        }}
                                    >
                                        <Image alt="sendit" mr={3} boxSize="20px" src="https://sendit.city/assets/images/image03.jpg?v=c141f3fc" />
                                        $SENDIT
                                    </MenuItem>
                                    <MenuItem
                                        bg="black"
                                        _hover={{ bg: "yellow.500" }}
                                        onClick={() => {
                                            setToken("NOGS");
                                            setIsCustomToken(false);
                                        }}
                                    >
                                        <Image alt="nogs" mr={3} boxSize="20px" src="https://app.noggles.com/svg/moon-logo.svg" />
                                        $NOGS
                                    </MenuItem>
                                    <MenuItem
                                        bg="black"
                                        _hover={{ bg: "teal.500" }}
                                        onClick={() => {
                                            setToken("MEMBER");
                                            setIsCustomToken(false);
                                        }}
                                    >
                                        <Image alt="member" mr={3} boxSize="20px" src="https://member.clinic/images/01-1.jpg" />
                                        $MEMBER
                                    </MenuItem>
                                    <MenuItem
                                        bg="black"
                                        _hover={{ bg: "red.500", color: "black" }}
                                        onClick={() => alert("We said SOON! bitch!")}
                                    // onClick={() => {
                                    //     setToken("HIVE");
                                    //     setIsCustomToken(false);
                                    // }}
                                    >
                                        <Image alt="hive-logo" mr={3} boxSize="20px" src="https://cryptologos.cc/logos/hive-blockchain-hive-logo.png" />
                                        $HIVE (Soon)
                                    </MenuItem>
                                </MenuList>
                            </Portal>
                        </Menu>
                    </Box>
                </InputLeftElement>
                <InputRightElement>
                    <Button
                        size="xs"
                        onClick={() => {
                            setAmount((prev) => String(Number(prev) + 1));
                        }}
                    >
                        +
                    </Button>
                </InputRightElement>
                <Input
                    type="number"
                    variant={"outline"}
                    placeholder="Amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                />
            </InputGroup>
            {isCustomToken && (
                <Input
                    placeholder="Enter token address"
                    value={customTokenContract}
                    fontSize={"48px"}
                    onChange={(e) => setCustomTokenContract(e.target.value)}
                />
            )}
            <Button
                colorScheme="green"
                variant={"outline"}
                onClick={() => {
                    if (account.isConnected) {
                        handleBulkTransfer();
                    } else {
                        console.error("Wallet not connected");
                    }
                }}
            >
                Send {amount} {token} to {ethAddressList.length} vagabonds !!!
            </Button>
        </>
    )
}

export default TokenSelector;
