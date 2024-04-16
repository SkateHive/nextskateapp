import { Box, Badge, HStack, Text, Center } from "@chakra-ui/react"
import React from "react"
import { Proposal } from "../utils/fetchProposals"
import { useEnsAvatar, useEnsName } from "wagmi"
import { normalize } from "viem/ens"
import { mainnet } from "viem/chains"
import ProposerAvatar from "./proposerAvatar"

const formatEthAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
}

function ProposalListItem({
    proposal,
    setMainProposal,
    setProposerName,
}: {
    proposal: Proposal
    setMainProposal: (proposal: Proposal) => void
    setProposerName: (author: string) => void
}) {
    const handleSelectProposal = (proposal: Proposal) => {
        setMainProposal(proposal)
        setProposerName(proposal.author)
    }
    const result = useEnsName({
        address: proposal.author as `0x${string}`,
        chainId: mainnet.id,
    })
    const resultAvatar = useEnsAvatar({
        name: normalize(result.data || ""),
        chainId: mainnet.id,
    })

    return (
        <Box
            cursor={"pointer"}
            onClick={() => handleSelectProposal(proposal)}
            key={proposal.id}
            bg="#201d21"
            p={4}
            border="0.6px solid yellow"
            borderRadius="10px"
        >
            <HStack justifyContent={"space-between"}>
                <Text>{proposal.title}</Text>
                <Badge> {proposal.state} </Badge>
            </HStack>


            <Text
                border={"0.6px solid darkgrey"}
                p={2}
                mt={2}
                mb={2}
                borderRadius={5}
                fontSize={"12px"}
            >
                Summary: {decodeURIComponent(proposal.summary ?? "")}
            </Text>
            <HStack ml={2} justifyContent={'flex-end'}>
                <Center>
                    <ProposerAvatar authorAddress={proposal.author} />
                    <Text ml={2}> {result.data || formatEthAddress(proposal.author)}</Text>
                </Center>
            </HStack>

        </Box>
    )
}

export default ProposalListItem