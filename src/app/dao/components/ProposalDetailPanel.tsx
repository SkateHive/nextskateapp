import { MarkdownRenderers } from "@/app/upload/utils/MarkdownRenderers";
import { formatETHaddress } from "@/lib/utils";
import {
    Box,
    Center,
    Divider,
    HStack,
    Image,
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
    Text
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import { mainnet } from "viem/chains";
import { useEnsName } from "wagmi";
import { Proposal } from "../utils/fetchProposals";
import { PropDates } from "./propDates";
import ProposerAvatar from "./proposerAvatar";

interface Vote {
    id: string;
    voter: string;
    choice: number;
    created: number;
    vp: number;
    reason: string;
}

interface ProposalDetailPanelProps {
    mainProposal: Proposal | null;
}

const VoterEnsName = ({ voterAddress }: { voterAddress: string }) => {
    const { data: ensName } = useEnsName({
        address: voterAddress as `0x${string}`,
        chainId: mainnet.id,
    });

    return <Text color={'blue.200'} fontSize={"26px"}>{ensName || formatETHaddress(voterAddress)}</Text>;
};

const ProposalDetailPanel = ({
    mainProposal,
}: ProposalDetailPanelProps) => {
    const [votes, setVotes] = useState<Vote[]>([]);
    const [loadingVotes, setLoadingVotes] = useState(false);
    const [author, setAuthor] = useState<string | null>(null);
    const [permlink, setPermlink] = useState<string | null>(null);

    useEffect(() => {
        if (mainProposal && mainProposal.body) {
            const extractedData = extractAuthorAndPermlink(mainProposal.body);
            if (extractedData) {
                setAuthor(extractedData.author);
                setPermlink(extractedData.permlink);
            } else {
                setAuthor(null);
                setPermlink(null);
            }
        } else {
            setAuthor(null);
            setPermlink(null);
        }
    }, [mainProposal?.body]);

    const fetchVotes = async (proposalId: string) => {
        setLoadingVotes(true);
        const query = `
        query GetVotes($proposalId: String!) {
            votes(
                where: { proposal: $proposalId }
                orderBy: "created"
                orderDirection: desc
            ) {
                id
                voter
                choice
                created
                vp
                reason
            }
        }`;

        const variables = { proposalId };

        try {
            const response = await fetch("https://hub.snapshot.org/graphql", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query, variables }),
            });
            const { data } = await response.json();
            setVotes(data.votes);
        } catch (error) {
            console.error("Error fetching votes:", error);
        } finally {
            setLoadingVotes(false);
        }
    };

    function extractAuthorAndPermlink(proposal: string): { author: string, permlink: string } | null {
        const regex1 = /---\s*user:\s*([^\s]+)\s*permLink:\s*([^\s]+)\s*---/;
        const regex2 = /---\s*HiveUser:\s*([^\s]+)\s*PermLink:\s*([^\s]+)\s*---/;
        const match = proposal.match(regex1) || proposal.match(regex2);
        if (match && match.length >= 3) {
            const author = match[1];
            const permlink = match[2];
            return { author, permlink };
        }
        return null;
    }

    return (
        <Box mt={2} w={{ base: '100%', md: '100%' }} color={"white"}>
            <Tabs isLazy isFitted variant="enclosed-colored" onChange={(index) => {
                if (index === 1 && mainProposal) fetchVotes(mainProposal.id); 
            }}>
                <Center>
                    <TabList>
                        <Tab bg={"black"} _selected={{ bg: "limegreen", color: "black" }}>Proposal</Tab>
                        <Tab bg={"black"} _selected={{ bg: "limegreen", color: "black" }}>Votes</Tab>
                        <Tab bg={"black"} _selected={{ bg: "limegreen", color: "black" }}>Report</Tab>
                    </TabList>
                </Center>

                <TabPanels>
                    <TabPanel>
                        {!mainProposal ? (
                            <Center>
                                <Image
                                    src="https://cdn.dribbble.com/users/921277/screenshots/13742833/media/98615054c34087c21144640c23c4d9fa.gif"
                                    objectFit={'fill'}
                                    h={'100%'}
                                    alt="Loading Proposal"
                                />
                            </Center>
                        ) : (
                            <>
                                <Divider color={"white"} mb={5} />
                                <HStack>
                                    <ProposerAvatar authorAddress={mainProposal.author} boxSize={100} />
                                    <Text fontSize={24} fontWeight={"bold"} mt={5}>{mainProposal.title}</Text>
                                </HStack>
                                <Divider color={"white"} mt={5} />
                                <Box mt={2} h={'85vh'} overflow={"auto"}>
                                    <ReactMarkdown
                                        components={MarkdownRenderers}
                                        rehypePlugins={[rehypeRaw]}
                                        remarkPlugins={[remarkGfm]}
                                    >
                                        {mainProposal.body}
                                    </ReactMarkdown>
                                </Box>
                            </>
                        )}
                    </TabPanel>

                    <TabPanel>
                        {loadingVotes ? (
                            <Center>
                                <Image
                                    src="https://cdn.dribbble.com/users/921277/screenshots/13742833/media/87d7e9272d8234b3b5efeda7b213a292.gif"
                                    objectFit={'fill'}
                                    h={'100%'}
                                    alt="Loading Votes"
                                />
                            </Center>
                        ) : votes.length === 0 ? (
                            <Text>No votes yet</Text>
                        ) : (
                            <Box>
                                {votes.map((vote) => (
                                    <Box
                                        key={vote.id}
                                        p={4}
                                        border="1px solid #A5D6A7"
                                        borderRadius="10px"
                                        mb={2}
                                    >
                                        <HStack>
                                            <Box mr={3}>
                                                <ProposerAvatar authorAddress={vote.voter} boxSize={50} />
                                            </Box>
                                            <VoterEnsName voterAddress={vote.voter} />
                                            <Text color={"white"} fontSize={"24px"}>has voted</Text>
                                            <Text fontSize={'28px'} color={
                                                vote.choice === 1 ? 'limegreen' :
                                                    vote.choice === 2 ? 'red' :
                                                        'white'
                                            }>
                                                {mainProposal?.choices[vote.choice - 1]}
                                            </Text>
                                            <Text color={"white"} fontSize={"24px"}>with</Text>
                                            <Text color={"yellow"} fontSize={"24px"}>{vote.vp} votes</Text>
                                        </HStack>
                                        {vote.reason && (
                                            <Text mt={2} bg={"#141414"} p={2} borderRadius={5}>
                                                {vote.reason}
                                            </Text>
                                        )}
                                    </Box>
                                ))}
                            </Box>
                        )}
                    </TabPanel>

                    <TabPanel h={"100%"}>
                        {!mainProposal ? (
                            <Center>
                                <Image
                                    src="https://cdn.dribbble.com/users/921277/screenshots/13742833/media/2a58f4ef0f2de48fddf7c4d1c104f5dc.gif"
                                    objectFit={'fill'}
                                    h={'100%'}
                                    alt="Loading Report"
                                />
                            </Center>
                        ) : (
                            <Box mt={2} h={"100%"}>
                                <PropDates author={author || ""} permlink={permlink || ""} />
                            </Box>
                        )}
                    </TabPanel>
                </TabPanels>
            </Tabs>
        </Box>
    );
};

export default ProposalDetailPanel;
