import React, { useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Web3Provider } from '@ethersproject/providers';
import { Button, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, Text } from "@chakra-ui/react";
import { get, set } from "lodash";
import { MarkdownRenderers } from '@/app/upload/utils/MarkdownRenderers';
import { createProposal } from '../utils/createProposal';
import Confetti from 'react-confetti';

export enum ProposalType {
    SingleChoice = 'single-choice',
    Approval = 'approval',
    Quadratic = 'quadratic',
    RankedChoice = 'ranked-choice',
    Weighted = 'weighted',
    Basic = 'basic'
}
export interface ProposalData {
    from?: string;
    space: string;
    timestamp?: number;
    type: ProposalType;
    title: string;
    body: string;
    discussion: string;
    choices: string[];
    start: number;
    end: number;
    snapshot: number;
    plugins: string;
    app?: string;
}

interface CreateProposalConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    proposalBody: string;
    connectedUserAddress: string;
    title: string;
}

const CreateProposalConfirmationModal: React.FC<CreateProposalConfirmationModalProps> = ({ isOpen, onClose, proposalBody, connectedUserAddress, title }) => {
    const web3 = useMemo(() => new Web3Provider(window.ethereum), []);
    const [currentBlockNumber, setCurrentBlockNumber] = useState(0);
    const [confetti, setConfetti] = useState(true);

    const fetchCurrentBlockNumber = async () => {
        const blockNumber = await web3.getBlockNumber();
        console.log('Current block number:', blockNumber);
        setCurrentBlockNumber(blockNumber);
    };

    const handleCreateProposal = async (web3: Web3Provider, proposalBody: string, connectedUserAddress: string, title: string) => {
        await fetchCurrentBlockNumber();
        const currentTimeInSeconds = Math.floor(Date.now() / 1000);
        const start = currentTimeInSeconds;
        const end = start + 172800;  // 48 hours converted to seconds

        let ProposalData = {
            space: "skatehive.eth",
            type: "single-choice" as ProposalType,
            title: title,
            body: proposalBody,
            discussion: '',
            choices: ['For', 'Against'],
            start: start,
            end: end,
            snapshot: currentBlockNumber,
            plugins: JSON.stringify({}),
            app: 'Skatehive App'
        };
        try {


            const receipt = await createProposal(web3, ProposalData);
            console.log('Proposal receipt:', receipt);
            alert('Proposal submitted successfully!');
        } catch (error: any) {
            console.error("Failed to create proposal:", error);
            alert("Error creating proposal: " + error.message);
        }
    }

    return (
        <>
            {confetti && <Confetti />}

            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
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
                        <Button colorScheme="blue" mr={3} onClick={() => handleCreateProposal(web3, proposalBody, connectedUserAddress, title)}>
                            Confirm
                        </Button>
                        <Button colorScheme="green" mr={3} onClick={onClose}>
                            Close
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
};

export default CreateProposalConfirmationModal;