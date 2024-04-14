'use client'
import React, { useState, useEffect } from "react";
import { Grid, Flex, Badge, Image, Box, Stack, Text, Center, Button, Divider, HStack, VStack, Avatar, Progress, GridItem } from "@chakra-ui/react";
import fetchProposals from "./utils/fetchProposals";
import { Proposal } from "./utils/fetchProposals";
import { useAccount } from "wagmi"
import { MarkdownRenderers } from "../upload/utils/MarkdownRenderers";
import ReactMarkdown from 'react-markdown';
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import voteOnProposal from "./utils/voteOnProposal";
import { getENSnamefromAddress } from "./utils/getENSfromAddress";
import { getENSavatar } from "./utils/getENSavatar";


const DaoPage = () => {
    const [proposals, setProposals] = useState<Proposal[]>([]);
    const [loadingProposals, setLoadingProposals] = useState(true);
    const [loadingSummaries, setLoadingSummaries] = useState(false);
    const [mainProposal, setMainProposal] = useState<Proposal | null>(null);
    const ethAccount = useAccount();
    const [avatar, setAvatar] = useState<string | null>(null);
    const [connectedUserEnsName, setConnectedUserEnsName] = useState<string | null>(null);
    const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);
    const [ProposerName, setProposerName] = useState<string | null>(null);
    const [proposerAvatar, setProposerAvatar] = useState<string | null>(null);

    useEffect(() => {
        setMainProposal(proposals[0])
    }, [proposals]);


    const getConnectedUserAvatar = async (address: string) => {
        try {
            // Fetch ENS name and avatar in parallel
            const [connectedUserEnsName, ensAvatar] = await Promise.all([
                getENSnamefromAddress(address),
                getENSavatar(address)
            ]);

            // Update state with fetched data
            setConnectedUserEnsName(connectedUserEnsName);
            setAvatar(ensAvatar);

            return ensAvatar;
        } catch (error) {
            console.error("Failed to fetch ENS data:", error);
            // Handle errors or set default values as necessary
            setConnectedUserEnsName('');
            setAvatar(null);
            return null;
        }
    }
    useEffect(() => {
        if (ethAccount.address && ethAccount.address.length > 0) {
            getConnectedUserAvatar(ethAccount.address)
                .then(avatar => {
                    console.log('Avatar loaded:');
                })
                .catch(error => {
                    console.error('Error fetching avatar:', error);
                });
        }
    }, [ethAccount.address]);
    const handleSelectProposal = (proposal: Proposal) => {
        setMainProposal(proposal);
        setProposerName(proposal.author)
    }

    const formatEthAddress = (address: string) => {
        return `${address.slice(0, 6)}...${address.slice(-4)}`
    }

    useEffect(() => {
        fetchProposals({ setProposals, setLoadingProposals, setLoadingSummaries });
    }, []);

    useEffect(() => {
        console.log(proposals)
    }
        , [proposals]);

    interface ProposerAvatarProps {
        authorAddress: string;
    }

    const ProposerAvatar: React.FC<ProposerAvatarProps> = ({ authorAddress }) => {
        const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

        useEffect(() => {
            const loadAvatar = async () => {
                try {
                    const url = await getENSavatar(authorAddress);
                    setAvatarUrl(url || "/pepenation.gif"); // Ensure fallback to a default avatar if none is found
                } catch (error) {
                    console.error("Failed to fetch avatar for address:", authorAddress, error);
                    setAvatarUrl("pepenation.gif"); // Use default avatar on error
                }
            };

            if (authorAddress) {
                loadAvatar();
            }
        }, [authorAddress]);

        return (
            <Avatar src={avatarUrl || "/pepenation.gif"} name={authorAddress} />
        );
    };



    return (
        <Box>
            <Center>
                <Text fontSize="28px" color="limegreen">DAO</Text>
            </Center>
            <Box
                bg="black"
                p={4}
                border="0.6px solid limegreen"
                borderRadius="none"
            >
                <Grid
                    templateColumns="1fr 2fr 1fr" // Adjust the column ratios according to your needs
                    gap={6}
                    alignItems="center" // Align items vertically in the center
                >
                    <GridItem colSpan={2} display="flex" alignItems="center">
                        <HStack spacing={4}> {/* Ensure proper spacing between the image and the text */}
                            <Image boxSize="86px" src={avatar || "/pepenation.gif"} />
                            <VStack>
                                <Text fontSize="16px" color="limegreen">{connectedUserEnsName}</Text>
                                <Text fontSize="10px" mb={2}>Voting Power: 123 Votes</Text> {/* Placeholder for voting power */}
                            </VStack>

                        </HStack>
                    </GridItem>
                    <GridItem colSpan={1} display="flex" flexDirection="column" alignItems="flex-end">
                        <Button colorScheme="green" variant="outline" onClick={() => console.log('trying to create proposal')}>
                            Create Proposal
                        </Button>
                    </GridItem>
                </Grid>

            </Box>

            <HStack
                align={"flex-start"}
            >
                <Box width={"50%"}>
                    <Stack>
                        {loadingProposals ? (
                            <Center>
                                <Text fontSize="28px" color="limegreen">Loading...</Text>
                            </Center>
                        ) : (
                            proposals.map((proposal, i) => (
                                <Box cursor={"pointer"} onClick={() => handleSelectProposal(proposal)} key={proposal.id} bg="black" p={4} border="0.6px solid limegreen" borderRadius="none">
                                    <ProposerAvatar authorAddress={proposal.author} />
                                    {/* <Text> Author: {getENSnamefromAddress(proposal.author)}</Text> */}
                                    <Text>Title: {proposal.title}</Text>
                                    <Divider />
                                    <Text border={"0.6px solid darkgrey"} p={2} mt={2} mb={2} borderRadius={5} fontSize={"12px"}>Summary: {decodeURIComponent(proposal.summary ?? '')}</Text>
                                    {proposal.choices.map((choice, choiceIndex) => (
                                        <Button colorScheme={choice.toUpperCase() == 'FOR' ? "green" : "red"} variant="outline" key={choiceIndex} onClick={() => voteOnProposal(ethAccount, proposal.id, choiceIndex + 1)}>
                                            {choice.toUpperCase()}
                                        </Button>
                                    ))}
                                </Box>
                            ))
                        )}
                    </Stack>
                </Box>
                <Box
                    bg="black"
                    p={4}
                    border="0.6px solid limegreen"
                    borderRadius="none"
                    width={"50%"}
                    minHeight={"100%"}
                >

                    <Box
                        bg="black"
                        p={4}
                        border="0.6px solid limegreen"
                        borderRadius="none"
                    >
                        <Center>

                            <Badge fontSize="28px" color="limegreen">Scores</Badge>
                        </Center>
                        <Text fontSize="16px" color="limegreen">{mainProposal?.scores[0]} For</Text>
                        <Progress value={mainProposal?.scores[0] ?? 0} colorScheme="green" size="sm">
                        </Progress>
                        <Text fontSize="16px" color="limegreen">{mainProposal?.scores[1]} Against</Text>
                        <Progress value={mainProposal?.scores[1] ?? 0} colorScheme="red" size="sm">
                            {mainProposal?.scores[1] ?? 0}
                        </Progress>
                    </Box>

                    <Text fontSize="24px" color="limegreen">Proposer</Text>
                    {mainProposal?.author &&
                        <VStack>
                            <Image boxSize={"86px"} src={"/pepenation.gif"} />
                            <Text>{ProposerName || formatEthAddress(mainProposal?.author)}</Text>
                            <Flex justify="space-between">
                                <Text>Start: {new Date(mainProposal?.start * 1000).toLocaleDateString()}</Text>
                                <Text>End: {new Date(mainProposal.end * 1000).toLocaleDateString()}</Text>
                            </Flex>
                        </VStack>

                    }

                    <ReactMarkdown
                        components={MarkdownRenderers}
                        rehypePlugins={[rehypeRaw, rehypeSanitize]}
                        remarkPlugins={[remarkGfm]}
                    >

                        {(mainProposal?.body ?? '')}
                    </ReactMarkdown>
                </Box>
            </HStack >
        </Box >
    );
};

export default DaoPage;

