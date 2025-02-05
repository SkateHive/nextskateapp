'use client';
import { uploadFileToIPFS } from "@/app/upload/utils/uploadToIPFS";
import { Box, Center, Input, Spinner, Tooltip } from "@chakra-ui/react";
import MDEditor, { commands } from '@uiw/react-md-editor';
import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import { FaImage, FaSave } from "react-icons/fa";
import rehypeSanitize from 'rehype-sanitize';

interface ProposalEditorProps {
    value: string;
    setValue: React.Dispatch<React.SetStateAction<string>>;
    title: string;
    setTitle: React.Dispatch<React.SetStateAction<string>>;
    setIsUploading: React.Dispatch<React.SetStateAction<boolean>>;
    PINATA_GATEWAY_TOKEN: string | undefined;
}

const ProposalEditor: React.FC<ProposalEditorProps> = ({ value, setValue, title, setTitle, PINATA_GATEWAY_TOKEN }) => {
    const [isUploading, setIsUploading] = useState(false);

    const { getRootProps, getInputProps } = useDropzone({
        noClick: true,
        noKeyboard: true,
        onDrop: async (acceptedFiles) => {
            setIsUploading(true);
            for (const file of acceptedFiles) {
                const ipfsData = await uploadFileToIPFS(file);
                if (ipfsData !== undefined) {
                    const ipfsUrl = `https://ipfs.skatehive.app/ipfs/${ipfsData.IpfsHash}`;
                    const markdownLink = file.type.startsWith("video/") ? `<iframe src="${ipfsUrl}" allowFullScreen={true}></iframe>` : `![Image](${ipfsUrl})`;
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
    });

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
            icon: (<Tooltip label="Save Draft"><span><FaSave color="limegreen" /></span></Tooltip>),
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

    return (
        <Box {...getRootProps()}
            w={'100%'}
        >
            <Input
                placeholder="Proposal Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                borderColor={"green.600"}
                border={"2px solid"}
                color={"limegreen"}
                _placeholder={{ color: "limegreen", opacity: 0.4 }}
                focusBorderColor="limegreen"
                mb={2}
            />
            <input {...getInputProps()} id="md-image-upload" style={{ display: 'none' }} />
            {isUploading && <Center><Spinner /></Center>}
            <MDEditor
                value={value}
                onChange={(value: any) => setValue(value || "")}
                commands={[
                    commands.bold,
                    commands.italic,
                    commands.strikethrough,
                    commands.hr,
                    commands.code,
                    commands.table,
                    commands.link,
                    commands.quote,
                    commands.unorderedListCommand,
                    commands.orderedListCommand,
                    commands.fullscreen,
                    commands.codeEdit,
                    commands.codeLive,
                ]}
                extraCommands={extraCommands}
                previewOptions={{ rehypePlugins: [[rehypeSanitize]] }}
                height="50vh"
                preview="edit"
                style={{
                    border: "2px solid limegreen",
                    padding: "10px",
                    backgroundColor: "black",
                    color: "white",
                }}
            />
        </Box>
    );
};

export default ProposalEditor;
