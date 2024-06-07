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
import { useEffect, useState } from "react";
import { useAccount, useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import { Operation } from "@hiveio/dhive";
import { useHiveUser } from "@/contexts/UserContext";
import { KeychainSDK, KeychainKeyTypes, Broadcast } from "keychain-sdk";
import { sendHiveOperation } from "@/lib/hive/server-functions";



interface TokenSelectorProps {
    addressDict: any;
    setShowConfetti: (show: boolean) => void;
}

interface AuthorEthAddress {
    author: string;
    ethAddress: string;
}

const SkateAirdropContract = '0x8bD8F0D46c84feCBFbF270bac4Ad28bFA2c78F05';

const TokenSelector = ({ addressDict, setShowConfetti }: TokenSelectorProps) => {
    console.log(addressDict)
    const user = useHiveUser();
    const [token, setToken] = useState("NOGS");
    const [isCustomToken, setIsCustomToken] = useState(false);
    const [customTokenContract, setCustomTokenContract] = useState("");
    const account = useAccount();
    const [amount, setAmount] = useState<string>("0");
    const ethAddressList = Object.values<AuthorEthAddress>(addressDict).map((item: AuthorEthAddress) => item.ethAddress);
    const dividedAmount = ethAddressList.length > 0 ? (Number(amount) / ethAddressList.length) : 0;
    const { data: hash, error, isPending, writeContract } = useWriteContract();

    const tokenDictionary: { [key: string]: TokenInfo } = {
        SENDIT: {
            address: '0xBa5B9B2D2d06a9021EB3190ea5Fb0e02160839A4',
            abi: SenditABI as unknown as any[],
            tokenLogo: "/logos/sendit.jpg"
        },
        NOGS: {
            address: '0x13741C5dF9aB03E7Aa9Fb3Bf1f714551dD5A5F8a',
            abi: nogsABI as unknown as any[],
            tokenLogo: "/logos/nog.svg"
        },
        MEMBER: {
            address: '0x7d89e05c0b93b24b5cb23a073e60d008fed1acf9',
            abi: memberABI as unknown as any[],
            tokenLogo: "https://member.clinic/images/01-1.jpg"
        },
        DEGEN: {
            address: '0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed',
            abi: memberABI as unknown as any[],
            tokenLogo: "/logos/degen.png"
        },
        HIVE: {
            address: '0xFUCKTHEGOVERMENT',
            abi: [],
            tokenLogo: "https://cryptologos.cc/logos/hive-blockchain-hive-logo.png"
        }

    };

    const ethAddressListFormatted = ethAddressList.map((address) => address.startsWith("0x") ? address : `0x${address}`) as readonly `0x${string}`[];
    const dividedAmountFormatted = BigInt(Math.round(dividedAmount * 1e18));

    const { isLoading: isConfirming, isSuccess: isConfirmed } =
        useWaitForTransactionReceipt({
            hash,
        });

    useEffect(() => {
        if (isConfirmed) {
            setShowConfetti(true);
        }
    }, [isConfirmed, setShowConfetti]);

    const handleHiveBulkTransfer = async () => {
        try {
            const operations: Operation[] = [];
            const amount = String(dividedAmount.toFixed(3)) + " HIVE"
            addressDict.forEach((element: any) => {

                const operation: Operation =
                    [
                        "transfer",
                        {
                            "from": user.hiveUser?.name,
                            "to": element.author,
                            "amount": amount,
                            "memo": "you just got skatehive airdrop for testing beta.skatehive.app!"
                        }
                    ]
                operations.push(operation)

                //const hiveAddress = element.author;
                //console.log(hiveAddress)
            });
            const loginMethod = localStorage.getItem("LoginMethod")
            if (!user) {
                console.error("Username is missing")
                return
            }
            if (loginMethod === "keychain") {
                try {
                    const keychain = new KeychainSDK(window);
                    undefined
                    const formParamsAsObject = {
                        "data": {
                            "username": user.hiveUser?.name,
                            "operations": operations,
                            "method": KeychainKeyTypes.active
                        }
                    }

                    const broadcast = await keychain
                        .broadcast(
                            formParamsAsObject.data as Broadcast);
                    console.log({ broadcast });
                } catch (error) {
                    console.log({ error });
                }

            } else if (loginMethod === "privateKey") {
                const encryptedPrivateKey = localStorage.getItem("EncPrivateKey");
                sendHiveOperation(encryptedPrivateKey, operations)
            }

        } catch (error) {
            console.error("Error handling bulk transfer:", error);
        }
    };
    const handleBulkTransfer = async () => {
        try {
            if (!writeContract) return;

            const dividedAmountList = ethAddressListFormatted.map(() => dividedAmountFormatted);
            writeContract({
                address: SkateAirdropContract,
                abi: airdropABI,
                functionName: 'bulkTransfer',
                args: [tokenDictionary[token].address, ethAddressListFormatted, dividedAmountList],
            });

            if (error) {
                console.error("Error sending tokens:", error);
            }
        } catch (error) {
            console.error("Error handling bulk transfer:", error);
        }
    };

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
                                        _hover={{ bg: "purple.500" }}
                                        onClick={() => {
                                            setToken("DEGEN");
                                            setIsCustomToken(false);
                                        }}
                                    >
                                        <Image alt="degen" mr={3} boxSize="20px" src={tokenDictionary['DEGEN'].tokenLogo} />
                                        $DEGEN
                                    </MenuItem>
                                    <MenuItem
                                        bg="black"
                                        _hover={{ bg: "red.500", color: "black" }}
                                        //    onClick={() => alert("We said SOON! bitch!")}
                                        onClick={() => {
                                            setToken("HIVE");
                                            setIsCustomToken(false);
                                        }}
                                    >
                                        <Image alt="hive-logo" mr={3} boxSize="20px" src="https://cryptologos.cc/logos/hive-blockchain-hive-logo.png" />
                                        $HIVE
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
                    if (token == "HIVE") {
                        handleHiveBulkTransfer();
                    } else {
                        if (account.isConnected) {
                            handleBulkTransfer();
                        } else {
                            console.error("Wallet not connected");
                        }
                    }
                }}
            >
                Send {amount} {token} to {ethAddressList.length} vagabonds !!!
            </Button>
        </>
    )
}

export default TokenSelector;
