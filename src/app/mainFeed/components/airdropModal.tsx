"use client";
import AuthorAvatar from "@/components/AuthorAvatar";
import { useHiveUser } from "@/contexts/UserContext";
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
} from "@chakra-ui/react";
import "@fontsource/creepster";
import { useEffect, useState } from "react";
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
  const { hiveUser } = useHiveUser();
  const client = HiveClient;
  const [walletDict, setWalletDict] = useState<AuthorWallets[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    const fetchEthAddresses = async () => {
      try {
        setIsLoading(true);

        // Extract unique authors
        const authorsList = sortedComments.map(({ author }) => author);
        const uniqueAuthors = Array.from(new Set(authorsList));

        // Fetch accounts in batches
        const batchSize = 50; // Adjust batch size as needed
        const newWalletDict: AuthorWallets[] = [];
        const fetchBatch = async (authors: string[]) => {
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
        };

        // Process authors in batches
        for (let i = 0; i < uniqueAuthors.length; i += batchSize) {
          const batch = uniqueAuthors.slice(i, i + batchSize);
          await fetchBatch(batch);
        }

        setWalletDict(newWalletDict);
      } catch (error) {
        console.error("Error fetching ETH addresses:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEthAddresses();
  }, [sortedComments]);

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
          <ModalBody>
            <VStack w={"100%"} align="center" spacing={4} position="relative">
              {isLoading ? (
                <VStack>
                  <Image
                    src="https://media.tenor.com/2mY8gJ1WWqsAAAAM/peppo-pepe.gif"
                    alt="airdrop"
                  />
                  <BeatLoader color={"#A5D6A7"} />
                  <Center>
                    <Text textAlign={"center"}>
                      Wait a bit. Pepe is checking who deserves some tokens...
                    </Text>
                  </Center>
                </VStack>
              ) : (
                <>
                  <Image src="/pepe-money.gif" alt="airdrop" />
                  <Text
                    fontFamily="Creepster"
                    fontSize="42px"
                    color={"#A5D6A7"}
                  >
                    Sponsor {walletDict.length} skaters !!!
                  </Text>
                  <TokenSelector
                    addressDict={walletDict}
                    setShowConfetti={setShowConfetti}
                  />
                  <Button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    colorScheme="green"
                    variant={"outline"}
                    size="sm"
                    mb={4}
                  >
                    {isCollapsed ? "Hide" : "Show"} MotherFuckers
                  </Button>
                  <Collapse in={isCollapsed}>
                    <Table variant="simple">
                      <Thead>
                        <Tr>
                          <Th>Author</Th>
                          <Th>ETH Address</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {walletDict.map(
                          ({ author, ethAddress }: AuthorWallets) => (
                            <Tr key={author}>
                              <Td>
                                <Center justifyContent={"flex-start"}>
                                  <AuthorAvatar username={author} boxSize={8} />
                                  <Text ml={2}>{author}</Text>
                                </Center>
                              </Td>
                              <Td>
                                <FormattedAddress address={ethAddress} />
                              </Td>
                            </Tr>
                          )
                        )}
                      </Tbody>
                    </Table>
                  </Collapse>
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
