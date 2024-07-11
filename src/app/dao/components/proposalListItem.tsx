import React from 'react';
import { Badge, Box, Center, HStack, Text } from "@chakra-ui/react";
import { mainnet } from "viem/chains";
import { normalize } from "viem/ens";
import { useEnsAvatar, useEnsName } from "wagmi";
import { checkProposalOutcome } from "../utils/checkProposalOutcome";
import { Proposal } from "../utils/fetchProposals";
import ProposerAvatar from "./proposerAvatar";

const formatEthAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

// Utility function to check if the proposal is active
const isProposalActive = (proposal: Proposal) => {
    const currentTime = Date.now();
    const startTime = proposal.start * 1000;
    const endTime = proposal.end * 1000;
    return startTime < currentTime && endTime > currentTime;
};


const ProposalListItem = React.memo(({
    proposal,
    isSelected,
    onSelect,
}: {
    proposal: Proposal;
    isSelected: boolean;
    onSelect: () => void;
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

    return (
        <Box
            cursor="pointer"
            onClick={onSelect}
            key={proposal.id}
            bg="#201d21"
            p={4}
            borderRadius="10px"
        >
            <HStack justifyContent="space-between">
                <Text color="white">{proposal.title}</Text>
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
                        fontSize="12px"
                        color="white"
                    >
                        Summary: {decodeURIComponent(proposal.summary ?? "")}
                    </Text>

                    <HStack ml={2} justifyContent="flex-end">
                        <Center>
                            <ProposerAvatar authorAddress={proposal.author} />
                            <Text color="blue.200" ml={2}>
                                {ensName || formatEthAddress(proposal.author)}
                            </Text>
                        </Center>
                    </HStack>
                </>
            )}
        </Box>
    );
});

export default ProposalListItem;
