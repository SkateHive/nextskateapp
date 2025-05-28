"use client";
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
  Text,
  useToast,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Progress,
  VStack,
  Spinner,
  Link,
} from "@chakra-ui/react";
import { Operation } from "@hiveio/dhive";
import { Broadcast, KeychainKeyTypes, KeychainSDK } from "keychain-sdk";
import { useEffect, useState } from "react";
import {
  useAccount,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
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

// Enhanced transaction state types
type TransactionState = 
  | 'idle' 
  | 'preparing' 
  | 'approval-pending' 
  | 'approval-confirming'
  | 'transfer-pending' 
  | 'transfer-confirming' 
  | 'completed' 
  | 'failed';

interface TransactionStatus {
  state: TransactionState;
  message: string;
  hash?: string;
  error?: string;
  progress?: number;
}

const SkateAirdropContract = "0x8bD8F0D46c84feCBFbF270bac4Ad28bFA2c78F05";

const TokenSelector = ({
  addressDict,
  setShowConfetti,
}: TokenSelectorProps) => {
  const user = useHiveUser();
  const toast = useToast();
  const [token, setToken] = useState("HIGHER");
  const [isCustomToken, setIsCustomToken] = useState(false);
  const [customTokenContract, setCustomTokenContract] = useState("");
  const account = useAccount();
  const [amount, setAmount] = useState<string>("0");
  
  // Enhanced transaction state management
  const [transactionStatus, setTransactionStatus] = useState<TransactionStatus>({
    state: 'idle',
    message: '',
  });
  
  const ethAddressList = Object.values<AuthorEthAddress>(addressDict).map(
    (item: AuthorEthAddress) => item.ethAddress
  );
  const { data: hash, error, isPending, writeContract } = useWriteContract();
  const [customMessage, setCustomMessage] = useState<string>("");
  const [showCustomMessageInput, setShowCustomMessageInput] =
    useState<boolean>(false);
  const [tokenPrices, setTokenPrices] = useState<{
    [key: string]: { usd: number };
  }>({});
  const dividedAmount =
    ethAddressList.length > 0 ? Number(amount) / ethAddressList.length : 0;
  const ethAddressListFormatted = ethAddressList.map((address) =>
    address.startsWith("0x") ? address : `0x${address}`
  ) as readonly `0x${string}`[];

  useEffect(() => {
    const fetchTokenPrices = async () => {
      try {
        const response = await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=hive,hive_dollar&vs_currencies=usd"
        );
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

  // Enhanced transaction monitoring
  useEffect(() => {
    if (hash) {
      setTransactionStatus({
        state: 'transfer-pending',
        message: 'Transaction submitted, waiting for confirmation...',
        hash: hash,
        progress: 25
      });
      
      toast({
        title: "Transaction Submitted",
        description: "Your airdrop transaction has been submitted to the blockchain",
        status: "info",
        duration: 5000,
        isClosable: true,
      });
    }
  }, [hash, toast]);

  useEffect(() => {
    if (isConfirming) {
      setTransactionStatus({
        state: 'transfer-confirming',
        message: 'Transaction is being confirmed...',
        hash: hash,
        progress: 75
      });
    }
  }, [isConfirming, hash]);

  useEffect(() => {
    if (isConfirmed) {
      setTransactionStatus({
        state: 'completed',
        message: 'Airdrop completed successfully!',
        hash: hash,
        progress: 100
      });
      
      setShowConfetti(true);
      
      toast({
        title: "Airdrop Successful! 🎉",
        description: `Successfully sent ${amount} ${token} to ${ethAddressList.length} skaters!`,
        status: "success",
        duration: 8000,
        isClosable: true,
      });
      
      // Reset status after celebration
      setTimeout(() => {
        setTransactionStatus({ state: 'idle', message: '' });
      }, 10000);
    }
  }, [isConfirmed, setShowConfetti, amount, token, ethAddressList.length, hash, toast]);

  // Error handling
  useEffect(() => {
    if (error) {
      setTransactionStatus({
        state: 'failed',
        message: 'Transaction failed',
        error: error.message
      });
      
      toast({
        title: "Transaction Failed",
        description: error.message || "An error occurred during the transaction",
        status: "error",
        duration: 8000,
        isClosable: true,
      });
    }
  }, [error, toast]);

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
    setShowCustomMessageInput(totalAmountInUSD > 1.0);
  }, [amount, tokenPrices, token]);

  const handleHiveBulkTransfer = async () => {
    if (!user.hiveUser?.name) {
      toast({
        title: "Authentication Required",
        description: "Please login to perform this action",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    
    // Validate amount before proceeding
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid positive amount",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setTransactionStatus({
      state: 'preparing',
      message: 'Preparing Hive transfer operations...',
      progress: 10
    });
    
    try {
      const operations: Operation[] = [];
      const currency = token === "HBD" ? "HBD" : "HIVE";
      const transferAmount = String(dividedAmount.toFixed(3)) + ` ${currency}`;
      
      addressDict.forEach((element: any) => {
        const operation: Operation = [
          "transfer",
          {
            from: user.hiveUser?.name,
            to: element.author,
            amount: transferAmount,
            memo:
              customMessage ||
              `you just got a skatehive airdrop triggered by ${user.hiveUser?.name}`,
          },
        ];
        operations.push(operation);
      });

      setTransactionStatus({
        state: 'transfer-pending',
        message: 'Awaiting signature...',
        progress: 50
      });

      const loginMethod = localStorage.getItem("LoginMethod");
      if (!user) {
        throw new Error("User authentication missing");
      }
      
      if (loginMethod === "keychain") {
        try {
          const keychain = new KeychainSDK(window);
          const formParamsAsObject = {
            data: {
              username: user.hiveUser?.name,
              operations: operations,
              method: KeychainKeyTypes.active,
            },
          };
          
          const broadcast = await keychain.broadcast(
            formParamsAsObject.data as Broadcast
          );
          
          console.log({ broadcast });
          
          setTransactionStatus({
            state: 'completed',
            message: 'Hive airdrop completed successfully!',
            progress: 100
          });
          
          setShowConfetti(true);
          
          toast({
            title: "Hive Airdrop Successful! 🎉",
            description: `Successfully sent ${amount} ${token} to ${addressDict.length} skaters!`,
            status: "success",
            duration: 8000,
            isClosable: true,
          });
          
        } catch (error: any) {
          throw new Error(`Keychain error: ${error.message || error}`);
        }
      } else if (loginMethod === "privateKey") {
        const encryptedPrivateKey = localStorage.getItem("EncPrivateKey");
        await sendHiveOperation(encryptedPrivateKey, operations);
        
        setTransactionStatus({
          state: 'completed',
          message: 'Hive airdrop completed successfully!',
          progress: 100
        });
        
        setShowConfetti(true);
        
        toast({
          title: "Hive Airdrop Successful! 🎉",
          description: `Successfully sent ${amount} ${token} to ${addressDict.length} skaters!`,
          status: "success",
          duration: 8000,
          isClosable: true,
        });
      }
    } catch (error: any) {
      console.error("Error handling bulk transfer:", error);
      
      setTransactionStatus({
        state: 'failed',
        message: 'Hive transfer failed',
        error: error.message
      });
      
      toast({
        title: "Hive Transfer Failed",
        description: error.message || "An error occurred during the Hive transfer",
        status: "error",
        duration: 8000,
        isClosable: true,
      });
    }
  };

  useEffect(() => {
    console.log(isConfirmed, isConfirming);
  }, [isConfirmed, isConfirming]);

  const allowance: any = useReadContract({
    address: tokenDictionary[token].address,
    abi: tokenDictionary[token].abi,
    functionName: "allowance",
    args: [account.address as Address, SkateAirdropContract],
  });

  const handleBulkTransfer = async (inputValue: string) => {
    try {
      if (!account.isConnected && token !== "HIVE" && token !== "HBD") {
        toast({
          title: "Wallet Not Connected",
          description: "Please connect your wallet to perform this action",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        return;
      }

      if (token === "HIVE" || token === "HBD") {
        handleHiveBulkTransfer();
        return;
      }

      const value = parseFloat(inputValue);

      if (isNaN(value) || value <= 0) {
        toast({
          title: "Invalid Amount",
          description: "Please enter a valid positive amount",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        return;
      }

      setTransactionStatus({
        state: 'preparing',
        message: 'Calculating amounts and checking allowances...',
        progress: 10
      });

      const adjustedAmount =
        token === "USDC"
          ? BigInt(Math.round(value * 1e6))
          : BigInt(Math.round(value * 1e18));
      const dividedAmount = adjustedAmount / BigInt(ethAddressList.length);
      const dividedAmountList = ethAddressListFormatted.map(
        () => dividedAmount
      );

      // Check if approval is needed
      if (allowance?.data < adjustedAmount) {
        setTransactionStatus({
          state: 'approval-pending',
          message: 'Approval required. Please approve the token spending...',
          progress: 25
        });

        toast({
          title: "Approval Required",
          description: "You need to approve token spending before the airdrop",
          status: "info",
          duration: 5000,
          isClosable: true,
        });

        await writeContract({
          address: tokenDictionary[token].address,
          abi: tokenDictionary[token].abi,
          functionName: "approve",
          args: [SkateAirdropContract, adjustedAmount.toString()],
        });

        setTransactionStatus({
          state: 'approval-confirming',
          message: 'Waiting for approval confirmation...',
          progress: 50
        });

        // Wait for approval confirmation before proceeding
        return;
      }

      setTransactionStatus({
        state: 'transfer-pending',
        message: 'Initiating bulk transfer...',
        progress: 75
      });

      await writeContract({
        address: SkateAirdropContract,
        abi: airdropABI,
        functionName: "bulkTransfer",
        args: [
          tokenDictionary[token].address,
          ethAddressListFormatted,
          dividedAmountList,
        ],
      });

    } catch (error: any) {
      console.error("Error during bulk transfer:", error);
      
      setTransactionStatus({
        state: 'failed',
        message: 'Bulk transfer failed',
        error: error.message
      });
      
      toast({
        title: "Transfer Failed",
        description: error.message || "An error occurred during the bulk transfer",
        status: "error",
        duration: 8000,
        isClosable: true,
      });
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
        <InputLeftAddon
          backgroundImage={"/pepenation.gif"}
          color={"white"}
          zIndex="dropdown"
        >
          <Box borderRadius={5} position="relative" zIndex="dropdown">
            <Menu>
              <MenuButton
                _active={{ bg: "transparent" }}
                _hover={{ bg: "transparent" }}
                as={Button}
                variant="ghost"
                size="sm"
              >
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
              <MenuList ml="-16px" color={"white"} bg="black" zIndex="9999">
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
                  _hover={{ bg: "blue.500" }}
                  onClick={() => {
                    setToken("HIGHER");
                    setIsCustomToken(false);
                  }}
                >
                  <Image
                    alt="higher"
                    mr={3}
                    src="/higher.png"
                    width="20px"
                    height="20px"
                    objectFit="contain"
                    loading="lazy"
                  />
                  $HIGHER
                </MenuItem>
                {/* <MenuItem
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
                </MenuItem> */}
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
                    src={tokenDictionary["DEGEN"].tokenLogo}
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
            bg={"green.200"}
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
          color: "black",
          backgroundImage:
            "https://i.pinimg.com/originals/18/9f/db/189fdb5d2fc52eac4fa2a6de6edaf222.gif",
        }}
        w={"100%"}
        colorScheme="green"
        variant={"outline"}
        isDisabled={
          parseFloat(amount) <= 0 || 
          !amount.trim() || 
          transactionStatus.state === 'preparing' ||
          transactionStatus.state === 'approval-pending' ||
          transactionStatus.state === 'transfer-pending' ||
          isConfirming
        }
        isLoading={
          transactionStatus.state === 'preparing' ||
          transactionStatus.state === 'approval-pending' ||
          transactionStatus.state === 'transfer-pending' ||
          isConfirming
        }
        loadingText={
          transactionStatus.state === 'preparing' ? "Preparing..." :
          transactionStatus.state === 'approval-pending' ? "Approving..." :
          transactionStatus.state === 'transfer-pending' ? "Transferring..." :
          isConfirming ? "Confirming..." : "Processing..."
        }
        onClick={() => {
          const numericAmount = parseFloat(amount);
          if (numericAmount <= 0 || isNaN(numericAmount)) {
            toast({
              title: "Invalid Amount",
              description: "Please enter a valid positive amount",
              status: "error",
              duration: 5000,
              isClosable: true,
            });
            return;
          }
          
          if (token === "HIVE" || token === "HBD") {
            handleHiveBulkTransfer();
          } else {
            if (account.isConnected) {
              handleBulkTransfer(amount);
            } else {
              toast({
                title: "Wallet Not Connected",
                description: "Please connect your wallet to perform this action",
                status: "error",
                duration: 5000,
                isClosable: true,
              });
            }
          }
        }}
      >
        Send {amount} {token} to {ethAddressList.length} skaters !!!
      </Button>

      {/* Enhanced Transaction Status Display */}
      <VStack spacing={3} align="stretch" mt={4} w="100%">
        {transactionStatus.state !== 'idle' && (
          <>
            {transactionStatus.state === 'preparing' && (
              <Alert status="info" borderRadius="md">
                <Spinner size="sm" mr={3} />
                <VStack align="start" spacing={1}>
                  <Text fontWeight="bold" fontSize="sm" color="blue.800">Preparing Transaction</Text>
                  <Text fontSize="xs" color="blue.600">{transactionStatus.message}</Text>
                </VStack>
              </Alert>
            )}

            {(transactionStatus.state === 'approval-pending' || transactionStatus.state === 'approval-confirming') && (
              <Alert status="warning" borderRadius="md">
                <Spinner size="sm" mr={3} />
                <VStack align="start" spacing={1}>
                  <Text fontWeight="bold" fontSize="sm" color="orange.800">Token Approval Required</Text>
                  <Text fontSize="xs" color="orange.600">{transactionStatus.message}</Text>
                </VStack>
              </Alert>
            )}

            {(transactionStatus.state === 'transfer-pending' || transactionStatus.state === 'transfer-confirming') && (
              <Alert status="warning" borderRadius="md">
                <Spinner size="sm" mr={3} />
                <VStack align="start" spacing={1}>
                  <Text fontWeight="bold" fontSize="sm" color="orange.800">Transfer in Progress</Text>
                  <Text fontSize="xs" color="orange.600">{transactionStatus.message}</Text>
                  {transactionStatus.hash && (
                    <Link
                      href={`https://bscscan.com/tx/${transactionStatus.hash}`}
                      isExternal
                      color="blue.300"
                      fontSize="xs"
                    >
                      View Transaction →
                    </Link>
                  )}
                </VStack>
              </Alert>
            )}

            {transactionStatus.state === 'completed' && (
              <Alert status="success" borderRadius="md">
                <AlertIcon />
                <VStack align="start" spacing={1}>
                  <Text fontWeight="bold" fontSize="sm" color="green.800">Airdrop Completed! 🎉</Text>
                  <Text fontSize="xs" color="green.600">Your tokens have been distributed successfully!</Text>
                  {transactionStatus.hash && (
                    <Link
                      href={`https://bscscan.com/tx/${transactionStatus.hash}`}
                      isExternal
                      color="green.500"
                      fontSize="xs"
                      fontWeight="medium"
                    >
                      View Transaction →
                    </Link>
                  )}
                </VStack>
              </Alert>
            )}

            {transactionStatus.state === 'failed' && (
              <Alert status="error" borderRadius="md">
                <AlertIcon />
                <VStack align="start" spacing={2}>
                  <Text fontWeight="bold" fontSize="sm" color="red.800">Transaction Failed</Text>
                  <Text fontSize="xs" color="red.600">{transactionStatus.error || transactionStatus.message}</Text>
                  <Button 
                    size="xs" 
                    colorScheme="red" 
                    variant="outline"
                    onClick={() => setTransactionStatus({ state: 'idle', message: '' })}
                  >
                    Try Again
                  </Button>
                </VStack>
              </Alert>
            )}

            {transactionStatus.progress && (
              <Progress 
                value={transactionStatus.progress} 
                colorScheme={
                  transactionStatus.state === 'completed' ? 'green' :
                  transactionStatus.state === 'failed' ? 'red' : 'blue'
                }
                borderRadius="md"
                bg="gray.200"
                size="sm"
              />
            )}
          </>
        )}

        {/* Simple status for legacy compatibility when no enhanced status */}
        {transactionStatus.state === 'idle' && (
          <Text color="white" fontSize="sm" textAlign="center">
            {isConfirmed
              ? "Airdrop sent!"
              : isConfirming
                ? "Sending airdrop..."
                : ""}
          </Text>
        )}
      </VStack>
    </>
  );
};

export default TokenSelector;
