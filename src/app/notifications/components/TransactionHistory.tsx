import AuthorAvatar from "@/components/AuthorAvatar";
import { useHiveUser } from "@/contexts/UserContext";
import { getAccountHistory } from "@/lib/hive/client-functions";
import { Button, Container, Flex, HStack, Image, Spinner, Stack, StackDivider, Tab, TabList, TabPanel, TabPanels, Tabs, Text } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { FaHive } from "react-icons/fa";

export interface Transaction {
    block: number;
    op: any;
    op_in_trx: number;
    timestamp: string;
    trx_id: string;
    trx_in_block: number;
    virtual_op: boolean;
}


const CLAIM_REWARDS_IMAGE = "/logos/hiveLogo.png";

const ITEMS_PER_PAGE = 20;

const TransactionHistory = () => {
    const user = useHiveUser();
    const username = user?.hiveUser?.name;
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(0); // Start at page 0
    const [batchSize, setBatchSize] = useState(ITEMS_PER_PAGE);

    // Fetch transactions
    useEffect(() => {
        const fetchTransactions = async () => {
            if (!username) return;

            setIsLoading(true);
            try {
                const data = await getAccountHistory(String(username), batchSize * (currentPage + 1)); // Fetch in batches
                if (Array.isArray(data)) {
                    const mappedData = data.map(([block, op]: [number, any]) => ({
                        block,
                        op,
                        op_in_trx: op.op_in_trx,
                        timestamp: op.timestamp,
                        trx_id: op.trx_id,
                        trx_in_block: op.trx_in_block,
                        virtual_op: op.virtual_op,
                    }));
                    setTransactions(mappedData.reverse()); // Reverse the array to get newest first
                } else {
                    console.error("Failed to fetch transactions, data is not an array:", data);
                }
            } catch (error) {
                console.error("Error fetching transactions:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTransactions();
    }, [username, currentPage, batchSize]);

    // Define different card designs based on the transaction type
    const renderTransactionCard = (type: string, details: any, index: number) => {
        switch (type) {
            case "claim_reward_balance":
                return (
                    <HStack key={index} p={4} borderBottom="1px solid gray">
                        <Image src={CLAIM_REWARDS_IMAGE} boxSize={10} />
                        <Text fontSize="lg">
                            <HStack>
                                <Text>Claim Reward:</Text>
                                {details.reward_hive && (
                                    <Text>{`${details.reward_hive} HIVE`}</Text>
                                )}
                                {details.reward_hbd && (
                                    <Text>{`${details.reward_hbd} HBD`}</Text>
                                )}
                                {details.reward_vests && (
                                    <Text>{`${details.reward_vests} VESTS`}</Text>
                                )}
                            </HStack>
                        </Text>
                    </HStack>
                );
            case "transfer":
                return (
                    <HStack key={index} p={4} borderBottom="1px solid gray">
                        <AuthorAvatar username={details.from} boxSize={10} />


                        <Text fontSize="lg">
                            <HStack>
                                <Text fontSize="lg">

                                    Transfer from {details.from} to {details.to}: {details.amount}
                                </Text>
                                <FaHive color="red" size={16} />
                            </HStack>
                            {details.memo && <Text><strong>Memo:</strong> {details.memo}</Text>}

                        </Text>
                    </HStack>
                );
            case "effective_comment_vote":
                return (
                    <HStack key={index} p={4} borderBottom="1px solid gray">
                        <AuthorAvatar username={details.author} boxSize={10} />
                        <Text fontSize="lg">
                            Vote on {details.author} s
                            <a href={`https://legacy.skatehive.app/post/@${details.author}/${details.permlink}`} target="_blank" rel="noopener noreferrer">
                                comment
                            </a>
                            : Payout: {details.pending_payout}
                        </Text>

                    </HStack>
                );
            case "curation_reward":
                return (
                    <HStack key={index} p={4} borderBottom="1px solid gray">
                        <AuthorAvatar username={details.comment_author} boxSize={10} />
                        <Text fontSize="lg">
                            Curation Reward: {details.reward} VESTS for voting on {details.comment_author}s post
                        </Text>
                    </HStack>
                );
            case "comment":
                return (
                    <HStack key={index} p={4} borderBottom="1px solid gray">
                        <AuthorAvatar username={details.author} boxSize={10} />
                        <Text fontSize="lg">
                            Comment by {details.author}: {details.body}
                        </Text>
                    </HStack>
                );
            case "vote":
                return (
                    <HStack key={index} p={4} borderBottom="1px solid gray">
                        <AuthorAvatar username={details.voter} boxSize={10} />
                        <Text fontSize="lg">
                            Vote by {details.voter} on {details.author}s

                            <a href={`https://legacy.skatehive.app/post/@${details.author}/${details.permlink}`} target="_blank" rel="noopener noreferrer" >
                                post
                            </a>

                            Weight: {(details.weight / 100).toFixed(2)}%
                        </Text>
                    </HStack>
                );
            case "comment_benefactor_reward":
                return (
                    <HStack key={index} p={4} borderBottom="1px solid gray">
                        <AuthorAvatar username={details.benefactor} boxSize={10} />
                        <Text fontSize="lg">
                            Benefactor Reward for {details.benefactor} on
                            <a href={`https://legacy.skatehive.app/post/@${details.author}/${details.permlink}`} target="_blank" rel="noopener noreferrer">
                                {details.author}&apos;s comment
                            </a>
                            : {details.hbd_payout} HBD, {details.hive_payout} HIVE, {details.vesting_payout} VESTS
                        </Text>
                    </HStack>
                );

            default:
                return (
                    <Flex key={index} p={4} borderBottom="1px solid gray">
                        <Text fontSize="lg">
                            {type}: {JSON.stringify(details)}
                        </Text>
                    </Flex>
                );
        }
    };

    // Handle pagination
    const nextPage = () => {
        setCurrentPage(prev => prev + 1);
    };

    const prevPage = () => {
        if (currentPage > 0) {
            setCurrentPage(prev => prev - 1);
        }
    };

    return (
        <Container maxW="container.lg" p={0}>
            <Stack
                w={"100%"}
                h={"100vh"}
                overflow={"auto"}
                sx={{
                    "::-webkit-scrollbar": {
                        display: "none"
                    }
                }}
                gap={0}
                divider={<StackDivider style={{ margin: 0 }} />}
            >
                <Tabs isLazy variant="enclosed" color="white">
                    <TabList justifyContent="center" mt={5} color={"limegreen"}>
                        <Tab _selected={{ bg: "limegreen", color: "black" }}>All Transactions</Tab>
                    </TabList>

                    <TabPanels>
                        <TabPanel>
                            {isLoading ? (
                                <Flex w={"100%"} justify={"center"} pt={4}>
                                    <Spinner size={"lg"} />
                                </Flex>
                            ) : transactions.length === 0 ? (
                                <Flex w={"100%"} justify={"center"} pt={4}>
                                    <Text fontSize={"48px"} color={"white"}>
                                        No transactions found
                                    </Text>
                                </Flex>
                            ) : (
                                transactions.map((transaction: Transaction, index: number) => {
                                    const nestedOp = transaction.op.op; // Access the nested 'op' field
                                    const type = nestedOp[0]; // First element of the array is the type
                                    const details = nestedOp[1]; // Second element is the details object

                                    // Render the transaction card based on the type
                                    return renderTransactionCard(type, details, index);
                                })
                            )}
                        </TabPanel>
                    </TabPanels>
                </Tabs>

                {/* Pagination Controls */}
                <Flex justify="space-between" p={4}>
                    <Button onClick={prevPage} disabled={currentPage === 0}>
                        Previous
                    </Button>
                    <Button onClick={nextPage} disabled={transactions.length < batchSize * (currentPage + 1)}>
                        Next
                    </Button>
                </Flex>
            </Stack>
        </Container>
    );
};

export default TransactionHistory;
