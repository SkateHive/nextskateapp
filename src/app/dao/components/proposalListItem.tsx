import React, { useState } from 'react';
import { Badge, Box, Button, Center, HStack, Text } from "@chakra-ui/react";
import { checkProposalOutcome } from "../utils/checkProposalOutcome";
import { Proposal } from "../utils/fetchProposals";
import ProposerAvatar from "./proposerAvatar";
import VoteConfirmationModal from './voteWithReasonModal';
import { FormattedAddress } from "@/components/NNSAddress";


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

    const outcome = checkProposalOutcome(proposal);
    const isActive = proposal.start * 1000 < Date.now() && proposal.end * 1000 > Date.now();
    const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
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
            p={0}
            borderRadius="10px"
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
            <HStack justifyContent="space-between">
                <Box
                    bg={"blue.200"}
                    minW={"30%"}
                    borderTopLeftRadius={"10px"}
                    color={"black"}
                    height="20px"
                >
                    <Center>
                        <FormattedAddress address={proposal.author} />
                    </Center>
                </Box>
                <Box p={0} height="20px" width="100%" borderRadius="md" >
                    <Box height="100%" width={`${forPercentage}%`} bg="green.400" float="right"></Box>
                    <Box height="100%" width={`${againstPercentage}%`} bg="red.400" float="left"></Box>
                </Box>
                <Badge
                    fontSize="sm"
                    px={3}
                    py={0}
                    bg="black"
                    colorScheme={isActive ? "yellow" : outcome.hasWon ? "green" : "red"}
                    color={isActive ? "yellow.300" : outcome.hasWon ? "green.400" : "red.400"}
                    borderTopRightRadius={"10px"}
                    borderBottomLeftRadius={"10px"}
                >
                    {isActive ? "Active" : outcome.hasWon ? "Passed" : "Failed"}
                </Badge>
            </HStack>
            <Text mt={3} mb={3} color="white" fontSize="lg" fontWeight="bold" isTruncated m={2} align={isSelected ? "center" : "left"}>
                {proposal.title}
            </Text>
            {isSelected && (
                <>
                    <Text
                        fontSize="18px"
                        p={4}
                        m={2}
                        borderRadius={10}
                        color={"green"}
                        bg={"rgb(27, 23, 23)"}
                    >
                        {proposal.summary || proposal.body.slice(0, 100) + "..."}
                    </Text>


                    {true && (
                        <Center>
                            <HStack spacing={3}>
                                {proposal.choices.map((choice, index) => (
                                    <Button
                                        key={index}
                                        colorScheme={choice.toUpperCase() === "FOR" ? "green.200" : "red.200"}
                                        variant="outline"
                                        onClick={() => onClickVote(index)}
                                        size="sm"
                                        borderRadius="full"
                                    >
                                        {choice.toUpperCase()}
                                    </Button>
                                ))}
                            </HStack>
                        </Center>
                    )}
                </>
            )}
        </Box>
    );
};

export default ProposalListItem;
