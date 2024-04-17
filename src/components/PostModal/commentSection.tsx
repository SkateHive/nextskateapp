import React, { useState, useEffect } from 'react';
import { Box, Stack, Text, Button, Tooltip, Spinner, Center } from '@chakra-ui/react';
import MDEditor from '@uiw/react-md-editor';
import { useDropzone } from 'react-dropzone';
import { FaImage, FaSave } from 'react-icons/fa';
import rehypeSanitize from 'rehype-sanitize';
import PostComment from '../PostCard/Comment';
import { useComments } from '@/hooks/comments'; // assuming you import useComments somewhere
import { uploadFileToIPFS } from '@/app/upload/utils/uploadToIPFS';
import { Comment } from '@/hooks/comments';
import { commands } from '@uiw/react-md-editor';
interface CommentsSectionProps {
    comments: Comment[] | undefined;
    isCommentReply?: boolean;
}

const CommentsSection = ({ comments, isCommentReply = false }: CommentsSectionProps) => {
    const [isUploading, setIsUploading] = useState(false);
    const [value, setValue] = useState('');
    const PINATA_GATEWAY_TOKEN = process.env.NEXT_PUBLIC_PINATA_GATEWAY_TOKEN;

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
            'video/*': ['.mp4']
        },
        multiple: false
    });

    if (!comments) return null;
    const filteredComments = comments.filter(comment => comment.author !== 'hivebuzz');
    const hasComments = filteredComments.length > 0;
    if (!hasComments && isCommentReply) return null;

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
        <Box
            bg="black"
            p={4}
            border={isCommentReply ? "" : "0px solid limegreen"}
            borderLeft={isCommentReply ? "1.4px solid limegreen" : ""}
            pl={isCommentReply ? 8 : 4}
            borderRadius={0}
            height="fit-content"
        >

            <Box marginTop="3" {...getRootProps()} >
                {isUploading && <Center><Spinner /></Center>}

                <MDEditor
                    value={value}
                    onChange={(value) => setValue(value || "")}
                    commands={[
                        commands.bold, commands.italic, commands.strikethrough, commands.hr, commands.code, commands.table, commands.link, commands.quote, commands.unorderedListCommand, commands.orderedListCommand, commands.codeBlock, commands.fullscreen
                    ]
                    }
                    extraCommands={extraCommands}
                    previewOptions={{ rehypePlugins: [[rehypeSanitize]] }}
                    height="150px"
                    preview="edit"
                    style={{
                        border: "none",
                        padding: "10px",
                        backgroundColor: "black",
                    }}
                />
            </Box>
            <Button
                colorScheme="green"
                size="sm"
                mt={2}
                borderRadius={0}

                alignSelf="flex-end"
            >
                Send it

            </Button>
            <Stack gap={0}>
                {hasComments ? (
                    filteredComments.reverse().map((comment, i) => (
                        <PostComment key={comment.id} comment={comment} />
                    ))
                ) : (
                    <Text w="100%" align="center">
                        Nothing yet
                    </Text>
                )}
            </Stack>
        </Box>
    );
};

export default CommentsSection;
