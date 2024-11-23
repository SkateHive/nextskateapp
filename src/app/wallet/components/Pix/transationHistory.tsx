import { useHiveUser } from "@/contexts/UserContext";
import { getTransactionHistory } from "@/lib/hive/server-functions";
import { Box, Spinner, Table, Tbody, Td, Text, Th, Thead, Tr } from "@chakra-ui/react";
import { useEffect, useState } from "react";

interface Transaction {
    from: string;
    to: string;
    amount: string;
    memo?: string;
    timestamp: string;
}


const TransactionHistory = ({ searchAccount }: { searchAccount: string }) => {
    const { hiveUser } = useHiveUser();
    const [transactions, setTransactions] = useState<Transaction[]>([]); // State to store retrieved transactions
    const [loading, setLoading] = useState(true);

// Hook useEffect to fetch transactions whenever the user or searchAccount changes
    useEffect(() => {
        const fetchTransactions = async () => {
            if (!hiveUser?.name) return;

            setLoading(true);

            try {
                const result = await getTransactionHistory(hiveUser.name, searchAccount);
                setTransactions(result);
            } catch (error) {
                console.error("Failed to fetch transactions:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTransactions();
    }, [hiveUser?.name, searchAccount]);


    return (
        <Box p={4}>
            {loading ? (
                <Spinner />
            ) : transactions.length > 0 ? (
                // If transactions were found, display them in a table
                <Box overflowX="auto" color="white" width="100%" maxWidth="1200px" mx="auto">
                    <Table size="lg" >
                        <Thead>
                            <Tr>
                                {/* <Th width="5%">#</Th> */}
                                <Th width="15%">From</Th>
                                <Th width="15%">To</Th>
                                <Th width="12%">Amount</Th>
                                <Th width="20%">Memo</Th>
                                <Th width="15%">Timestamp</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {/* Maps transactions and displays them in each row of the table */}
                            {transactions.map((transaction, idx) => (
                                <Tr key={idx}>
                                    {/* <Td>{idx + 1}</Td> */}
                                    <Td>{transaction.from}</Td>
                                    <Td>{transaction.to}</Td>
                                    <Td>{transaction.amount}</Td>
                                    <Td>
                                        <Box
                                            maxWidth="100%"
                                            whiteSpace="pre-wrap"
                                            overflow="hidden"
                                            textOverflow="ellipsis"
                                        >
                                            {transaction.memo && transaction.memo.length > 15
                                                ? `${transaction.memo.substring(0, 15)}...`
                                                : transaction.memo || ""}
                                        </Box>
                                    </Td>
                                    {/* Displays the formatted transaction timestamp */}
                                    <Td>{new Date(transaction.timestamp).toLocaleString()}</Td>
                                </Tr>
                            ))}
                        </Tbody>
                    </Table>
                </Box>
            ) : (
                <Text>No transactions found.</Text>
            )}
        </Box>
    );
};

export default TransactionHistory;
