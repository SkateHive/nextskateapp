'use client'

import React, { useState, useCallback, useEffect } from "react";
import { Box, Button, Input, HStack, Flex, Center, Text, Avatar, Spinner, Badge, VStack, Tooltip } from "@chakra-ui/react";
import { useDropzone } from "react-dropzone";
import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import useAuthHiveUser from "@/lib/useHiveAuth";
import { MarkdownRenderers } from "./MarkdownRenderers";
import { FaImage, FaSave } from "react-icons/fa";
import { uploadFileToIPFS } from "./uploadToIPFS";
import MDEditor, { commands } from '@uiw/react-md-editor';

const PINATA_GATEWAY_TOKEN = process.env.NEXT_PUBLIC_PINATA_GATEWAY_TOKEN;
const tutorialPost = `# Tutorial 

Write your article here, you can use markdown and html for it. If you never done that, read that post on the right and pay attention how is it made in the left blue side. After that, you can erase everything our use that template and the toolbar above to help. 

> Complete [Upload/Markdown guide](https://docs.skatehive.app/docs/tutorial-basics/share-ur-content)

---

#### You can upload videos/images by dragging then here at the blue prompt, our clicking in the yellow image icon above

---

<iframe src="https://ipfs.skatehive.app/ipfs/QmPdsChTSXQkqu3FLJHcAjqdLCqq5bCcnC1dKwCB8oLA1S?pinataGatewayToken=nxHSFa1jQsiF7IHeXWH-gXCY3LDLlZ7Run3aZXZc8DRCfQz4J4a94z9DmVftXyFE" allowfullscreen></iframe>

### You can use: 

- divider lines
- tables
- quotes
- codes
- (un)ordered lists


**Be creative**, if you dont feel like it, go post in [/plaza](https://skatehive.app/plaza)


| ![](https://www.skatehive.app/assets/skatehive.jpeg) | ![](https://www.skatehive.app/assets/skatehive.jpeg)
|--------|--------|
| You can use Images| or videos Side by Side |

# > Using HTML : [HTML TAGS LIST](https://www.w3schools.com/TAGs/)

<center> <h1>YOU CAN CENTER STUFF</h1> </center>

<marquee> <h2> YOU CAN DO SOME FUN STUFF </h2></marquee>



`;


export default function Upload() {
    const [title, setTitle] = useState('Example post w/ Tutorial');
    const [value, setValue] = useState(tutorialPost);
    const [isUploading, setIsUploading] = useState(false);
    const { hiveUser } = useAuthHiveUser();
    const [tags, setTags] = useState<string[]>([]);
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);


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
        //@ts-ignore
        accept: 'image/*,video/mp4',
        multiple: false
    });
    // Custom toolbar button for file upload
    const extraCommands = [
        {
            name: 'uploadImage',
            keyCommand: 'uploadImage',
            buttonProps: { 'aria-label': 'Upload image' },
            icon: (<Tooltip label="Upload Image or Video"><FaImage color="yellow" /></Tooltip>),
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
            icon: (<Tooltip label="Save Draft" ><FaSave color="limegreen" /></Tooltip>),
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

    const extractImageUrls = (markdownText: string): string[] => {
        const regex = /!\[.*?\]\((.*?)\)/g;
        const imageUrls: string[] = [];
        let match = regex.exec(markdownText);
        while (match) {
            imageUrls.push(match[1]);
            match = regex.exec(markdownText);
        }
        return imageUrls;
    };


    const renderThumbnailOptions = () => {
        const selectedThumbnailStyle = {
            border: '2px solid limegreen',
        };

        const imageUrls = extractImageUrls(value);


        const options = imageUrls.map((imageUrl, index) => (
            <HStack>

                <Box
                    key={index}
                    cursor="pointer"
                    width="100px"
                    height="100px"
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    onClick={() => {
                        setThumbnailUrl(imageUrl);
                    }}
                    style={imageUrl === thumbnailUrl ? selectedThumbnailStyle : {}}
                >
                    <img
                        src={imageUrl}
                        alt={`Thumbnail ${index}`}
                        style={{ maxWidth: "100%", maxHeight: "100%" }}
                    />
                </Box>
            </HStack>
        ));

        return options;
    };


    return (
        <Box width="100%">
            {/* Hidden file input for image upload */}
            <input {...getInputProps()} id="md-image-upload" style={{ display: 'none' }} />

            <Flex direction={{ base: 'column', md: 'row' }} width="100%">
                {/* Content Editing Area */}
                <Box width={{ base: '100%', md: '50%' }} p="4">
                    <Center>
                        <Text fontSize={"22px"} color="limegreen">Title</Text>

                    </Center>
                    <Input borderRadius={"0"} placeholder="Insert title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
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
                            height="600px"
                            preview="edit"
                            style={{
                                border: "1px solid limegreen",
                                padding: "10px",
                                backgroundColor: "navy",
                            }}
                        />
                    </Box>
                    <VStack>

                        <Badge width={"100%"} mt={5} size="24px" color="limegreen" {...getRootProps()}>
                            <Center>
                                <VStack>

                                    <Text fontSize={"22px"} color="limegreen">Select Thumbnail</Text>
                                    <Flex flexWrap="wrap">{renderThumbnailOptions()}</Flex>
                                </VStack>
                            </Center>

                        </Badge>

                        <Badge width={"100%"} mt={5} cursor={"pointer"} size="24px" color="limegreen" onClick={() => setShowAdvanced(!showAdvanced)}>
                            <Center>
                                <Text fontSize={"22px"} color="limegreen">
                                    Show Advanced Options
                                </Text>
                            </Center>
                        </Badge>
                    </VStack>
                    {showAdvanced && <Box marginTop="3">
                        <Box marginTop="3">
                            <Text fontSize={"22px"} color="limegreen">Tags</Text>
                            <Input borderRadius={"0"} placeholder="Insert tags" type="text" value={tags.join(",")} onChange={(e) => setTags(e.target.value.split(","))} />
                        </Box>
                    </Box>}
                    <Center>

                        <Button
                            mt={5}
                            onClick={() => console.log('Submit', title, value)}
                            isDisabled={isUploading}
                            w={"100%"}
                            colorScheme="green"
                            variant={"outline"}

                        >
                            Submit
                        </Button>
                    </Center>

                </Box>
                {/* Preview and Submit Area */}
                <Box width={{ base: '100%', md: '50%' }} p="4" border="1px solid limegreen" borderRadius="2px">
                    <HStack>
                        <Avatar name={hiveUser?.name} src={hiveUser?.metadata?.profile?.profile_image} boxSize="58px" borderRadius={'4px'} border={"1px solid limegreen"} />
                        <Box border="1px solid limegreen" p="7" borderRadius="4px" width="100%">
                            <Text fontSize="28px">{title}</Text>
                        </Box>
                    </HStack>
                    <Box overflowY="auto" p="10px" borderRadius="4px" border="1px solid limegreen" height="80%">
                        <ReactMarkdown components={MarkdownRenderers} rehypePlugins={[rehypeRaw]} remarkPlugins={[remarkGfm]}>
                            {value}
                        </ReactMarkdown>
                    </Box>
                </Box>
            </Flex>
        </Box>
    );
}
