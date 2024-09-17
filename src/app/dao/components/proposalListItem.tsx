import React from 'react';
import { Badge, Box, Button, Center, Flex, HStack, Progress, Text, VStack } from "@chakra-ui/react";
import { mainnet } from "viem/chains";
import { normalize } from "viem/ens";
import { useEnsAvatar, useEnsName } from "wagmi";
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
    const { data: ensName, error: ensNameError } = useEnsName({
        address: proposal.author as `0x${string}`,
        chainId: mainnet.id,
    });

    const { data: ensAvatar, error: ensAvatarError } = useEnsAvatar({
        name: normalize(ensName || ""),
        chainId: mainnet.id,
    });

    const outcome = checkProposalOutcome(proposal);
    const isActive = isProposalActive(proposal);

    function setConfirmationModalOpen(arg0: boolean) {
        throw new Error('Function not implemented.');
    }

    return (
        <Box
            cursor="pointer"
            onClick={onSelect}
            key={proposal.id}
            bg="#201d21"
            p={2}
            borderRadius="10px"
        >
            <HStack justifyContent={"space-between"}>
                <VStack justifyContent="flex-start" w={'20%'}>
                    <ProposerAvatar authorAddress={proposal.author} />
                    <Center>
                        <Text color="blue.200" ml={2} >
                            {ensName || formatEthAddress(proposal.author)}
                        </Text>
                    </Center>
                </VStack>
                <Box maxW={"60%"} justifyContent={"flex-start"}>
                    <Text color="white" isTruncated>{proposal.title}</Text>
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
                    <Text
                        border="0.6px solid darkgrey"
                        p={2}
                        mt={2}
                        mb={2}
                        borderRadius={5}
                        fontSize="16px"
                        color="white"
                    >
                        Summary: {decodeURIComponent(proposal.summary ?? "")}
                    </Text>
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

                    <Box p={4} border="0.6px solid #A5D6A7" color={"green.200"}>
                        <Text fontSize={"18px"}>{proposal.title}</Text>
                    </Box>

                    <Box p={4} border="0.6px solid #A5D6A7" borderTop={"none"}>
                        <Text fontSize="16px" color="#A5D6A7">
                            {proposal.scores[0]} For
                        </Text>
                        <Progress value={proposal.scores[0]} colorScheme="green" size="sm" />
                        <Text fontSize="16px" color="#A5D6A7">
                            {proposal.scores[1]} Against
                        </Text>
                        <Progress value={proposal.scores[1]} colorScheme="red" size="sm" />

                        {proposal.state !== "active" && (
                            <Center>
                                <Text fontSize="14px" color="#A5D6A7" mt={5}>
                                    Quorum: {checkProposalOutcome(proposal).quorumReached ? "Reached" : "Not Reached"} (
                                    {checkProposalOutcome(proposal).totalVotes} Votes)
                                </Text>
                            </Center>
                        )}

                        {proposal.state === "active" &&
                            proposal.choices.map((choice, choiceIndex) => (
                                <Button
                                    mt={4}
                                    colorScheme={choice.toUpperCase() === "FOR" ? "green" : "red"}
                                    variant="outline"
                                    key={choiceIndex}
                                    onClick={() => {
                                        setSelectedChoice(choiceIndex);
                                        setConfirmationModalOpen(true);
                                    }}
                                >
                                    {choice.toUpperCase()}
                                </Button>
                            ))}
                    </Box>


                </>
            )}
        </Box>
    );
};

export default ProposalListItem;
