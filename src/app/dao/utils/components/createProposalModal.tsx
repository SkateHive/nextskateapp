import React from "react";
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import MDEditor, { commands } from '@uiw/react-md-editor';
import { MarkdownRenderers } from "@/app/upload/utils/MarkdownRenderers";
import {
    Tooltip,
    Text,
    Box,
    HStack
} from "@chakra-ui/react";
import { FaImage } from "react-icons/fa";
import { FaSave } from "react-icons/fa";
import { useState } from "react";
import rehypeSanitize from 'rehype-sanitize';
import ReactMarkdown from 'react-markdown';


const CreateProposalModal = () => {
    const [value, setValue] = useState('');
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
        <HStack>

            <Box
                maxWidth={"50%"}
            >
                <MDEditor
                    value={value}
                    onChange={(value) => setValue(value || "")}
                    commands={[
                        commands.bold, commands.italic, commands.strikethrough, commands.hr, commands.code, commands.table, commands.link, commands.quote, commands.unorderedListCommand, commands.orderedListCommand, commands.codeBlock, commands.fullscreen
                    ]
                    }
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
                maxWidth={"50%"}
                height={"100%"}
                border="1px solid limegreen"
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
    );
};

export default CreateProposalModal;
