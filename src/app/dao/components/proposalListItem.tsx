import { Badge, Box, Button, Center, HStack, Text, VStack } from "@chakra-ui/react";
import React from 'react';
import { useEnsName } from "wagmi";
import { mainnet } from "wagmi/chains";
import { checkProposalOutcome } from "../utils/checkProposalOutcome";
import { Proposal } from "../utils/fetchProposals";
import ProposerAvatar from "./proposerAvatar";
import VoteConfirmationModal from './voteWithReasonModal';

const formatEthAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

const ProposalListItem = ({
    proposal,
    isSelected,
    onSelect,
    ethAccount
}: {
    proposal: Proposal;
    isSelected: boolean;
    onSelect: () => void;
    ethAccount: any;
}) => {
    const { data: ensName } = useEnsName({
        address: proposal.author as `0x${string}`,
        chainId: mainnet.id,
    });

    const outcome = checkProposalOutcome(proposal);
    const isActive = proposal.start * 1000 < Date.now() && proposal.end * 1000 > Date.now();
    const [selectedChoice, setSelectedChoice] = React.useState<number | null>(null);
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const totalVotes = proposal.scores[0] + proposal.scores[1];
    const forPercentage = (proposal.scores[0] / totalVotes) * 100;
    const againstPercentage = (proposal.scores[1] / totalVotes) * 100;

    const onClickVote = (choice: number) => {
        setSelectedChoice(choice);
        setIsModalOpen(true);
    };

    return (
        <Box
            cursor="pointer"
            onClick={onSelect}
            key={proposal.id}
            bg="#1E1E1E"
            p={4}
            borderRadius="10px"
            border="1px solid"
            borderColor="gray.600"
            _hover={{ borderColor: "gray.400" }}
            transition="border-color 0.2s"
        >
            {isModalOpen && (
                <VoteConfirmationModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    choice={String(selectedChoice)}
                    proposalId={proposal.id}
                    ethAccount={ethAccount}
                />
            )}
            <HStack justifyContent="space-between" mb={3}>
                <Text color="white" fontSize="lg" fontWeight="bold" isTruncated>
                    {proposal.title}
                </Text>
                <Badge
                    fontSize="sm"
                    px={3}
                    py={1}
                    bg="black"
                    colorScheme={isActive ? "yellow" : outcome.hasWon ? "green" : "red"}
                    color={isActive ? "yellow.300" : outcome.hasWon ? "green.400" : "red.400"}
                    borderRadius="full"
                >
                    {isActive ? "Active" : outcome.hasWon ? "Passed" : "Failed"}
                </Badge>
            </HStack>

            {isSelected && (
                <>
                    <HStack spacing={4} align="center" mb={4}>
                        <ProposerAvatar authorAddress={proposal.author} boxSize={42} />
                        <VStack align="start" spacing={1}>
                            <Text color="gray.200" fontSize="sm">
                                {ensName || formatEthAddress(proposal.author)}
                            </Text>

                            <Text color="gray.400" fontSize="xs">
                                {new Date(proposal.start * 1000).toLocaleDateString()} -{" "}
                                {new Date(proposal.end * 1000).toLocaleDateString()}
                            </Text>
                            <Text fontSize="18px" ml={4} border="1px solid limegreen" p={4}>
                                {(() => {
                                    console.log("proposal.summary:", proposal.summary);
                                    return proposal.summary;
                                })()}
                            </Text>

                        </VStack>
                    </HStack>

                    <Box mb={4}>
                        <Box height="20px" width="100%" bg="gray.700" borderRadius="md" overflow="hidden">
                            <Box height="100%" width={`${forPercentage}%`} bg="green.400" float="left"></Box>
                            <Box height="100%" width={`${againstPercentage}%`} bg="red.400" float="right"></Box>
                        </Box>
                        <HStack justifyContent="space-between" mt={2}>
                            <Text fontSize="sm" color="green.300">{proposal.scores[0]} For</Text>
                            <Text fontSize="sm" color="red.300">{proposal.scores[1]} Against</Text>
                        </HStack>
                    </Box>

                    {isActive && (
                        <HStack spacing={3}>
                            {proposal.choices.map((choice, index) => (
                                <Button
                                    key={index}
                                    colorScheme={choice.toUpperCase() === "FOR" ? "green" : "red"}
                                    variant="outline"
                                    onClick={() => onClickVote(index)}
                                    size="sm"
                                    borderRadius="full"
                                >
                                    {choice.toUpperCase()}
                                </Button>
                            ))}
                        </HStack>
                    )}

                    {!isActive && (
                        <Center mt={4}>
                            <Text fontSize="sm" color="gray.400">
                                Quorum: {outcome.quorumReached ? "Reached" : "Not Reached"} (
                                {outcome.totalVotes} Votes)
                            </Text>
                        </Center>
                    )}
                </>
            )}
        </Box>
    );
};

export default ProposalListItem;
