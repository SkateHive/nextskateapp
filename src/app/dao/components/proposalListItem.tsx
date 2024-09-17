import React from 'react';
import { Badge, Box, Button, Center, Flex, HStack, Text, VStack } from "@chakra-ui/react";
import { mainnet } from "viem/chains";
import { useEnsName } from "wagmi";
import { checkProposalOutcome } from "../utils/checkProposalOutcome";
import { Proposal } from "../utils/fetchProposals";
import ProposerAvatar from "./proposerAvatar";

const formatEthAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
};

// Utility function to check if the proposal is active
const isProposalActive = (proposal: Proposal) => {
    const currentTime = Date.now();
    const startTime = proposal.start * 1000;
    const endTime = proposal.end * 1000;
    return startTime < currentTime && endTime > currentTime;
};

const ProposalListItem = ({
    proposal,
    isSelected,
    onSelect,
    setSelectedChoice
}: {
    proposal: Proposal;
    isSelected: boolean;
    onSelect: () => void;
    setSelectedChoice: (choice: number) => void;
}) => {
    const { data: ensName } = useEnsName({
        address: proposal.author as `0x${string}`,
        chainId: mainnet.id,
    });

    const outcome = checkProposalOutcome(proposal);
    const isActive = isProposalActive(proposal);

    // Calculate percentages for "For" and "Against" votes
    const totalVotes = proposal.scores[0] + proposal.scores[1];
    const forPercentage = (proposal.scores[0] / totalVotes) * 100;
    const againstPercentage = (proposal.scores[1] / totalVotes) * 100;

    return (
        <Box
            cursor="pointer"
            onClick={onSelect}
            key={proposal.id}
            bg="#201d21"
            p={2}
            borderRadius="10px"
            border="0.6px solid gray"
        >
            <HStack justifyContent={"space-between"}>

                <Box maxW={"80%"} justifyContent={"flex-start"}>
                    <Text color="white" fontSize={18} isTruncated ml={2}>{proposal.title}</Text>
                </Box>

                <Badge
                    colorScheme='green'
                    bg="black"
                    fontSize="18px"
                    color={isActive ? "yellow" : outcome.hasWon ? "#A5D6A7" : "red"}
                >
                    {isActive ? "Active" : outcome.hasWon ? "Passed" : "Failed"}
                </Badge>
            </HStack>

            {isSelected && (
                <>
                    <HStack p={4} color={"green.200"}>
                        <VStack justifyContent="flex-start" w={'20%'} mr={2}>
                            <ProposerAvatar authorAddress={proposal.author} />
                            <Center>
                                <Text color="blue.200" ml={2}>
                                    {ensName || formatEthAddress(proposal.author)}
                                </Text>
                            </Center>
                        </VStack>
                        <Text fontSize={"18px"}>
                            {decodeURIComponent(proposal.summary ?? "")}
                        </Text>
                    </HStack>

                    <Box p={4} borderTop={"none"}>
                        {/* Progress bar representing both "For" and "Against" votes */}
                        <Box height="20px" width="100%" bg="gray.700" borderRadius="md" overflow="hidden">
                            <Box height="100%" width={`${forPercentage}%`} bg="green.400" float="left"></Box>
                            <Box height="100%" width={`${againstPercentage}%`} bg="red.400" float="right"></Box>
                        </Box>
                        <HStack justifyContent="space-between" mt={2}>
                            <Text fontSize="16px" color="#A5D6A7">{proposal.scores[0]} For</Text>
                            <Text fontSize="16px" color="red.200">{proposal.scores[1]} Against</Text>
                        </HStack>

                        {proposal.state !== "active" && (
                            <Center>
                                <Text fontSize="14px" color="#A5D6A7" mt={5}>
                                    Quorum: {checkProposalOutcome(proposal).quorumReached ? "Reached" : "Not Reached"} (
                                    {checkProposalOutcome(proposal).totalVotes} Votes)
                                </Text>
                            </Center>
                        )}

                        {proposal.state === "active" && (
                            <HStack mt={4} spacing={4} justifyContent="space-between">
                                {proposal.choices.map((choice, choiceIndex) => (
                                    <Button
                                        colorScheme={choice.toUpperCase() === "FOR" ? "green" : "red"}
                                        variant="outline"
                                        key={choiceIndex}
                                        onClick={() => setSelectedChoice(choiceIndex)}
                                    >
                                        {choice.toUpperCase()}
                                    </Button>
                                ))}
                            </HStack>
                        )}
                    </Box>

                    <HStack justifyContent="space-between" m={2}>
                        <Text color={"white"}>
                            Start:{" "}
                            <Badge bg={"black"} color={"#A5D6A7"}>
                                {new Date(proposal.start * 1000).toLocaleDateString()}
                            </Badge>
                        </Text>
                        <Text color={"white"}>
                            End:{" "}
                            <Badge bg={"black"} color={"#A5D6A7"}>
                                {new Date(proposal.end * 1000).toLocaleDateString()}
                            </Badge>
                        </Text>
                    </HStack>
                </>
            )}
        </Box>
    );
};

export default ProposalListItem;
