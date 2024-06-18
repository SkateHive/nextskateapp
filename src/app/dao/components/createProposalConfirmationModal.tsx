import { MarkdownRenderers } from '@/app/upload/utils/MarkdownRenderers';
import { useHiveUser } from '@/contexts/UserContext';
import { commentWithKeychain } from '@/lib/hive/client-functions';
import { Button, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay } from "@chakra-ui/react";
import { Web3Provider } from '@ethersproject/providers';
import React, { useCallback, useMemo, useState } from 'react';
import Confetti from 'react-confetti';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { createProposal } from '../utils/createProposal';
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
    const [state, setState] = useState({ currentBlockNumber: 0, confetti: false });
    const hiveUser = useHiveUser();

    const fetchCurrentBlockNumber = useCallback(async () => {
        const blockNumber = await web3.getBlockNumber();
        return blockNumber;
    }, [web3]);

    const handleCreateProposal = useCallback(async () => {
        try {
            const currentBlockNumber = await fetchCurrentBlockNumber();

            if (currentBlockNumber <= 0) {
                throw new Error('Invalid block number, please try again');
            }
            const proPostPermlink = generatePermlink(title);
            const currentTimeInSeconds = Math.floor(Date.now() / 1000);
            const start = currentTimeInSeconds;
            const end = start + 172800;

            const propostBody = `
            ---
            HiveUser: ${hiveUser?.hiveUser?.name}
            PermLink: ${proPostPermlink}
            ---
            ${proposalBody}
            `


            let proposalData = {
                space: "skatehive.eth",
                type: ProposalType.SingleChoice,
                title: title,
                body: propostBody,
                discussion: '',
                choices: ['For', 'Against'],
                start: start,
                end: end,
                snapshot: currentBlockNumber,
                plugins: JSON.stringify({}),
                app: 'Skatehive App'
            };

            const hivePostMetadata = {
                "data": {
                    username: hiveUser?.hiveUser?.name,
                    title: title,
                    body: '> ProPost !' + proposalBody,
                    parent_perm: "blog",
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
                                    account: 'steemskate',
                                    weight: 5000
                                }]
                            }]
                        ]
                    })
                }
            };

            const response = await commentWithKeychain(hivePostMetadata);
            if (response?.success) {
                const receipt = await createProposal(web3, proposalData);
                setState({ currentBlockNumber, confetti: true });

            } else {
                throw new Error('Hive post unsuccessful');
            }
        } catch (error: any) {
            console.error("Failed to create proposal:", error);
            alert("Error creating proposal: " + error.message);
        }
    }, [web3, proposalBody, title, hiveUser, fetchCurrentBlockNumber]);

    return (
        <>
            {state.confetti && <Confetti />}
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent minH={"60vh"} color={"white"} border={'1px solid limegreen'} bg={'black'}>
                    <ModalHeader>Proposal Preview</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <ReactMarkdown
                            components={MarkdownRenderers}
                            remarkPlugins={[remarkGfm]}
                            rehypePlugins={[rehypeRaw]}
                        >
                            {proposalBody}
                        </ReactMarkdown>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="outline" colorScheme="green" mr={3} onClick={handleCreateProposal}>
                            Confirm
                        </Button>
                        <Button variant="outline" colorScheme="red" mr={3} onClick={onClose}>
                            Close
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
};

export default React.memo(CreateProposalConfirmationModal);
