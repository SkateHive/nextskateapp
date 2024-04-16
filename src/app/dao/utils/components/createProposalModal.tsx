
'use client';
import React, { useState, useEffect, useMemo } from "react";
import { Web3Provider } from '@ethersproject/providers';
import snapshot from '@snapshot-labs/snapshot.js';
import {
    Tooltip, Box, HStack, VStack, useBreakpointValue, Button
} from "@chakra-ui/react";
import { FaImage, FaSave } from "react-icons/fa";
import MDEditor, { commands } from '@uiw/react-md-editor';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';
import { MarkdownRenderers } from "@/app/upload/utils/MarkdownRenderers";

export declare type ProposalType = 'single-choice' | 'approval' | 'quadratic' | 'ranked-choice' | 'weighted' | 'basic';

interface SpaceInfo {
    about: string;
    admins: string[];
    avatar: string;
    categories: string[];
    children: string[];
    validation: {
        name: ProposalType;
        settings: {
            params: {
                minScore: number;
            };
        };
    };
    name: string;
    strategies: Array<{ name: string }>;
    symbol: string;
    twitter: string;
    guidelines: string;
    network: string;
    parent: string;
    plugins: Record<string, unknown>;
    private: boolean;
    turbo: boolean;
    hibernated: boolean;
    moderators: string[];
    members: string[];
    treasuries: Array<Record<string, unknown>>;
    filters: {
        minScore: number;
        onlyMembers: boolean;
    };
    flagged: boolean;
    deleted: boolean;
    voting: {
        delay: number;
        period: number;
        type: ProposalType;
    };

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

const hub = 'https://hub.snapshot.org';
const client = new snapshot.Client712(hub);

const CreateProposalModal = () => {
    const [value, setValue] = useState('');
    const [spaceInfo, setSpaceInfo] = useState<SpaceInfo | null>(null);
    const [currentBlockNumber, setCurrentBlockNumber] = useState(0);
    const web3 = useMemo(() => new Web3Provider(window.ethereum), []);
    const extraCommands = [
        {
            name: 'uploadImage',
            keyCommand: 'uploadImage',
            buttonProps: { 'aria-label': 'Upload image' },
            icon: (<Tooltip label="Upload Image or Video"><span><FaImage color="yellow" /></span></Tooltip>),
            execute: (state: any, api: any) => {
                // Trigger file input click
                const element = document.getElementById('md-image-upload');
                if (element) {
                    element.click();
                }
            }
        },
        {
            name: 'saveDraftInTxt', // Corrected from 'saveDraftintxt'
            keyCommand: 'saveDraftInTxt', // Also corrected for consistency
            buttonProps: { 'aria-label': 'Save Draft' },
            icon: (<Tooltip label="Save Draft" ><span><FaSave color="limegreen" /></span></Tooltip>),
            execute: (state: any, api: any) => {
                // save .txt from value in the local machine
                const element = document.createElement('a');
                const file = new Blob([value], { type: 'text/plain' });
                element.href = URL.createObjectURL(file);
                element.download = "draft.txt";
                document.body.appendChild(element); // Required for this to work in FireFox
                element.click();
            }
        }

    ];
    useEffect(() => {
        fetchSpaceInfo();
        fetchCurrentBlockNumber();
    }, [web3]);

    const fetchCurrentBlockNumber = async () => {
        const blockNumber = await web3.getBlockNumber();
        setCurrentBlockNumber(blockNumber);
    };

    const fetchSpaceInfo = async () => {
        try {
            const response = await fetch('https://hub.snapshot.org/api/spaces/skatehive.eth');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data: SpaceInfo = await response.json();
            setSpaceInfo(data);
        } catch (error) {
            console.error('Failed to fetch space information:', error);
            alert('Failed to fetch space settings.');
        }
    };

    const createProposal = async () => {
        try {
            const [account] = await web3.listAccounts();
            if (!account) {
                throw new Error("No accounts available.");
            }
            if (!spaceInfo) {
                throw new Error("Space information is not loaded.");
            }
            fetchSpaceInfo();
            const currentTimeInSeconds = Math.floor(Date.now() / 1000);
            const start = currentTimeInSeconds;
            const end = start + 172800;  // 48 hours converted to seconds

            const proposalData = {
                space: "skatehive.eth",
                type: "single-choice",
                title: 'Dynamic Proposal',
                body: value,
                discussion: '',
                choices: ['For', 'Against'],
                start: start,
                end: end,
                snapshot: currentBlockNumber,
                plugins: JSON.stringify({}),
                app: 'YourAppIdentifier'
            };

            console.log("Submitting proposal with data:", JSON.stringify(proposalData, null, 2));

            const receipt = await client.proposal(web3, account, proposalData as ProposalData);
            console.log('Proposal receipt:', receipt);
            alert('Proposal submitted successfully!');
        } catch (error: any) {
            console.error("Failed to create proposal:", error);
            alert("Error creating proposal: " + error.message);
        }
    }



    //TODO: add 10000 limit caracter
    return (
        <Box>
            {useBreakpointValue({
                base: <VStack spacing="4">
                    <Box
                        width="100%" // Make full width on mobile
                    >
                        <MDEditor
                            value={value}
                            onChange={(value) => setValue(value || "")}
                            commands={[
                                commands.bold, commands.italic, commands.strikethrough, commands.hr, commands.code, commands.table, commands.link, commands.quote, commands.unorderedListCommand, commands.orderedListCommand, commands.codeBlock, commands.fullscreen
                            ]}
                            extraCommands={extraCommands}
                            previewOptions={{ rehypePlugins: [[rehypeSanitize]] }}
                            height="600px"
                            preview="edit"
                            style={{
                                border: "1px solid limegreen",
                                padding: "10px",
                                backgroundColor: "black",
                            }}
                        />
                    </Box>
                    <Box
                        width="100%" // Make full width on mobile
                        height="100%"
                        border="1px solid limegreen"
                        minHeight="100%"
                    >
                        <ReactMarkdown
                            components={MarkdownRenderers}
                            remarkPlugins={[remarkGfm]}
                            rehypePlugins={[rehypeRaw]}
                        >
                            {value}
                        </ReactMarkdown>
                    </Box>
                </VStack>, md: <HStack>
                    <Box
                        width="50%"
                    >
                        <MDEditor
                            value={value}
                            onChange={(value) => setValue(value || "")}
                            commands={[
                                commands.bold, commands.italic, commands.strikethrough, commands.hr, commands.code, commands.table, commands.link, commands.quote, commands.unorderedListCommand, commands.orderedListCommand, commands.codeBlock, commands.fullscreen
                            ]}
                            extraCommands={extraCommands}
                            previewOptions={{ rehypePlugins: [[rehypeSanitize]] }}
                            height="600px"
                            preview="edit"
                            style={{
                                border: "1px solid limegreen",
                                padding: "10px",
                                backgroundColor: "black",
                            }}
                        />
                    </Box>
                    <Box
                        width="50%"
                        height="100%"
                        border="1px solid limegreen"
                        minHeight="100%"
                    >
                        <ReactMarkdown
                            components={MarkdownRenderers}
                            remarkPlugins={[remarkGfm]}
                            rehypePlugins={[rehypeRaw]}
                        >
                            {value}
                        </ReactMarkdown>
                    </Box>
                </HStack>
            })}
            <Button
                width={"100%"}
                mt={4}
                colorScheme="green"
                variant={"outline"}
                onClick={() => {
                    createProposal();
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
        </Box>
    );
};

export default CreateProposalModal;
