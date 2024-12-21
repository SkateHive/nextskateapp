/* eslint-disable react-hooks/rules-of-hooks */
"use client";

import AuthorAvatar from "@/components/AuthorAvatar";
import { FormattedAddress } from "@/components/NNSAddress";
import { HiveAccount } from "@/lib/useHiveAuth";
import { Box, Button, Center, Table, Tbody, Td, Text, Th, Thead, Tr } from "@chakra-ui/react";
import { useEffect, useState } from "react";

interface PropsUser {
  author: string;
  contributions: { community: string; hpContribution: number }[];
  ethAddress: string;
  user?: HiveAccount;
}

interface Delegation {
  delegator: string;
  vestingShares: number;
}

const UserProfileHive: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [lastFollower, setLastFollower] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [users, setUsers] = useState<PropsUser[]>([]);
  const [delegations, setDelegations] = useState<Delegation[]>([]);
  const [gnarsBalances, setGnarsBalances] = useState<Record<string, number>>({});

  // Function that searches for followers
  const fetchSubscribers = async (lastFollower: any) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/hive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ community: "hive-173115", last: lastFollower }),
      });

      const data = await response.json();
      if (data.error) {
        console.error("Error fetching data:", data.error);
        return;
      }

      const newUsers: PropsUser[] = data.subscribers.map((subscriber: any) => {
        try {
          const metadata: { extensions?: { eth_address?: string } } = subscriber.json_metadata
            ? JSON.parse(subscriber.json_metadata)
            : {};
          const ethAddress: string = metadata?.extensions?.eth_address || "";
          return {
            author: subscriber.author,
            contributions: subscriber.contributions,
            ethAddress,
          };
        } catch (error) {
          console.error("Error processing subscriber's json_metadata:", error);
          return null;
        }
      }).filter((user: any): user is PropsUser => user !== null);

      setUsers((prevUsers) => [...prevUsers, ...newUsers]);
      setLastFollower(data.lastFollower);
      setHasMore(data.hasMore);

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

      const data = await response.json();
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


  useEffect(() => {
    fetchSubscribers(null);
    fetchDelegations();
  }, []);

  return (
    <Box>
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Author</Th>
            <Th>Contributions</Th>
            <Th>ETH Address</Th>
            <Th>Gnars Balance</Th>
          </Tr>
        </Thead>
        <Tbody>
          {users.map(({ author, contributions, ethAddress }: PropsUser) => (
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
                <FormattedAddress address={ethAddress} />
              </Td>
              <Td>
                <Text cursor="pointer">{gnarsBalances[ethAddress] || 0}</Text>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      {isLoading ? (
        <Text>Loading...</Text>
      ) : (
        hasMore && (
          <Button onClick={() => fetchSubscribers(lastFollower)} mt={4} width="100%">
            Show More
          </Button>
        )
      )}
    </Box>
  );
};

export default UserProfileHive;
