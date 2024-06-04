
'use client';
import {
    Box,
    Button,
    HStack,
    VStack, useBreakpointValue
} from "@chakra-ui/react";
import { Web3Provider } from '@ethersproject/providers';
import { useEffect, useMemo, useState } from "react";
import CreateProposalConfirmationModal from "./createProposalConfirmationModal";
import ProposalEditor from "./ProposalEditor";
import ProposalPreview from "./ProposalPreview";

const hub = 'https://hub.snapshot.org';

interface CreateProposalModalProps {
    connectedUserAddress: string;
}

const CreateProposalModal = ({ connectedUserAddress }: CreateProposalModalProps) => {
    const [spaceInfo, setSpaceInfo] = useState({});
    const [value, setValue] = useState('');
    const [currentBlockNumber, setCurrentBlockNumber] = useState(0);
    const web3 = useMemo(() => new Web3Provider(window.ethereum), []);
    const [title, setTitle] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const PINATA_GATEWAY_TOKEN = process.env.NEXT_PUBLIC_PINATA_GATEWAY_TOKEN;
    const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);

    const fetchCurrentBlockNumber = async () => {
        const blockNumber = await web3.getBlockNumber();
        setCurrentBlockNumber(blockNumber);
    };
    useEffect(() => {
        fetchSpaceInfo();
        fetchCurrentBlockNumber();
    }, []);



    const fetchSpaceInfo = async () => {
        try {
            const response = await fetch('https://hub.snapshot.org/api/spaces/skatehive.eth');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setSpaceInfo(data);
        } catch (error) {
            console.error('Failed to fetch space information:', error);
            alert('Failed to fetch space settings.');
        }
    };

    return (
        <Box>
            {useBreakpointValue({
                base: (
                    <VStack spacing="4">
                        <ProposalEditor
                            value={value}
                            setValue={setValue}
                            title={title}
                            setTitle={setTitle}
                            setIsUploading={setIsUploading}
                            PINATA_GATEWAY_TOKEN={PINATA_GATEWAY_TOKEN}
                        />
                        <ProposalPreview value={value} />
                    </VStack>
                ),
                md: (
                    <HStack>
                        <Box width="50%">
                            <ProposalEditor
                                value={value}
                                setValue={setValue}
                                title={title}
                                setTitle={setTitle}
                                setIsUploading={setIsUploading}
                                PINATA_GATEWAY_TOKEN={PINATA_GATEWAY_TOKEN}
                            />
                        </Box>
                        <Box width="50%">
                            <ProposalPreview value={value} />
                        </Box>
                    </HStack>
                )

            })}
            <Button
                width={"100%"}
                mt={4}
                colorScheme="green"
                variant={"outline"}
                onClick={() => {
                    setIsConfirmationModalOpen(true);
                }}
            >
                Create Proposal
            </Button>
            <Button
                width={"100%"}
                mt={4}
                colorScheme="green"
                variant={"outline"}
                onClick={() => {
                    console.log(spaceInfo);
                }}
            >
                Log Space Details
            </Button>
            {isConfirmationModalOpen && (
                <CreateProposalConfirmationModal
                    proposalBody={value}
                    isOpen={isConfirmationModalOpen}
                    connectedUserAddress={connectedUserAddress}
                    onClose={() => setIsConfirmationModalOpen(false)}
                    title={title}
                />
            )}
        </Box>
    );
};

export default CreateProposalModal;
