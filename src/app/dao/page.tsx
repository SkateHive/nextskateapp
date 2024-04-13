'use client'
import React, { useState, useEffect } from "react";
import { Box, Stack, Text, Center, Button } from "@chakra-ui/react";
import fetchProposals from "./utils/fetchProposals";
import { Proposal } from "./utils/fetchProposals";
import getSummary from "@/lib/getSummaryAI";
import { useAccount } from "wagmi"
import snapshot from '@snapshot-labs/snapshot.js';
import { Web3Provider } from '@ethersproject/providers';

const hub = 'https://hub.snapshot.org';
const client = new snapshot.Client712(hub);

const DaoPage = () => {
    const [proposals, setProposals] = useState<Proposal[]>([]);
    const [loadingProposals, setLoadingProposals] = useState(true);
    const [loadingSummaries, setLoadingSummaries] = useState(false);
    const ethAccount = useAccount();

    useEffect(() => {
        fetchProposals({ setProposals, setLoadingProposals, setLoadingSummaries });

    }, []);

    const voteOnProposal = async (proposalId: string, choiceId: number) => {
        console.log(proposals)

        if (!ethAccount.isConnected) {
            alert('Please connect your wallet');
            return;
        }
        const web3 = new Web3Provider(window.ethereum);
        const [account] = await web3.listAccounts();
        const receipt = await client.vote(web3, account, {
            space: 'skatehive.eth',
            proposal: proposalId,
            type: 'single-choice',
            choice: choiceId,
            reason: 'I believe this choice makes the most sense.',
            app: 'Skatehive App'
        });
        console.log('Voting receipt:', receipt);
    };

    return (
        <Box>
            <Center>
                <Text fontSize="28px" color="limegreen">DAO</Text>
            </Center>
            <Stack>
                {loadingProposals ? (
                    <Center>
                        <Text fontSize="28px" color="limegreen">Loading...</Text>
                    </Center>
                ) : (
                    proposals.map((proposal, i) => (
                        <Box key={i} bg="black" p={4} border="0.6px solid limegreen" borderRadius="none">
                            <Text>Title: {proposal.title}</Text>
                            <Text>Summary: {decodeURIComponent(proposal.summary ?? '')}</Text>
                            {proposal.choices.map((choice, choiceIndex) => (
                                <Button key={choiceIndex} onClick={() => voteOnProposal(proposal.id, choiceIndex + 1)}>
                                    {choice}
                                </Button>
                            ))}
                        </Box>
                    ))
                )}
            </Stack>
        </Box>
    );
};

export default DaoPage;
