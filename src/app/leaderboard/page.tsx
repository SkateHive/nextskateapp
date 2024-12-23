// deixei o arquivo bem aberto, trouxe a logica dos hooks para ca, vou ajeitar, separar o front do calculo da tabela e tenta trazer a criacao dessa tabela para um servidor redis our vercelkv para gente ter nosso proprio endpoint 

"use client";

import AuthorAvatar from "@/components/AuthorAvatar";
import { Box, Button, Center, Input, Table, Tbody, Td, Text, Th, Thead, Tr } from "@chakra-ui/react";
import { useEffect, useState, useMemo } from "react";
import { convertVestingSharesToHivePower } from "@/app/wallet/utils/calculateHP";
import { useHivePrice } from "@/hooks/useHivePrice";
import HiveClient from "@/lib/hive/hiveclient";
import { HiveAccount } from "@/lib/useHiveAuth";

interface PropsUser {
  author: string;
  contributions: { community: string; hpContribution: number }[];
  user?: HiveAccount;
  ethAddress?: string; // Ensure this is optional (not `null`)
}

interface Delegation {
  delegator: string;
  vestingShares: number;
}

const Leaderboard: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [users, setUsers] = useState<PropsUser[]>([]);
  const [delegations, setDelegations] = useState<Delegation[]>([]);
  const [gnarsBalances, setGnarsBalances] = useState<Record<string, number>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<PropsUser[]>([]);
  const [lastFollower, setLastFollower] = useState<string | null>(null);
  const [hiveBalances, setHiveBalances] = useState<Record<string, any>>({});

  const cache = useMemo(() => new Map<number, PropsUser[]>(), []);
  const hivePrice = useHivePrice();

  const fetchHiveBalances = async (users: PropsUser[]) => {
    const balances: Record<string, any> = {};
    for (const user of users) {
      const userData = await HiveClient.database.getAccounts([user.author]);
      const hiveAccount = userData[0];
      const vestingShares = hiveAccount?.vesting_shares;
      const delegatedVestingShares = hiveAccount?.delegated_vesting_shares;
      const receivedVestingShares = hiveAccount?.received_vesting_shares;

      if (hivePrice !== null) {
        const hiveUsdValue = hivePrice * Number(String(hiveAccount?.balance).split(" ")[0]);
        const delegatedHPUsdValue = hivePrice * Number(String(hiveAccount?.delegated_vesting_shares).split(" ")[0]);
        const HBDUsdValue = 1 * Number(String(hiveAccount?.hbd_balance).split(" ")[0]);
        const savingsUSDvalue = 1 * Number(String(hiveAccount?.savings_hbd_balance).split(" ")[0]);
        const totalValue = hiveUsdValue + delegatedHPUsdValue + HBDUsdValue + savingsUSDvalue;

        const calculateHP = async () => {
          try {
            const res = await convertVestingSharesToHivePower(
              String(vestingShares),
              String(delegatedVestingShares),
              String(receivedVestingShares)
            );
            const hivePower = Number(res.hivePower);
            const HPthatUserDelegated = Number(res.DelegatedToSomeoneHivePower);
            const totalHP = hivePower + HPthatUserDelegated;
            const HPUsdValue = hivePrice * totalHP;
            const delegatedToUserInUSD = res.delegatedToUserInUSD;

            balances[user.author] = {
              hiveUsdValue,
              hivePower,
              delegatedToUserInUSD,
              HPthatUserDelegated,
              totalHP,
              HPUsdValue,
              delegatedHPUsdValue,
              HBDUsdValue,
              savingsUSDvalue,
              totalValue,
              hiveAccount
            };
          } catch (error) {
            console.error("Failed to calculate Hive Power:", error);
          }
        };

        await calculateHP();
      }
    }
    setHiveBalances(balances);
  };

  // Function that searches for followers
  const fetchSubscribers = async (page: number, lastFollower: string | null = null) => {
    if (cache.has(page)) {
      setUsers(cache.get(page) || []);
      console.log("Cache hit");
      console.log(cache.get(page));
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/hive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ community: "hive-173115", limit: 200, last: lastFollower }),
      });

      const data = await response.json();
      console.log(data);
      if (data.error) {
        console.error("Error fetching data:", data.error);
        return;
      }
      if (data.subscribers.length === 0) {
        console.log("No more subscribers found");
        return;
      }

      const newUsers: PropsUser[] = data.subscribers
        .map((subscriber: any): PropsUser | null => {
          try {
            const metadata = subscriber.json_metadata ? JSON.parse(subscriber.json_metadata) : {};
            const ethAddress = metadata.extensions?.eth_address || undefined; // Use undefined for optional property
            return {
              author: subscriber.author,
              contributions: subscriber.contributions,
              ethAddress, // This remains optional in PropsUser
            };
          } catch (error) {
            console.error("Error processing subscriber's json_metadata:", error);
            return null; // Return null explicitly
          }
        })


      console.log(newUsers);
      cache.set(page, newUsers);
      setUsers(newUsers);
      setTotalPages(data.totalPages || 1); // Ensure totalPages is set to at least 1
      setCurrentPage(page); // Update currentPage state
      setLastFollower(data.subscribers[data.subscribers.length - 1]?.author || null); // Update lastFollower state

    } catch (error) {
      console.error("Error fetching subscribers:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Function that searches for delegations
  const fetchDelegations = async () => {
    try {
      const response = await fetch("/api/hive-delegations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ community: "steemskate" }),
      });

      const responseText = await response.text();

      const data = JSON.parse(responseText);
      console.log(data);
      if (data.error) {
        console.error("Error fetching delegations:", data.error);
      } else {
        const formattedDelegations = Object.keys(data.totalDelegated).map(delegator => ({
          delegator,
          vestingShares: data.totalDelegated[delegator],
        }));

        setDelegations(formattedDelegations);
      }
    } catch (error) {
      console.error("Error fetching delegations:", error);
    }
  };

  const handleSearch = async () => {
    setIsLoading(true);
    try {
      let allUsers: PropsUser[] = [];
      let page = 1;
      let lastFollowerLocal: string | null = null;
      let keepSearching = true;

      while (keepSearching) {
        if (cache.has(page)) {
          allUsers = allUsers.concat(cache.get(page) || []);
        } else {
          const response: Response = await fetch("/api/hive", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ community: "hive-173115", page, limit: 200, last: lastFollowerLocal }),
          });

          const data: { subscribers: any[], error?: string } = await response.json();
          if (data.error) {
            console.error("Error fetching data:", data.error);
            break;
          }

          const newUsers: PropsUser[] = data.subscribers.map((subscriber: any) => {
            try {
              const metadata = subscriber.json_metadata ? JSON.parse(subscriber.json_metadata) : {};
              return {
                author: subscriber.author,
                contributions: subscriber.contributions,
              };
            } catch (error) {
              console.error("Error processing subscriber's json_metadata:", error);
              return null;
            }
          }).filter((user: any): user is PropsUser => user !== null);

          cache.set(page, newUsers);
          allUsers = allUsers.concat(newUsers);
          lastFollowerLocal = data.subscribers[data.subscribers.length - 1]?.author || null;
        }

        const searchResults = allUsers.filter(user =>
          user.author.toLowerCase().includes(searchQuery.toLowerCase())
        );

        setSearchResults(searchResults);

        if (searchResults.length > 0 || lastFollowerLocal === lastFollower) {
          keepSearching = false;
        } else {
          page++;
        }
      }
    } catch (error) {
      console.error("Error searching users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscribers(currentPage);
    fetchDelegations();
  }, [currentPage]);

  useEffect(() => {
    if (users.length > 0) {
      fetchHiveBalances(users);
    }
  }, [users]);

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
          {(searchResults.length > 0 ? searchResults : users).map(({ author, contributions }: PropsUser) => {
            const balance = hiveBalances[author] || {};
            console.log(balance);
            return (
              <Tr key={author}>
                <Td>
                  <Center justifyContent={"flex-start"}>
                    <AuthorAvatar username={author} boxSize={8} />
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
                  <Text cursor="pointer">{gnarsBalances[author] || 0}</Text>
                </Td>
                <Td>
                  <Text>{balance.hiveUsdValue || 0} USD</Text>
                </Td>
                <Td>
                  <Text>{balance.hivePower || 0} HP</Text>
                </Td>
                <Td>
                  <Text>{balance.HBDUsdValue || 0} HBD</Text>
                </Td>
                <Td>
                  <Text>{balance.hiveAccount?.json_metadata?.extensions?.eth_address || ""}</Text>
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
