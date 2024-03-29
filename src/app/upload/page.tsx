'use client'

import React, { useState, useCallback } from "react";
import { Box, Button, Input, HStack, Flex, Center, Text, Avatar, Spinner } from "@chakra-ui/react";
import MDEditor from "@uiw/react-md-editor";
import { useDropzone } from "react-dropzone";
import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import useAuthHiveUser from "@/lib/useHiveAuth";
import { MarkdownRenderers } from "./MarkdownRenderers";
import { FaImage } from "react-icons/fa";

const PINATA_API_KEY = process.env.NEXT_PUBLIC_PINATA_API_KEY;
const PINATA_SECRET = process.env.NEXT_PUBLIC_PINATA_SECRET;
const PINATA_GATEWAY_TOKEN = process.env.NEXT_PUBLIC_PINATA_GATEWAY_TOKEN;

export default function Upload() {
    const [title, setTitle] = useState('');
    const [value, setValue] = useState("Write your post, you can use markdown and html don't be lazy");
    const [isUploading, setIsUploading] = useState(false);
    const { hiveUser } = useAuthHiveUser();

    const { getRootProps, getInputProps } = useDropzone({
        noClick: true, // Disable opening the file dialog on click
        noKeyboard: true, // Disable opening the file dialog with keyboard
        onDrop: async (acceptedFiles) => {
            setIsUploading(true);
            for (const file of acceptedFiles) {
                await uploadFileToIPFS(file);
            }
            setIsUploading(false);
        },
        //@ts-ignore
        accept: 'image/*,video/mp4',
        multiple: false
    });

    const uploadFileToIPFS = async (file: File) => {
        const formData = new FormData();
        formData.append("file", file);

        const uploadUrl = "https://api.pinata.cloud/pinning/pinFileToIPFS";
        try {
            const response = await fetch(uploadUrl, {
                method: "POST",
                headers: {
                    "pinata_api_key": PINATA_API_KEY!,
                    "pinata_secret_api_key": PINATA_SECRET!,
                },
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                const ipfsUrl = `https://ipfs.skatehive.app/ipfs/${data.IpfsHash}?pinataGatewayToken=${PINATA_GATEWAY_TOKEN}`;
                const markdownLink = file.type.startsWith("video/") ? `<iframe src="${ipfsUrl}" allowfullscreen></iframe>` : `![Image](${ipfsUrl})`;
                setValue(prevMarkdown => `${prevMarkdown}\n${markdownLink}\n`);
            } else {
                console.error("Error uploading file to Pinata IPFS:", await response.text());
            }
        } catch (error) {
            console.error("Error uploading file:", error);
        }
    };

    // Custom toolbar button for file upload
    const extraCommands = [
        {
            name: 'uploadImage',
            keyCommand: 'uploadImage',
            buttonProps: { 'aria-label': 'Upload image' },
            icon: (<FaImage color="limegreen" />),
            execute: (state: any, api: any) => {
                // Trigger file input click
                const element = document.getElementById('md-image-upload');
                if (element) {
                    element.click();
                }
            }
        }
    ];

    return (
        <Box width="100%">
            {/* Hidden file input for image upload */}
            <input {...getInputProps()} id="md-image-upload" style={{ display: 'none' }} />

            <Flex direction={{ base: 'column', md: 'row' }} width="100%">
                {/* Content Editing Area */}
                <Box width={{ base: '100%', md: '50%' }} p="4">
                    <Text color="white">Title</Text>
                    <Input placeholder="Insert title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
                    <Box marginTop="3" {...getRootProps()}>
                        <Text color="white">Content</Text>
                        {isUploading && <Center><Spinner /></Center>}

                        <MDEditor
                            value={value}
                            onChange={(value) => setValue(value || "")}
                            extraCommands={extraCommands}
                            previewOptions={{ rehypePlugins: [[rehypeSanitize]] }}
                            height="600px"
                            preview="edit"
                        />
                    </Box>
                </Box>
                {/* Preview and Submit Area */}
                <Box width={{ base: '100%', md: '50%' }} p="4" border="1px solid limegreen" borderRadius="20px">
                    <HStack>
                        <Avatar name={hiveUser?.name} src={hiveUser?.metadata?.profile?.profile_image} boxSize="88px" />
                        <Box border="1px solid limegreen" p="7" borderRadius="10" width="100%">
                            <Text fontSize="38px">{title}</Text>
                        </Box>
                    </HStack>
                    <Box overflowY="auto" p="10px" borderRadius="10px" border="1px solid limegreen" height="80%">
                        <ReactMarkdown components={MarkdownRenderers} rehypePlugins={[rehypeRaw]} remarkPlugins={[remarkGfm]}>
                            {value}
                        </ReactMarkdown>
                    </Box>
                    <Button onClick={() => console.log('Submit', title, value)} isDisabled={isUploading}>Submit</Button>
                </Box>
            </Flex>
        </Box>
    );
}
