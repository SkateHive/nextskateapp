// src/components/upload/index.tsx

// create form to create post, with title , MDeditor and submit button

'use client'

import { Box, Button, Heading, Text, Input, HStack, Flex, Avatar } from "@chakra-ui/react"
import MDEditor, { commands } from "@uiw/react-md-editor";
import { useEffect } from "react";
import { useState } from "react";
import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';
// get user info from context 
import useAuthHiveUser from "@/lib/useHiveAuth"
import { MarkdownRenderers } from "./MarkdownRenderers";
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';

export default function Upload() {
    const [value, setValue] = useState("Write your post, you can use markdown and html dont be lazy");
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [preview, setPreview] = useState('');
    const { hiveUser, loginWithHive, logout, isLoggedIn } = useAuthHiveUser();

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

    return (
        <Box width="100%">
            <Flex direction={{ base: 'column', md: 'row' }} width="100%">
                <Box width={{ base: '100%', md: '50%' }} padding="4">
                    <Box>
                        <Text>Title</Text>
                        <Input placeholder="Insert title, dumbass" type="text" value={title} onChange={handleTitleChange} />
                    </Box>
                    <Box>
                        <Text>Content</Text>
                        <MDEditor
                            onChange={(value, event, state) => setValue(value || "")}
                            value={value}
                            previewOptions={{
                                rehypePlugins: [[rehypeSanitize]],
                            }}
                            preview="edit"
                            minHeight={600}

                        />
                    </Box>
                </Box>
                <Box width={{ base: '100%', md: '50%' }} padding="4">
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
                                size="md"
                                bg="gray.200"
                            />
                            <Text>{hiveUser?.name}</Text>
                        </Box>
                        <Text>{title} </Text>
                    </HStack>
                    <Box overflowY="auto" border={"1px solid limegreen"} p="10px" borderRadius={"10px"}>
                        <ReactMarkdown
                            children={value}
                            components={MarkdownRenderers}
                            rehypePlugins={[rehypeRaw]}
                            remarkPlugins={[remarkGfm]}
                        />


                    </Box>
                </Box>
            </Flex>
            <Button onClick={handleSubmit}>Submit</Button>
        </Box>
    )
}
