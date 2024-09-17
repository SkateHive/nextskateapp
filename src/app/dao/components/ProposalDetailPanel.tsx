import {
    Box,
    HStack,
    Badge,
    Flex,
    Progress,
    Text,
    Button,
    Tabs,
    TabList,
    TabPanels,
    TabPanel,
    Tab,
    Center,
    Divider,
    Image
} from "@chakra-ui/react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import { Proposal } from "../utils/fetchProposals";
import VoteConfirmationModal from "./voteWithReasonModal";
import { checkProposalOutcome } from "../utils/checkProposalOutcome";
import { MarkdownRenderers } from "@/app/upload/utils/MarkdownRenderers";
import { useEffect, useState } from "react";
import { formatETHaddress } from "@/lib/utils";
import ProposerAvatar from "./proposerAvatar";

// Add a new type for vote data
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
    selectedChoice: number | null;
    reason: string;
    setReason: (reason: string) => void;
    ethAccount: string | null;
    voteOnProposal: (ethAccount: string | null, proposalId: string, choice: number, reason: string) => void;
}

const ProposalDetailPanel = ({
    mainProposal,
    selectedChoice,
    reason,
    setReason,
    ethAccount,
    voteOnProposal,
}: ProposalDetailPanelProps) => {
    const [votes, setVotes] = useState<Vote[]>([]); // New state to hold votes
    const [loadingVotes, setLoadingVotes] = useState(false); // Loading state for votes

    // Fetch votes when the mainProposal changes
    useEffect(() => {
        if (mainProposal) {
            fetchVotes(mainProposal.id);
        }
    }, [mainProposal]);

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
            setVotes(data.votes); // Store the votes in state
        } catch (error) {
            console.error("Error fetching votes:", error);
        } finally {
            setLoadingVotes(false);
        }
    };

    return (
        <Box mt={2} w={{ base: '100%', md: '100%' }} color={"white"}>
            <Tabs isLazy isFitted variant="enclosed-colored">
                <Center>
                    <TabList>
                        <Tab bg={"black"} _selected={{ bg: "limegreen", color: "black" }}>Proposal</Tab>
                        <Tab bg={"black"} _selected={{ bg: "limegreen", color: "black" }}>Votes</Tab>
                        <Tab bg={"black"} _selected={{ bg: "limegreen", color: "black" }}>Report</Tab>
                    </TabList>
                </Center>

                <TabPanels>
                    {/* First Tab: Proposal */}
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

                    {/* Second Tab: Votes */}
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
                                            <Text>
                                                <ProposerAvatar authorAddress={vote.voter} /> {formatETHaddress(vote.voter)}
                                            </Text>
                                            <Text>
                                                voted {mainProposal?.choices[vote.choice - 1]} with {vote.vp}
                                            </Text>
                                        </HStack>
                                        {vote.reason && (
                                            <Text mt={2} bg={"#451513"} p={2} borderRadius={5}>
                                                {vote.reason}
                                            </Text>
                                        )}
                                    </Box>
                                ))}
                            </Box>
                        )}
                    </TabPanel>

                    {/* Third Tab: Report */}
                    <TabPanel>
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
                                <Center>SOON</Center>
                            </Box>
                        )}
                    </TabPanel>
                </TabPanels>
            </Tabs>
        </Box>
    );
};

export default ProposalDetailPanel;
