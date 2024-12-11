'use client';
import AuthorAvatar from "@/components/AuthorAvatar";
import { useHiveUser } from "@/contexts/UserContext";
import HiveClient from "@/lib/hive/hiveclient";
import { formatETHaddress } from "@/lib/utils";
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
import '@fontsource/creepster';
import { useEffect, useState } from "react";
import Confetti from 'react-confetti';
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

const AirdropModal = ({ sortedComments, isOpen, onClose }: AirdropModalProps) => {
    const { hiveUser } = useHiveUser();
    const client = HiveClient;
    const [walletDict, setWalletDict] = useState<AuthorWallets[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);

    useEffect(() => {
        const fetchEthAddresses = async () => {
            try {
                const authorsList = sortedComments.map(({ author }) => author);
                const uniqueAuthors = Array.from(new Set(authorsList));
                const newWalletDict: AuthorWallets[] = [];

                for (const author of uniqueAuthors) {
                    const authorAccount = await client.database.getAccounts([author]);
                    const metadata = JSON.parse(authorAccount[0].json_metadata || "{}");

                    if (metadata.extensions && metadata.extensions.eth_address) {
                        const ethAddress = metadata.extensions.eth_address;
                        if (!walletDict.some(item => item.ethAddress === ethAddress)) {
                            newWalletDict.push({ author, ethAddress });
                        }
                    }
                }
                setIsLoading(false);
                setWalletDict(newWalletDict);
            } catch (error) {
                console.error("Error fetching ETH addresses:", error);
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
                <ModalContent color="white" w={{ base: "100%", md: "800px" }} bg="black" border="0.6px solid grey" borderRadius="md" mx={4}>
                    <ModalHeader><Center>Create an Airdrop</Center></ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <VStack w={"100%"} align="center" spacing={4} position="relative">

                            {isLoading ? (
                                <VStack>
                                    <Image src="https://media.tenor.com/2mY8gJ1WWqsAAAAM/peppo-pepe.gif" alt="airdrop" />
                                    <BeatLoader color={"#A5D6A7"} />
                                    <Center>
                                        <Text textAlign={"center"}>Wait a bit. Pepe is checkin who here deserves some tokens</Text>
                                    </Center>
                                </VStack>
                            ) : (
                                <>
                                    {!hiveUser ? (
                                        <Text fontFamily="Creepster" fontSize="42px" color={"#A5D6A7"} textAlign="center">
                                            Please login to your Hive account!
                                        </Text>
                                    ) : (
                                        <>
                                            <Image src="/pepe-money.gif" alt="airdrop" />
                                            <Text fontFamily="Creepster" fontSize="42px" color={"#A5D6A7"}> Sponsor {walletDict.length} skaters !!!</Text>
                                            <TokenSelector addressDict={walletDict} setShowConfetti={setShowConfetti} />
                                            <Button
                                                onClick={() => setIsCollapsed(!isCollapsed)}
                                                colorScheme="green"
                                                variant={"outline"}
                                                size="sm"
                                                mb={4}
                                            >
                                                {isCollapsed ? "Hide" : "Show"} Motherfuckers
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
                                                        {walletDict.map(({ author, ethAddress }: AuthorWallets) => (
                                                            <Tr key={author}>
                                                                <Td>
                                                                    <Center justifyContent={"flex-start"}>
                                                                        <AuthorAvatar username={author} boxSize={8} />
                                                                        <Text ml={2}>
                                                                            {author}
                                                                        </Text>
                                                                    </Center>
                                                                </Td>
                                                                <Td> <FormattedAddress address={ethAddress} /></Td>

                                                            </Tr>
                                                        ))}
                                                    </Tbody>
                                                </Table>
                                            </Collapse>
                                        </>
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