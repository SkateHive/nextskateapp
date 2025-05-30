"use client";
import AuthorAvatar from "@/components/AuthorAvatar";
import { useUserData } from "@/contexts/UserContext";
import HiveClient from "@/lib/hive/hiveclient";
import {
  Button,
  Center,
  Collapse,
  Image,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  VStack,
  HStack,
  useToast,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Progress,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Box,
  Divider,
} from "@chakra-ui/react";
import "@fontsource/creepster";
import { useEffect, useState, useCallback, useRef } from "react";
import Confetti from "react-confetti";
import { BeatLoader } from "react-spinners";
import TokenSelector from "./TokenSelector";
import { FormattedAddress } from "@/components/NNSAddress";

interface AirdropModalProps {
  sortedComments: any[];
  isOpen: boolean;
  onClose: () => void;
}

interface AuthorWallets {
  author: string;
  ethAddress: string;
}

const AirdropModal = ({
  sortedComments,
  isOpen,
  onClose,
}: AirdropModalProps) => {
  const hiveUser = useUserData();
  const toast = useToast();
  const client = HiveClient;
  const [walletDict, setWalletDict] = useState<AuthorWallets[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [retryTrigger, setRetryTrigger] = useState(0);
  const [hasLoaded, setHasLoaded] = useState(false);
  const fetchingRef = useRef(false);

  useEffect(() => {
    const fetchEthAddresses = async () => {
      // Prevent duplicate fetching
      if (fetchingRef.current) {
        return;
      }

      try {
        fetchingRef.current = true;
        setIsLoading(true);
        setError(null);
        setLoadingProgress(10);

        // Extract unique authors
        const authorsList = sortedComments.map(({ author }) => author);
        const uniqueAuthors = Array.from(new Set(authorsList));
        
        if (uniqueAuthors.length === 0) {
          setError("No authors found in comments");
          setIsLoading(false);
          return;
        }

        setLoadingProgress(25);

        // Fetch accounts in batches
        const batchSize = 50; // Adjust batch size as needed
        const newWalletDict: AuthorWallets[] = [];
        const totalBatches = Math.ceil(uniqueAuthors.length / batchSize);
        
        const fetchBatch = async (authors: string[], batchIndex: number) => {
          try {
            const accounts = await client.database.getAccounts(authors);
            accounts.forEach((authorAccount) => {
              const metadata = JSON.parse(authorAccount.json_metadata || "{}");
              if (metadata.extensions?.eth_address) {
                const ethAddress = metadata.extensions.eth_address;
                // Avoid duplicates
                if (
                  !newWalletDict.some((item) => item.ethAddress === ethAddress)
                ) {
                  newWalletDict.push({ author: authorAccount.name, ethAddress });
                }
              }
            });
            
            // Update progress
            const progress = 25 + ((batchIndex + 1) / totalBatches) * 65;
            setLoadingProgress(progress);
            
          } catch (batchError) {
            console.error(`Error fetching batch ${batchIndex}:`, batchError);
            // Continue with other batches even if one fails
          }
        };

        // Process authors in batches
        for (let i = 0; i < uniqueAuthors.length; i += batchSize) {
          const batch = uniqueAuthors.slice(i, i + batchSize);
          const batchIndex = Math.floor(i / batchSize);
          await fetchBatch(batch, batchIndex);
        }

        setLoadingProgress(100);
        setWalletDict(newWalletDict);
        setHasLoaded(true);
        
        // Show success message only if not already shown
        if (!hasLoaded) {
          if (newWalletDict.length > 0) {
            toast({
              title: "Wallet Addresses Loaded",
              description: `Found ${newWalletDict.length} valid wallet addresses out of ${uniqueAuthors.length} authors`,
              status: "success",
              duration: 5000,
              isClosable: true,
            });
          } else {
            toast({
              title: "No Wallet Addresses Found",
              description: "None of the authors have registered ETH addresses",
              status: "warning",
              duration: 8000,
              isClosable: true,
            });
          }
        }
        
      } catch (error: any) {
        console.error("Error fetching ETH addresses:", error);
        setError(error.message || "Failed to fetch wallet addresses");
        
        toast({
          title: "Error Loading Addresses",
          description: "Failed to fetch wallet addresses. Please try again.",
          status: "error",
          duration: 8000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
        fetchingRef.current = false;
      }
    };

    // Only fetch if modal is open, has comments, and hasn't loaded yet
    if (isOpen && sortedComments.length > 0 && !hasLoaded && !fetchingRef.current) {
      fetchEthAddresses();
    }
  }, [sortedComments, isOpen, hasLoaded, retryTrigger]); // Removed toast and client.database from deps

  // Reset states when modal closes
  useEffect(() => {
    if (!isOpen) {
      setHasLoaded(false);
      setError(null);
      setLoadingProgress(0);
      fetchingRef.current = false;
      setIsLoading(true); // Reset to loading state for next open
    }
  }, [isOpen]);

  return (
    <>
      {showConfetti && <Confetti />}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay style={{ backdropFilter: "blur(5px)" }} />
        <ModalContent
          color="white"
          bg="black"
          border="0.6px solid grey"
          borderRadius="md"
          mx={1}
          w="100%"
          maxW="600px"
        >
          <ModalHeader>
            <Center>Create an Airdrop</Center>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack w={"100%"} align="center" spacing={4} position="relative">
              {isLoading ? (
                <VStack spacing={4} align="center" w="100%">
                  <Image
                    src="https://media.tenor.com/2mY8gJ1WWqsAAAAM/peppo-pepe.gif"
                    alt="Loading airdrop data"
                    maxH="200px"
                  />
                  <BeatLoader color={"#A5D6A7"} />
                  <VStack spacing={2} align="center">
                    <Text textAlign="center" fontSize="lg" fontWeight="medium">
                      Wait a bit. Pepe is checking who deserves some tokens...
                    </Text>
                    <Progress 
                      value={loadingProgress} 
                      w="300px" 
                      colorScheme="green" 
                      borderRadius="md"
                      bg="gray.700"
                    />
                    <Text fontSize="sm" color="gray.400">
                      {loadingProgress < 25 ? "Analyzing comments..." :
                       loadingProgress < 75 ? "Fetching wallet addresses..." :
                       "Almost done..."}
                    </Text>
                  </VStack>
                </VStack>
              ) : error ? (
                <VStack spacing={4} align="center">
                  <Alert status="error" borderRadius="md">
                    <AlertIcon />
                    <VStack align="start" spacing={1}>
                      <AlertTitle>Failed to Load Addresses</AlertTitle>
                      <AlertDescription>{error}</AlertDescription>
                    </VStack>
                  </Alert>
                  <Button 
                    colorScheme="red" 
                    variant="outline"
                    onClick={() => {
                      setError(null);
                      setHasLoaded(false);
                      fetchingRef.current = false;
                      setRetryTrigger(prev => prev + 1);
                    }}
                  >
                    Try Again
                  </Button>
                </VStack>
              ) : (
                <>
                  <Image src="/pepe-money.gif" alt="airdrop celebration" maxH="150px" />
                  
                  {/* Enhanced Statistics */}
                  <VStack spacing={3} w="100%">
                    <Text
                      fontFamily="Creepster"
                      fontSize={walletDict.length > 0 ? "36px" : "28px"}
                      color={walletDict.length > 0 ? "#A5D6A7" : "orange.300"}
                      textAlign="center"
                      bgGradient={walletDict.length > 0 ? "linear(to-r, #A5D6A7, #4CAF50)" : undefined}
                      bgClip={walletDict.length > 0 ? "text" : undefined}
                    >
                      {walletDict.length > 0 
                        ? `Sponsor ${walletDict.length} skaters !!!` 
                        : "No wallet addresses found"
                      }
                    </Text>

                  </VStack>

                  {walletDict.length > 0 && (
                    <>
                      <TokenSelector
                        addressDict={walletDict}
                        setShowConfetti={setShowConfetti}
                      />
                    </>
                  )}

                  {walletDict.length > 0 && (
                    <Button
                      onClick={() => setIsCollapsed(!isCollapsed)}
                      colorScheme="green"
                      variant={"outline"}
                      size="sm"
                      mb={4}
                    >
                      {isCollapsed ? "Hide" : "Show"} Recipients List
                    </Button>
                  )}
                  {walletDict.length > 0 && (
                    <Collapse in={isCollapsed}>
                      <Box 
                        maxH="300px" 
                        overflowY="auto" 
                        border="1px solid gray.600" 
                        borderRadius="md"
                        bg="gray.900"
                        sx={{
                          '&::-webkit-scrollbar': {
                            width: '6px',
                          },
                          '&::-webkit-scrollbar-track': {
                            backgroundColor: 'gray.800',
                            borderRadius: '3px',
                          },
                          '&::-webkit-scrollbar-thumb': {
                            backgroundColor: 'gray.600',
                            borderRadius: '3px',
                            '&:hover': {
                              backgroundColor: 'gray.500',
                            },
                          },
                        }}
                      >
                        <Table variant="simple" size="sm">
                          <Thead bg="gray.800" position="sticky" top={0} zIndex={1}>
                            <Tr>
                              <Th color="gray.300" fontSize="xs" py={3}>
                                Recipient ({walletDict.length})
                              </Th>
                              <Th color="gray.300" fontSize="xs" py={3}>
                                Wallet Address
                              </Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {walletDict.map(
                              ({ author, ethAddress }: AuthorWallets, index) => (
                                <Tr 
                                  key={author} 
                                  _hover={{ bg: "gray.700" }}
                                  transition="background-color 0.2s"
                                >
                                  <Td py={3}>
                                    <HStack spacing={3}>
                                      <AuthorAvatar username={author} boxSize={8} />
                                      <VStack align="start" spacing={0}>
                                        <Text fontSize="sm" color="gray.200" fontWeight="medium">
                                          {author}
                                        </Text>
                                        <Text fontSize="xs" color="gray.500">
                                          #{index + 1}
                                        </Text>
                                      </VStack>
                                    </HStack>
                                  </Td>
                                  <Td py={3}>
                                    <FormattedAddress address={ethAddress} />
                                  </Td>
                                </Tr>
                              )
                            )}
                          </Tbody>
                        </Table>
                      </Box>
                    </Collapse>
                  )}
                </>
              )}
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default AirdropModal;
