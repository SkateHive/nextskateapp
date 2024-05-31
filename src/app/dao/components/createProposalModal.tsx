
'use client';
import { MarkdownRenderers } from "@/app/upload/utils/MarkdownRenderers";
import { uploadFileToIPFS } from "@/app/upload/utils/uploadToIPFS";
import {
    Box,
    Button,
    Center,
    HStack,
    Input,
    Spinner,
    Tooltip,
    VStack, useBreakpointValue
} from "@chakra-ui/react";
import { Web3Provider } from '@ethersproject/providers';
import snapshot from '@snapshot-labs/snapshot.js';
import MDEditor, { commands } from '@uiw/react-md-editor';
import { useEffect, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import { FaImage, FaSave } from "react-icons/fa";
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';
import CreateProposalConfirmationModal from "./createProposalConfirmationModal";



const hub = 'https://hub.snapshot.org';
const client = new snapshot.Client712(hub);

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

    const { getRootProps, getInputProps } = useDropzone({
        noClick: true,
        noKeyboard: true,
        onDrop: async (acceptedFiles) => {
            setIsUploading(true);
            for (const file of acceptedFiles) {
                const ipfsData = await uploadFileToIPFS(file);
                if (ipfsData !== undefined) {
                    const ipfsUrl = `https://ipfs.skatehive.app/ipfs/${ipfsData.IpfsHash}?pinataGatewayToken=${PINATA_GATEWAY_TOKEN}`;
                    const markdownLink = file.type.startsWith("video/") ? `<iframe src="${ipfsUrl}" allowfullscreen></iframe>` : `![Image](${ipfsUrl})`;
                    setValue(prevMarkdown => `${prevMarkdown}\n${markdownLink}\n`);
                }
            }
            setIsUploading(false);
        },
        accept: {
            'image/*': ['.png', '.gif', '.jpeg', '.jpg'],
            'video/*': ['.mp4', '.mov']
        },
        multiple: false
    }
    );
    const extraCommands = [
        {
            name: 'uploadImage',
            keyCommand: 'uploadImage',
            buttonProps: { 'aria-label': 'Upload image' },
            icon: (<Tooltip label="Upload Image or Video"><span><FaImage color="yellow" /></span></Tooltip>),
            execute: (state: any, api: any) => {

                const element = document.getElementById('md-image-upload');
                if (element) {
                    element.click();
                }
            }
        },
        {
            name: 'saveDraftInTxt',
            keyCommand: 'saveDraftInTxt',
            buttonProps: { 'aria-label': 'Save Draft' },
            icon: (<Tooltip label="Save Draft" ><span><FaSave color="#A5D6A7" /></span></Tooltip>),
            execute: (state: any, api: any) => {
                const element = document.createElement('a');
                const file = new Blob([value], { type: 'text/plain' });
                element.href = URL.createObjectURL(file);
                element.download = "draft.txt";
                document.body.appendChild(element);
                element.click();
            }
        }

    ];
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
                base: <VStack spacing="4">
                    <Box
                        width="100%"
                    >
                        <Input
                            placeholder="Proposal Title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            borderColor={"green.600"}
                            border={"2px solid"}
                            color={"#A5D6A7"}
                            _placeholder={{ color: "#A5D6A7", opacity: 0.4 }}
                            focusBorderColor="#A5D6A7"
                        />
                        <Box  {...getRootProps()} >
                            {isUploading && <Center><Spinner /></Center>}

                            <MDEditor
                                value={value}
                                onChange={(value: any) => setValue(value || "")}
                                commands={[
                                    commands.bold, commands.italic, commands.strikethrough, commands.hr, commands.code, commands.table, commands.link, commands.quote, commands.unorderedListCommand, commands.orderedListCommand, commands.codeBlock, commands.fullscreen
                                ]}
                                extraCommands={extraCommands}
                                previewOptions={{ rehypePlugins: [[rehypeSanitize]] }}
                                height="600px"
                                preview="edit"
                                style={{
                                    border: "2px solid #A5D6A7",
                                    padding: "10px",
                                    backgroundColor: "black",
                                }}
                            />
                        </Box>
                    </Box>
                    <Box
                        width="100%"
                        height="100%"
                        border="1px solid #A5D6A7"
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
                        <Box marginTop="3" {...getRootProps()} >
                            {isUploading && <Center><Spinner /></Center>}

                            <MDEditor
                                value={value}
                                onChange={(value: any) => setValue(value || "")}
                                commands={[
                                    commands.bold, commands.italic, commands.strikethrough, commands.hr, commands.code, commands.table, commands.link, commands.quote, commands.unorderedListCommand, commands.orderedListCommand, commands.codeBlock, commands.fullscreen
                                ]}
                                extraCommands={extraCommands}
                                previewOptions={{ rehypePlugins: [[rehypeSanitize]] }}
                                height="600px"
                                preview="edit"
                                style={{
                                    border: "1px solid #A5D6A7",
                                    padding: "10px",
                                    backgroundColor: "black",
                                }}
                            />
                        </Box>
                    </Box>
                    <Box
                        width="50%"
                        height="100%"
                        border="1px solid #A5D6A7"
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
            {isConfirmationModalOpen && <CreateProposalConfirmationModal proposalBody={value} isOpen={isConfirmationModalOpen} connectedUserAddress={connectedUserAddress} onClose={() => setIsConfirmationModalOpen(false)} title={title} />}

        </Box>
    );
};

export default CreateProposalModal;
