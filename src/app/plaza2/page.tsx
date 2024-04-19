'use client'
import React from "react";
import { Box, Text, Image, Center, Tooltip, Spinner } from "@chakra-ui/react";
import CommentsSection from "@/components/PostModal/commentSection";
import { Comment } from '@/hooks/comments';
import { useComments } from '@/hooks/comments';
import MDEditor from "@uiw/react-md-editor";
import { useDropzone } from "react-dropzone";
import { uploadFileToIPFS } from "../upload/utils/uploadToIPFS";

import { FaImage, FaSave } from "react-icons/fa";

import { commands } from "@uiw/react-md-editor";
import rehypeSanitize from "rehype-sanitize";



const PlazaCommentSection = () => {
    const PINATA_GATEWAY_TOKEN = process.env.NEXT_PUBLIC_PINATA_GATEWAY_TOKEN;
    const { comments } = useComments('skatehacker', 'test-advance-mode-post')
    const [value, setValue] = React.useState("**Hello world!!!**");
    const [isUploading, setIsUploading] = React.useState(false);
    const { getRootProps, getInputProps } = useDropzone({
        noClick: true,
        noKeyboard: true,
        onDrop: async (acceptedFiles) => {
            setIsUploading(true);
            for (const file of acceptedFiles) {
                const ipfsData = await uploadFileToIPFS(file); // Use the returned data directly
                if (ipfsData !== undefined) { // Ensure ipfsData is not undefined
                    const ipfsUrl = `https://ipfs.skatehive.app/ipfs/${ipfsData.IpfsHash}?pinataGatewayToken=${PINATA_GATEWAY_TOKEN}`;
                    const markdownLink = file.type.startsWith("video/") ? `<iframe src="${ipfsUrl}" allowfullscreen></iframe>` : `![Image](${ipfsUrl})`;
                    setValue(prevMarkdown => `${prevMarkdown}\n${markdownLink}\n`);
                }
            }
            setIsUploading(false);
        },
        accept: {
            'image/*': ['.png', '.gif', '.jpeg', '.jpg'],
            'video/*': ['.mp4']
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


    return (
        <Box width={"100%"}>
            <Center>
                <Text fontSize={"24px"} marginBottom={"12px"}>
                    Plaza
                </Text>
            </Center>
            <Box  {...getRootProps()} m={5} >
                {isUploading && <Center><Spinner /></Center>}

                <MDEditor
                    value={value}
                    onChange={(value) => setValue(value || "")}
                    commands={[
                        commands.bold, commands.italic, commands.strikethrough, commands.hr, commands.code, commands.table, commands.link, commands.quote, commands.unorderedListCommand, commands.orderedListCommand, commands.codeBlock, commands.fullscreen
                    ]}
                    extraCommands={extraCommands}
                    previewOptions={{ rehypePlugins: [[rehypeSanitize]] }}
                    height="200px"
                    preview="edit"

                    style={{
                        border: "2px solid limegreen",
                        padding: "10px",
                        backgroundColor: "black",
                        margin: "3px",
                    }}
                />
            </Box>
            <Center>
                <Box
                    maxW={["100%", "50%"]} // This will make the width 100% on mobile and 50% on larger screens
                >
                    <CommentsSection comments={comments} />
                </Box>
            </Center>
        </Box>
    );
}

export default PlazaCommentSection;