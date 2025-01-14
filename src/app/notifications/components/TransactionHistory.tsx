import AuthorAvatar from "@/components/AuthorAvatar";
import { useHiveUser } from "@/contexts/UserContext";
import { getAccountHistory } from "@/lib/hive/client-functions";
import {
    Button,
    Container,
    Flex,
    HStack,
    Image,
    Spinner,
    Stack,
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
    Text,
    useColorModeValue
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

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
    const [currentPage, setCurrentPage] = useState(0);
    const [batchSize] = useState(ITEMS_PER_PAGE);

    // Dynamic styles for light/dark themes
    const cardBg = useColorModeValue("white", "gray.800");
    const cardBorderColor = useColorModeValue("gray.200", "gray.700");
    const textColor = useColorModeValue("gray.800", "gray.200");

    // Fetch transactions
    useEffect(() => {
        const fetchTransactions = async () => {
            if (!username) return;

            setIsLoading(true);
            try {
                const data = await getAccountHistory(String(username), batchSize * (currentPage + 1));
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
                    setTransactions(mappedData.reverse());
                } else {
                    console.error("Error fetching transactions: Invalid data", data);
                }
            } catch (error) {
                console.error("Error fetching transactions:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTransactions();
    }, [username, currentPage, batchSize]);

    // Render the transaction cards
    const renderTransactionCard = (type: string, details: any, index: number) => {
        const commonCardStyles = {
            p: 4,
            borderRadius: "md",
            border: `1px solid ${cardBorderColor}`,
            bg: cardBg,
            mb: 4,
            shadow: "lg",
            align: "center",
        };

        switch (type) {
            case "claim_reward_balance":
                return (
                    <HStack key={index} {...commonCardStyles}>
                        <Image src={CLAIM_REWARDS_IMAGE} boxSize={12} alt="Claim Rewards" />
                        <Text fontSize="lg" color={textColor}>
                            Claimed: <b>{details.reward_hbd}</b> and <b>{details.reward_vests}</b>
                        </Text>
                    </HStack>
                );
            case "transfer":
                return (
                    <HStack key={index} {...commonCardStyles}>
                        <AuthorAvatar username={details.from} boxSize={12} />
                        <Flex direction="column">
                            <Text fontSize="lg" color={textColor}>
                                Transfer from <b>{details.from}</b> to <b>{details.to}</b>: {details.amount}
                            </Text>
                            {details.memo && (
                                <Text fontSize="sm" color="gray.500">
                                    <i>Memo:</i> {details.memo}
                                </Text>
                            )}
                        </Flex>
                    </HStack>
                );
            case "effective_comment_vote":
                return (
                    <HStack key={index} {...commonCardStyles}>
                        <AuthorAvatar username={details.author} boxSize={12} />
                        <Text fontSize="lg" color={textColor}>
                            Voted on {details.author}&apos;s{" "}
                            <a
                                href={`https://skatehive.app/post/@${details.author}/${details.permlink}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: "limegreen" }}
                            >
                                comment
                            </a>: Payout: {details.pending_payout}
                        </Text>
                    </HStack>
                );
            case "curation_reward":
                return (
                    <HStack key={index} {...commonCardStyles}>
                        <AuthorAvatar username={details.comment_author} boxSize={12} />
                        <Text fontSize="lg" color={textColor}>
                            Curation Reward: {details.reward} VESTS for voting on {details.comment_author}&apos;s post
                        </Text>
                    </HStack>
                );
            case "comment":
                return (
                    <HStack key={index} {...commonCardStyles}>
                        <AuthorAvatar username={details.author} boxSize={12} />
                        <Text fontSize="lg" color={textColor}>
                            Comment by <b>{details.author}</b>: {details.body}
                        </Text>
                    </HStack>
                );
            case "vote":
                // return (
                //     <HStack key={index} {...commonCardStyles}>
                //         <AuthorAvatar username={details.voter} boxSize={12} />
                //         <Text fontSize="lg" color={textColor}>
                //             <b>{details.voter}</b> voted on <b>{details.author}&apos;s</b> post{" "}
                //             <a
                //                 href={`https://skatehive.app/post/@${details.author}/${details.permlink}`}
                //                 target="_blank"
                //                 rel="noopener noreferrer"
                //                 style={{ color: "limegreen" }}
                //             >
                //                 View Post
                //             </a>{" "}
                //             (Weight: {(details.weight / 100).toFixed(2)}%)
                //         </Text>
                //     </HStack>
                // );
                break
            default:
                return (
                    <HStack key={index} {...commonCardStyles}>
                        <Text fontSize="lg" color={textColor}>
                            {type}: {JSON.stringify(details)}
                        </Text>
                    </HStack>
                );
        }
    };

    // Pagination control
    const nextPage = () => setCurrentPage((prev) => prev + 1);
    const prevPage = () => setCurrentPage((prev) => Math.max(0, prev - 1));

    return (
        <Container maxW="container.lg" p={4}>
            <Stack spacing={6}>
                <Tabs variant="solid-rounded" colorScheme="green">
                    <TabList>
                        <Tab>All Transactions</Tab>
                    </TabList>
                    <TabPanels>
                        <TabPanel>
                            {isLoading ? (
                                <Flex justify="center" py={6}>
                                    <Spinner size="xl" />
                                </Flex>
                            ) : transactions.length === 0 ? (
                                <Flex justify="center" py={6}>
                                    <Text fontSize="2xl" color={textColor}>
                                        No transactions found
                                    </Text>
                                </Flex>
                            ) : (
                                transactions.map((transaction, index) => {
                                    const nestedOp = transaction.op.op;
                                    const type = nestedOp[0];
                                    const details = nestedOp[1];
                                    return renderTransactionCard(type, details, index);
                                })
                            )}
                        </TabPanel>
                    </TabPanels>
                </Tabs>
                <Flex justify="space-between">
                    <Button
                        leftIcon={<FaArrowLeft />}
                        onClick={prevPage}
                        disabled={currentPage === 0}
                    >
                        Previous
                    </Button>
                    <Button
                        rightIcon={<FaArrowRight />}
                        onClick={nextPage}
                        disabled={transactions.length < batchSize * (currentPage + 1)}
                    >
                        Next
                    </Button>
                </Flex>
            </Stack>
        </Container>
    );
};

export default TransactionHistory;
