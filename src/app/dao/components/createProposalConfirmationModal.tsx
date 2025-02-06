import MarkdownRenderer from '@/components/ReactMarkdown/page';
import { useHiveUser } from '@/contexts/UserContext';
import { commentWithKeychain } from '@/lib/hive/client-functions';
import { Button, Center, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay } from "@chakra-ui/react";
import { Web3Provider } from '@ethersproject/providers';
import React, { useCallback, useMemo, useState } from 'react';
import Confetti from 'react-confetti';
import { createProposal } from '../utils/createProposal';
import { MarkdownRenderers } from '@/app/upload/utils/MarkdownRenderers';
import { useBlockNumber } from 'wagmi'
import { mainnet } from 'viem/chains';

export enum ProposalType {
    SingleChoice = 'single-choice',
    Approval = 'approval',
    Quadratic = 'quadratic',
    RankedChoice = 'ranked-choice',
    Weighted = 'weighted',
    Basic = 'basic'
}

interface CreateProposalConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    proposalBody: string;
    connectedUserAddress: string;
    title: string;
}

const generatePermlink = (text: string) => text.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();

const CreateProposalConfirmationModal: React.FC<CreateProposalConfirmationModalProps> = ({ isOpen, onClose, proposalBody, connectedUserAddress, title }) => {
    const web3 = useMemo(() => new Web3Provider(window.ethereum), []);
    const hiveUser = useHiveUser();
    const block_number = useBlockNumber({
        chainId: mainnet.id,
    })

    const handleCreateProposal = useCallback(async () => {
        try {

            const proPostPermlink = generatePermlink(title);
            const currentTimeInSeconds = Math.floor(Date.now() / 1000);
            const start = currentTimeInSeconds;
            const end = start + 172800;

            const propostBody = `
            ---
            user: ${hiveUser?.hiveUser?.name}
            permLink: ${proPostPermlink}
            ---
            ${proposalBody}
            `

            let proposalData = {
                space: "skatehive.eth",
                type: ProposalType.Basic,
                title: title,
                body: propostBody,
                discussion: '',
                choices: ['For', 'Against', 'Abstain'],
                start: start,
                end: end,
                snapshot: Number(block_number.data),
                plugins: JSON.stringify({}),
                app: 'Skatehive App'
            };

            const hivePostMetadata = {
                "data": {
                    username: hiveUser?.hiveUser?.name,
                    title: title,
                    body: '> ProPost !' + proposalBody,
                    parent_perm: "hive-173115",
                    json_metadata: JSON.stringify({
                        format: "markdown", description: "", tags: ['skatehive', 'skateboarding', 'proposal', 'dao', 'skatehive-proposal'], image: 'https://skatehive.com/images/skatehive-logo.png',
                    }),
                    permlink: generatePermlink(title) + "proposal",
                    comment_options: JSON.stringify({
                        author: hiveUser?.hiveUser?.name,
                        permlink: generatePermlink(title) + "proposal",
                        max_accepted_payout: '10000.000 HBD',
                        percent_hbd: 10000,
                        allow_votes: true,
                        allow_curation_rewards: true,
                        extensions: [
                            [0, {
                                beneficiaries: [{
                                    account: 'skatehive',
                                    weight: 5000
                                }]
                            }]
                        ]
                    })
                }
            };
            const response = await commentWithKeychain(hivePostMetadata);
            if (response?.success) {
                const create_proposal = await createProposal(web3, proposalData);
                console.log("createProposal Response:", create_proposal);
                onClose();
            } else {
                throw new Error('Hive post unsuccessful');
                onClose();
            }
        } catch (error: any) {
            console.error("Failed to create proposal:", error);
            alert("Error creating proposal: " + error.message);
        }
    }, [web3, proposalBody, title, hiveUser, block_number]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} size={"xl"}>
            <ModalOverlay
                style={{
                    backdropFilter: 'blur(10px)',
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                }}
            />
            <ModalContent
                maxW={{ base: "95%", md: "70%" }}
                minW={{ base: "95%", md: "70%" }}
                color="white"
                border="1px solid limegreen"
                bg="black"
            >
                <Center>
                    <ModalHeader fontSize={"28px"}>
                        Proposal Preview
                    </ModalHeader>
                </Center>
                <ModalCloseButton />
                <ModalBody>
                    <MarkdownRenderer content={proposalBody} renderers={MarkdownRenderers} />

                </ModalBody>
                <ModalFooter>
                    <Button variant="outline" color="limegreen" mr={3} onClick={handleCreateProposal}>
                        Confirm
                    </Button>
                    <Button variant="outline" colorScheme="red" mr={3} onClick={onClose}>
                        Close
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default React.memo(CreateProposalConfirmationModal);
