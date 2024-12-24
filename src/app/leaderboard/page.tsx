"use client";

import AuthorAvatar from "@/components/AuthorAvatar";
import { Box, Button, Center, Input, Table, Tbody, Td, Text, Th, Thead, Tr, Spinner, useToast } from "@chakra-ui/react";
import { useLeaderboardData } from "@/hooks/useLeaderboardData";
import { formatETHaddress } from "@/lib/utils";

const Leaderboard: React.FC = () => {
  const toast = useToast();
  const {
    isLoading,
    currentPage,
    totalPages,
    users,
    searchQuery,
    searchResults,
    hiveBalances,
    setSearchQuery,
    handleSearch,
    fetchSubscribers,
    lastFollower,
  } = useLeaderboardData();

  const handleCopy = (address: string) => {
    navigator.clipboard.writeText(address);
    toast({
      title: "Copied to clipboard",
      description: "ETH address has been copied to clipboard.",
      status: "success",
      duration: 2000,
      isClosable: true,
    });
  };

  return (
    <Box color={"white"}>
      <Input
        placeholder="Search users..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        mb={4}
      />
      <Button onClick={handleSearch} mb={4}>Search</Button>
      <Table variant="simple">
        <Thead >
          <Tr>
            <Th>Author</Th>
            <Th>Contributions</Th>
            <Th>Gnars Balance</Th>
            <Th>Hive Balance</Th>
            <Th>HP Balance</Th>
            <Th>HBD Balance</Th>
            <Th>ETH Add</Th>
          </Tr>
        </Thead>
        <Tbody>
          {(searchResults.length > 0 ? searchResults : users).map(({ author, contributions }) => {
            const balance = hiveBalances[author] || {};
            return (
              <Tr key={author}>
                <Td>
                  <Center justifyContent={"flex-start"}>
                    {/* <AuthorAvatar username={author} boxSize={8} /> */}
                    <Text ml={2}>{author}</Text>
                  </Center>
                </Td>
                <Td>
                  {contributions.map((contribution, idx) => (
                    <Text key={idx}>
                      {contribution.community}: {contribution.hpContribution.toFixed(2)} HP
                    </Text>
                  ))}
                </Td>
                <Td>
                  {isLoading ? <Spinner size="sm" /> : <Text cursor="pointer">{balance.gnarsBalance || 0}</Text>}
                </Td>
                <Td>
                  {isLoading ? <Spinner size="sm" /> : <Text>{balance.hiveUsdValue || 0} USD</Text>}
                </Td>
                <Td>
                  {isLoading ? <Spinner size="sm" /> : <Text>{balance.hivePower || 0} HP</Text>}
                </Td>
                <Td>
                  {isLoading ? <Spinner size="sm" /> : <Text>{balance.HBDUsdValue || 0} HBD</Text>}
                </Td>
                <Td>
                  {isLoading ? <Spinner size="sm" /> : (
                    <Text onClick={() => balance.eth_address && handleCopy(balance.eth_address)} cursor={balance.eth_address ? "pointer" : "default"}>
                      {balance.eth_address ? formatETHaddress(balance.eth_address) : "No address"}
                    </Text>
                  )}
                </Td>
              </Tr>
            );
          })}
        </Tbody>
      </Table>

      {isLoading ? (
        <Text>Loading...</Text>
      ) : (
        <Box mt={4} display="flex" justifyContent="space-between">
          <Button onClick={() => fetchSubscribers(currentPage - 1, lastFollower)} disabled={currentPage === 1}>
            Previous
          </Button>
          <Text>Page {currentPage}</Text>
          <Button onClick={() => fetchSubscribers(currentPage + 1, lastFollower)} disabled={currentPage === totalPages}>
            Next
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default Leaderboard;
