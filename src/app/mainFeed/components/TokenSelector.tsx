'use client'
import { useHiveUser } from "@/contexts/UserContext";
import { airdropABI } from "@/lib/abi/airdropABI";
import { sendHiveOperation } from "@/lib/hive/server-functions";
import {
    Box,
    Button,
    HStack,
    Image,
    Input,
    InputGroup,
    InputLeftAddon,
    InputRightElement,
    Menu,
    MenuButton,
    MenuItem,
    MenuList,
    Text
} from "@chakra-ui/react";
import { Operation } from "@hiveio/dhive";
import { Broadcast, KeychainKeyTypes, KeychainSDK } from "keychain-sdk";
import { useEffect, useState } from "react";
import { useAccount, useReadContract, useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import { tokenDictionary } from "../utils/tokenDictionary";
import { Address } from "viem";

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
    const user = useHiveUser();
    const [token, setToken] = useState("HIVE");
    const [isCustomToken, setIsCustomToken] = useState(false);
    const [customTokenContract, setCustomTokenContract] = useState("");
    const account = useAccount();
    const [amount, setAmount] = useState<string>("0");
    const ethAddressList = Object.values<AuthorEthAddress>(addressDict).map((item: AuthorEthAddress) => item.ethAddress);
    const { data: hash, error, isPending, writeContract } = useWriteContract();
    const [customMessage, setCustomMessage] = useState<string>("");
    const [showCustomMessageInput, setShowCustomMessageInput] = useState<boolean>(false);
    const [tokenPrices, setTokenPrices] = useState<{ [key: string]: { usd: number } }>({});
    const dividedAmount = ethAddressList.length > 0 ? (Number(amount) / ethAddressList.length) : 0;
    const ethAddressListFormatted = ethAddressList.map((address) => address.startsWith("0x") ? address : `0x${address}`) as readonly `0x${string}`[];

    useEffect(() => {
        const fetchTokenPrices = async () => {
            try {
                const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=hive,hive_dollar&vs_currencies=usd');
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                const data = await response.json();
                console.log("Dados da API:", data);
                setTokenPrices(data);
            } catch (error) {
                console.error("Error fetching token prices:", error);
            }
        };

        fetchTokenPrices();
    }, []);

    const { isLoading: isConfirming, isSuccess: isConfirmed } =
        useWaitForTransactionReceipt({
            hash,
        });

    useEffect(() => {
        if (isConfirmed) {
            setShowConfetti(true);
        }
    }, [isConfirmed, setShowConfetti]);

    useEffect(() => {
        const hivePrice = tokenPrices.hive?.usd;
        const hbdPrice = tokenPrices.hive_dollar?.usd;


        const numericAmount = parseFloat(amount);

        let totalAmountInUSD = 0;

        if (token === "HIVE") {
            totalAmountInUSD = numericAmount * hivePrice;
        } else if (token === "HBD") {
            totalAmountInUSD = numericAmount * hbdPrice;
        }

        // console.log("Total Amount in USD:", totalAmountInUSD);
        setShowCustomMessageInput(totalAmountInUSD > 1.00);
    }, [amount, tokenPrices, token]);

    const handleHiveBulkTransfer = async () => {
        if (!user.hiveUser?.name) {
            console.error("Username is missing");
            return;
        }
        try {
            const operations: Operation[] = [];
            const currency = token === "HBD" ? "HBD" : "HIVE";
            const amount = String(dividedAmount.toFixed(3)) + ` ${currency}`;
            addressDict.forEach((element: any) => {
                const operation: Operation =
                    [
                        "transfer",
                        {
                            "from": user.hiveUser?.name,
                            "to": element.author,
                            "amount": amount,
                            "memo": customMessage || `you just got a skatehive airdrop triggered by ${user.hiveUser?.name}`
                        }
                    ];
                operations.push(operation);
            });

            const loginMethod = localStorage.getItem("LoginMethod");
            if (!user) {
                console.error("Username is missing");
                return;
            }
            if (loginMethod === "keychain") {
                try {
                    const keychain = new KeychainSDK(window);
                    const formParamsAsObject = {
                        "data": {
                            "username": user.hiveUser?.name,
                            "operations": operations,
                            "method": KeychainKeyTypes.active
                        }
                    };
                    const broadcast = await keychain.broadcast(
                        formParamsAsObject.data as Broadcast
                    );
                    console.log({ broadcast });
                    setShowConfetti(true);
                } catch (error) {
                    console.log({ error });
                }
            } else if (loginMethod === "privateKey") {
                const encryptedPrivateKey = localStorage.getItem("EncPrivateKey");
                sendHiveOperation(encryptedPrivateKey, operations);
                setShowConfetti(true);
            }
        } catch (error) {
            console.error("Error handling bulk transfer:", error);
        }
    };


    useEffect(() => {
        console.log(isConfirmed, isConfirming)
    }
        , [isConfirmed, isConfirming])

    const allowance: any = useReadContract({
        address: tokenDictionary[token].address,
        abi: tokenDictionary[token].abi,
        functionName: 'allowance',
        args: [account.address as Address, SkateAirdropContract],
    });

    const handleBulkTransfer = async (inputValue: string) => {
        try {
            if (!account.isConnected && (token !== "HIVE" && token !== "HBD")) {
                console.error("Wallet not connected");
                return;
            }

            if (token === "HIVE" || token === "HBD") {
                handleHiveBulkTransfer();
                return;
            }

            const value = parseFloat(inputValue);

            if (isNaN(value) || value <= 0) {
                console.error("Invalid value. Please enter a positive number.");
                return;
            }

            const adjustedAmount = token === "USDC" ? BigInt(Math.round(value * 1e6)) : BigInt(Math.round(value * 1e18));
            const dividedAmount = adjustedAmount / BigInt(ethAddressList.length);
            const dividedAmountList = ethAddressListFormatted.map(() => dividedAmount);

            if (allowance?.data < adjustedAmount) {
                await writeContract({
                    address: tokenDictionary[token].address,
                    abi: tokenDictionary[token].abi,
                    functionName: 'approve',
                    args: [SkateAirdropContract, adjustedAmount.toString()],
                });
            }

            await writeContract({
                address: SkateAirdropContract,
                abi: airdropABI,
                functionName: 'bulkTransfer',
                args: [tokenDictionary[token].address, ethAddressListFormatted, dividedAmountList],
            });

            setShowConfetti(true);
        } catch (error) {
            console.error("Error during bulk transfer:", error);
        }
    };

    return (
        <>
            <HStack>
                <Text color="white">You are sponsoring with ${token}</Text>
                <Image
                    src={tokenDictionary[token]?.tokenLogo}
                    alt={`${token} Logo`}
                    width="40px"
                    height="40px"
                    mx="auto"
                    my={4}
                    loading="lazy"
                    objectFit="contain"
                />
            </HStack>
            <InputGroup zIndex="modal">
                <InputLeftAddon backgroundImage={'/pepenation.gif'} color={'white'} zIndex="dropdown">
                    <Box borderRadius={5} position="relative" zIndex="dropdown">
                        <Menu>
                            <MenuButton _active={{ bg: 'transparent' }} _hover={{ bg: 'transparent' }} as={Button} variant="ghost" size="sm">
                                <HStack ml={-5}>
                                    <Image
                                        src={tokenDictionary[token]?.tokenLogo}
                                        alt={`${token} Logo`}
                                        width="30px"
                                        height="30px"
                                        objectFit="contain"
                                        loading="lazy"
                                    />
                                    <Text color="white">Select Token</Text>
                                </HStack>
                            </MenuButton>
                            <MenuList ml='-16px' color={'white'} bg="black" zIndex="9999">
                                <MenuItem
                                    bg="black"
                                    _hover={{ bg: "blue.500" }}
                                    onClick={() => {
                                        setToken("SPACE");
                                        setIsCustomToken(false);
                                    }}
                                >
                                    <Image
                                        alt="space"
                                        mr={3}
                                        src="https://cdn.zerion.io/8c5eea78-246d-4fe2-9ab6-5bcd75ef0fb7.png"
                                        width="20px"
                                        height="20px"
                                        objectFit="contain"
                                        loading="lazy"
                                    />
                                    $SPACE
                                </MenuItem>
                                <MenuItem
                                    bg="black"
                                    _hover={{ bg: "green.500", color: "black" }}
                                    onClick={() => {
                                        setToken("SENDIT");
                                        setIsCustomToken(false);
                                    }}
                                >
                                    <Image
                                        alt="sendit"
                                        mr={3}
                                        src="https://sendit.city/assets/images/image03.jpg?v=c141f3fc"
                                        width="20px"
                                        height="20px"
                                        objectFit="contain"
                                        loading="lazy"
                                    />
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
                                    <Image
                                        alt="nogs"
                                        mr={3}
                                        src="/logos/nog.png"
                                        width="20px"
                                        height="20px"
                                        objectFit="contain"
                                        loading="lazy"
                                    />
                                    $NOGS
                                </MenuItem>

                                <MenuItem
                                    bg="black"
                                    _hover={{ bg: "purple.500" }}
                                    onClick={() => {
                                        setToken("DEGEN");
                                        setIsCustomToken(false);
                                    }}
                                >
                                    <Image
                                        alt="degen"
                                        mr={3}
                                        src={tokenDictionary['DEGEN'].tokenLogo}
                                        width="20px"
                                        height="20px"
                                        objectFit="contain"
                                        loading="lazy"
                                    />
                                    $DEGEN
                                </MenuItem>

                                <MenuItem
                                    bg="black"
                                    _hover={{ bg: "blue" }}
                                    onClick={() => {
                                        setToken("USDC");
                                        setIsCustomToken(false);
                                    }}
                                >
                                    <Image
                                        alt="usdc"
                                        mr={3}
                                        src="https://cdn.zerion.io/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.png"
                                        width="20px"
                                        height="20px"
                                        objectFit="contain"
                                        loading="lazy"
                                    />
                                    $USDC
                                </MenuItem>
                                <MenuItem
                                    bg="black"
                                    _hover={{ bg: "red.500", color: "black" }}
                                    onClick={() => {
                                        setToken("HIVE");
                                        setIsCustomToken(false);
                                    }}
                                >
                                    <Image
                                        alt="hive-logo"
                                        mr={3}
                                        src="/logos/hiveLogo.png"
                                        width="20px"
                                        height="20px"
                                        objectFit="contain"
                                        loading="lazy"
                                    />
                                    $HIVE
                                </MenuItem>
                                <MenuItem
                                    bg="black"
                                    _hover={{ bg: "limegreen", color: "black" }}
                                    onClick={() => {
                                        setToken("HBD");
                                        setIsCustomToken(false);
                                    }}
                                >
                                    <Image
                                        alt="hive-dollar-logo"
                                        mr={3}
                                        src="/logos/hbd.svg"
                                        width="20px"
                                        height="20px"
                                        objectFit="contain"
                                        loading="lazy"
                                    />
                                    $HBD
                                </MenuItem>
                            </MenuList>
                        </Menu>
                    </Box>
                </InputLeftAddon>
                <InputRightElement>
                    <Button
                        bg={'green.200'}
                        size="xs"
                        onClick={() => {
                            setAmount((prev) => String(Number(prev) + 1));
                        }}
                    >
                        +
                    </Button>
                </InputRightElement>
                <Input
                    size={"md"}
                    color={"white"}
                    type="number"
                    variant={"outline"}
                    placeholder="Amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                />
            </InputGroup>
            {showCustomMessageInput && (
                <Input
                    onChange={(e) => setCustomMessage(e.target.value)}
                    value={customMessage}
                    placeholder="Custom message"
                    color={"white"}
                    variant="outline"
                    borderColor="gray.600"
                />
            )}

            {isCustomToken && (
                <Input
                    color={"white"}
                    placeholder="Enter token address"
                    value={customTokenContract}
                    fontSize={"48px"}
                    onChange={(e) => setCustomTokenContract(e.target.value)}
                />
            )}

            <Button
                _hover={{
                    color: 'black',
                    backgroundImage: 'https://i.pinimg.com/originals/18/9f/db/189fdb5d2fc52eac4fa2a6de6edaf222.gif'
                }}
                w={'100%'}
                colorScheme="green"
                variant={"outline"}
                onClick={() => {
                    if (token === "HIVE") {
                        handleHiveBulkTransfer();
                    } else {
                        if (account.isConnected) {
                            handleBulkTransfer(amount);
                        } else {
                            console.error("Wallet not connected");
                        }
                    }
                }}
            >
                Send {amount} {token} to {ethAddressList.length} skaters !!!
            </Button>

            <Text color="white" fontSize="sm">
                {isConfirmed ? "Airdrop sent!" : isConfirming ? "Sending airdrop..." : ""}
            </Text>
        </>
    );

}

export default TokenSelector;
