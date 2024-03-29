// src/components/upload/index.tsx

// create form to create post, with title , MDeditor and submit button

'use client'

import { Box, Button, Heading, Text, Input, HStack, Flex, Avatar, Center, Icon } from "@chakra-ui/react"
import MDEditor, { commands } from "@uiw/react-md-editor";
import React, { useEffect, useState, useCallback } from "react";
import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';
import useAuthHiveUser from "@/lib/useHiveAuth"
import { MarkdownRenderers } from "./MarkdownRenderers";
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { FaPlus } from "react-icons/fa"; // This is assuming you're using react-icons for icons


export default function Upload() {
    const [value, setValue] = useState("Write your post, you can use markdown and html dont be lazy");
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [preview, setPreview] = useState('');
    const { hiveUser, loginWithHive, logout, isLoggedIn } = useAuthHiveUser();
    const [instaURL, setInstaURL] = useState('');
    const handleTitleChange = (e: any) => {
        setTitle(e.target.value);
    }
    const handleSubmit = () => {
        console.log('title:', title);
        console.log('content:', value);
    }

    useEffect(() => {
        setPreview(content);
    }, [content])


    const [isDragging, setIsDragging] = useState(false);

    const onDragEnter = useCallback((event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragging(true);
    }, []);

    const onDragLeave = useCallback((event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();

        setIsDragging(false);
    }, []);

    const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragging(true);
    }, []);

    const onDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragging(false); // Reset drag state
        event.stopPropagation();

        const files = event.dataTransfer.files;
        if (files.length) {
            // Process files here
            // For example, create a markdown image or video link and append to the editor value
            console.log('Dropped files:', files);
        }
    }, []);



    return (
        <Box width="100%">
            <Flex direction={{ base: 'column', md: 'row' }} width="100%">
                <Box width={{ base: '100%', md: '50%' }} padding="4">
                    <Box>
                        <Text color={"white"}>Title</Text>
                        <Input placeholder="Insert title, dumbass" type="text" value={title} onChange={handleTitleChange} />
                        {/* <Text color={"white"}>Upload from Instagram</Text>
                        <Input placeholder="" type="text" value={instaURL} /> */}
                    </Box>
                    <Box marginTop={3}>
                        <Text color={"white"}>Content</Text>
                        <Box
                            onDragOver={onDragOver}
                            onDragEnter={onDragEnter}
                            onDragLeave={onDragLeave}
                            onDrop={onDrop}
                            style={{
                                height: '800px',
                                border: isDragging ? '2px dashed limegreen' : '2px dashed transparent',
                                position: 'relative',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'border 0.2s ease-in-out',
                            }}
                        >
                            {isDragging && (
                                <Center position="absolute" top="50%" left="50%" transform="translate(-50%, -50%)">
                                    <Icon as={FaPlus} w={10} h={10} color="limegreen" />
                                </Center>
                            )}
                            <MDEditor
                                onChange={(value, event, state) => setValue(value || "")}
                                value={value}
                                previewOptions={{
                                    rehypePlugins: [[rehypeSanitize]],
                                }}
                                preview="edit"
                                height={'100%'}
                                style={{ width: '100%', opacity: isDragging ? 0.3 : 1 }} // Adjust the opacity based on dragging state
                            />
                        </Box>
                    </Box>
                </Box>
                <Box width={{ base: '100%', md: '50%' }} padding="4" border={"1px solid limegreen"} borderRadius={"20px"}
                >
                    <HStack>
                        <Box
                            border={"1px solid limegreen"}
                            p={5}
                            borderRadius={10}
                        >

                            <Avatar
                                name={hiveUser?.name}
                                src={hiveUser?.metadata?.profile.profile_image}
                                borderRadius={"100%"}
                                boxSize={'88px'}
                                bg="gray.200"
                            />

                            <Text>{hiveUser?.name}</Text>
                        </Box>
                        <Box
                            display="flex"
                            justifyContent="center" // Horizontally center
                            alignItems="center" // Vertically center
                            border="1px solid limegreen"
                            p={7}
                            borderRadius={10}
                            width="100%"
                            minHeight="150px" // Ensure this is enough to observe vertical centering
                        >
                            <Text fontSize={"38px"}>{title} </Text>
                        </Box>
                    </HStack>
                    <Box overflowY="auto" p="10px" borderRadius={"10px"} border={"1px solid limegreen"} height={"80%"}>
                        <ReactMarkdown
                            components={MarkdownRenderers}
                            rehypePlugins={[rehypeRaw]}
                            remarkPlugins={[remarkGfm]}
                        >
                            {value}
                        </ReactMarkdown>
                    </Box>
                    <Box p={5}>
                        <Button onClick={handleSubmit}>Submit</Button>
                    </Box>
                </Box>
            </Flex>

        </Box>
    )
}
