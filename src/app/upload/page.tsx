// src/components/upload/index.tsx

// create form to create post, with title , MDeditor and submit button

'use client'

import { Box, Button, Heading, Text, Input, HStack, Flex, Avatar, Center, Icon } from "@chakra-ui/react"
import MDEditor, { commands } from "@uiw/react-md-editor";
import React, { useEffect, useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';
import useAuthHiveUser from "@/lib/useHiveAuth"
import { MarkdownRenderers } from "./MarkdownRenderers";
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { FaPlus } from "react-icons/fa"; // This is assuming you're using react-icons for icons

const PINATA_API_KEY = process.env.NEXT_PUBLIC_PINATA_API_KEY
const PINATA_SECRET = process.env.NEXT_PUBLIC_PINATA_SECRET
const PINATA_GATEWAY_TOKEN = process.env.NEXT_PUBLIC_PINATA_GATEWAY_TOKEN



export default function Upload() {
    const [value, setValue] = useState("Write your post, you can use markdown and html dont be lazy");
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [preview, setPreview] = useState('');
    const { hiveUser, loginWithHive, logout, isLoggedIn } = useAuthHiveUser();
    const [instaURL, setInstaURL] = useState('');

    const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
    const [uploadedVideo, setUploadedVideo] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isVideoUploaded, setIsVideoUploaded] = useState(false);
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [videoUploadProgress, setVideoUploadProgress] = useState(0);
    const [videoInfo, setVideoInfo] = useState<any | null>(null);
    const [username, setUsername] = useState<string | null>(null);

    useEffect(() => {
        if (hiveUser) {
            setUsername(hiveUser.name);
        }
    }, [hiveUser])



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

    const onDropImages = async (acceptedFiles: File[]) => {
        setIsUploading(true);

        // if it is a photo, upload to IPFS
        if (acceptedFiles[0].type.startsWith("image/")) {
            for (const file of acceptedFiles) {
                await uploadFileToIPFS(file);
            }

            setIsUploading(false);
            return;
        }
    };
    const onDropVideos = async (acceptedFiles: File[]) => {
        setIsUploading(true);

        for (const file of acceptedFiles) {
            await uploadFileToIPFS(file);
        }

        setIsUploading(false);
    };
    const { getRootProps: getImagesRootProps, getInputProps: getImagesInputProps } = useDropzone({
        onDrop: onDropImages,
        //@ts-ignore
        accept: "image/*",
        multiple: false,
    });
    const { getRootProps: getVideosRootProps, getInputProps: getVideosInputProps } = useDropzone({
        onDrop: onDropVideos,
        //@ts-ignore
        accept: "video/mp4",
        multiple: false,
    });

    const onDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragging(false); // Reset drag state
        event.stopPropagation();

        const files = event.dataTransfer.files;
        if (files.length) {
            return
        }
        // test if file is image or video 
        // if image, upload to IPFS
        const file = files[0];
        if (file.type.startsWith("image/")) {
            console.log('image file:', file);
            onDropImages([file]);
        } else if (file.type.startsWith("video/")) {
            console.log('video file:', file);
            onDropVideos([file]);
        } else {
            alert("Invalid file type. Only video files (MP4) and images are allowed.");
        }
    }
        , []);



    const uploadFileToIPFS = async (file: File) => {
        try {
            if (file.type.startsWith("video/mp4")) {
                // Handle video file upload
                const formData = new FormData();
                formData.append("file", file);
                formData.set("Content-Type", "multipart/form-data");
                console.log('formData:', formData);
                const response = await fetch(
                    "https://api.pinata.cloud/pinning/pinFileToIPFS",
                    {
                        method: "POST",
                        //@ts-ignore
                        headers: {
                            "pinata_api_key": PINATA_API_KEY,
                            "pinata_secret_api_key": PINATA_SECRET,
                        },
                        body: formData,
                    }
                );

                if (response.ok) {
                    const data = await response.json();
                    const ipfsUrl = `https://ipfs.skatehive.app/ipfs/${data.IpfsHash}?pinataGatewayToken=nxHSFa1jQsiF7IHeXWH-gXCY3LDLlZ7Run3aZXZc8DRCfQz4J4a94z9DmVftXyFE`;
                    console.log('ipfsUrl:', ipfsUrl);
                    setUploadedVideo(ipfsUrl);

                    const transformedLink = `<iframe src="${ipfsUrl}" allowfullscreen></iframe>` + " ";

                    setValue((prevMarkdown) => prevMarkdown + `\n${transformedLink}` + '\n');
                    setUploadedFiles((prevFiles) => [...prevFiles, ipfsUrl]);
                } else {
                    const errorData = await response.json();
                    console.error("Error uploading video file to Pinata IPFS:", errorData);
                }
            } else if (file.type.startsWith("image/")) {
                // Handle image file upload
                const formData = new FormData();
                formData.append("file", file);
                formData.set("Content-Type", "multipart/form-data");
                console.log('formData:', formData);
                const response = await fetch(
                    "https://api.pinata.cloud/pinning/pinFileToIPFS",
                    {
                        method: "POST",
                        //@ts-ignore
                        headers: {
                            "pinata_api_key": PINATA_API_KEY,
                            "pinata_secret_api_key": PINATA_SECRET,
                        },
                        body: formData,
                    }
                );
                console.log('response:', response);
                if (response.ok) {
                    const data = await response.json();
                    const ipfsUrl = `https://ipfs.skatehive.app/ipfs/${data.IpfsHash}?pinataGatewayToken=nxHSFa1jQsiF7IHeXWH-gXCY3LDLlZ7Run3aZXZc8DRCfQz4J4a94z9DmVftXyFE`;
                    console.log('ipfsUrl:', ipfsUrl);
                    const transformedLink = ` ![Image](${ipfsUrl})` + " ";

                    setValue((prevMarkdown) => prevMarkdown + `\n${transformedLink}` + '\n');
                    setUploadedFiles((prevFiles) => [...prevFiles, ipfsUrl]);
                } else {
                    const errorData = await response.json();
                    console.error("Error uploading image file to Pinata IPFS:", errorData);
                }
            } else {
                alert("Invalid file type. Only video files (MP4) and images are allowed.");
            }
        } catch (error) {
            console.error("Error uploading file:", error);
        }
    };
    useEffect(() => {
        if (videoFile) {
            uploadFileToIPFS(videoFile);

        }
    }
        , [videoFile]);

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
