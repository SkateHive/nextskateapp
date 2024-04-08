'use client'

import React, { useState, useCallback, useEffect, useRef, RefObject } from "react";
import { Checkbox, Box, Button, Input, HStack, Flex, Center, Text, Avatar, Spinner, Badge, VStack, Tooltip, Slider, SliderTrack, SliderFilledTrack, SliderThumb } from "@chakra-ui/react";
import { useDropzone } from "react-dropzone";
import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import useAuthHiveUser from "@/lib/useHiveAuth";
import { MarkdownRenderers } from "./utils/MarkdownRenderers";
import { FaImage, FaSave } from "react-icons/fa";
import { uploadFileToIPFS } from "./utils/uploadToIPFS";
import MDEditor, { commands } from '@uiw/react-md-editor';
import AuthorSearchBar from "./utils/searchBar";
import hiveUpload from "./utils/hiveUpload";
import { extractImageUrls } from "./utils/extractImages";
import PreviewModal from "./components/previewModal";


const PINATA_GATEWAY_TOKEN = process.env.NEXT_PUBLIC_PINATA_GATEWAY_TOKEN;

const tutorialPost = `# Tutorial 

![Image](https://ipfs.skatehive.app/ipfs/QmYkb6yq2nXSccdMwmyNWXND8T1exqUW1uUiMAQcV4nfVP?pinataGatewayToken=nxHSFa1jQsiF7IHeXWH-gXCY3LDLlZ7Run3aZXZc8DRCfQz4J4a94z9DmVftXyFE)


Write your article here, you can use markdown and html for it. If you never done that, read that post on the right and pay attention how is it made in the left blue side. After that, you can erase everything our use that template and the toolbar above to help. 

> Complete [Upload/Markdown guide](https://docs.skatehive.app/docs/tutorial-basics/share-ur-content)

---

#### You can upload videos/images by dragging then here at the blue prompt, our clicking in the yellow image icon above

---

<iframe src="https://ipfs.skatehive.app/ipfs/QmPdsChTSXQkqu3FLJHcAjqdLCqq5bCcnC1dKwCB8oLA1S?pinataGatewayToken=nxHSFa1jQsiF7IHeXWH-gXCY3LDLlZ7Run3aZXZc8DRCfQz4J4a94z9DmVftXyFE" autoplay={false} allowfullscreen></iframe>

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

interface Beneficiary {
    name: string;
    percentage: number;
}
interface BeneficiaryForBroadcast {
    account: string;
    weight: string;
}

const defaultBeneficiaries: Beneficiary[] = [
    { name: 'skatedev', percentage: 2 },
    { name: 'steemskate', percentage: 3 },
];

export default function Upload() {
    const [title, setTitle] = useState('Example post w/ Tutorial');
    const [value, setValue] = useState(tutorialPost);
    const [isUploading, setIsUploading] = useState(false);
    const { hiveUser } = useAuthHiveUser();
    const defaultTags = ["skatehive", "skateboarding", "leofinance", "sportstalk", "hive-engine"];
    const [tags, setTags] = useState([...defaultTags]);
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [thumbnailUrl, setThumbnailUrl] = useState<string | null>("https://ipfs.skatehive.app/ipfs/QmYkb6yq2nXSccdMwmyNWXND8T1exqUW1uUiMAQcV4nfVP?pinataGatewayToken=nxHSFa1jQsiF7IHeXWH-gXCY3LDLlZ7Run3aZXZc8DRCfQz4J4a94z9DmVftXyFE");
    const [newTagInputs, setNewTagInputs] = useState(Array(5).fill(""));
    const searchBarRef: RefObject<HTMLDivElement> = useRef(null);
    const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
    const [showPreview, setShowPreview] = useState(false);
    const [isChecked, setIsChecked] = useState(true);

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

    const renderThumbnailOptions = () => {
        const selectedThumbnailStyle = {
            border: '2px solid limegreen',
        };

        const imageUrls = extractImageUrls(value);


        const options = imageUrls.map((imageUrl, index) => (
            <HStack
                key={index}
            >

                <Box
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

    const handleNewTagChange = (index: number, newValue: string) => {
        // Update the specific new tag input by index
        const updatedNewTags = newTagInputs.map((tag, tagIndex) => tagIndex === index ? newValue : tag);
        setNewTagInputs(updatedNewTags);
    };

    const handlePost = async () => {
        // Directly combine the tags for this operation instead of relying on state update
        const combinedTags = [
            ...tags,
            ...newTagInputs.filter(tag => tag.trim() !== "")
        ];

        setTags(combinedTags);

        setShowPreview(true);
    }
    // (username: string, title: string, body: string, beneficiariesArray: any[], thumbnail: string, tags: any[],
    const handleAuthorSearch = (searchUsername: string) => {
        const percentage = 10;

        // Check if the beneficiary already exists
        const beneficiaryExists = beneficiaries.some(b => b.name === searchUsername);

        if (!beneficiaryExists && percentage > 0) {
            const newBeneficiary = { name: searchUsername, percentage };
            setBeneficiaries(prevBeneficiaries => [...prevBeneficiaries, newBeneficiary]);
            // alert(`Beneficiary ${searchUsername} added! Please set the percentage using the sliders below.`);
        } else {
            // alert(`Beneficiary ${searchUsername} already exists or percentage is zero.`);
        }

    };

    const beneficiariesArray: BeneficiaryForBroadcast[] = [
        ...beneficiaries,
        ...defaultBeneficiaries,
    ].sort((a, b) => a.name.localeCompare(b.name))
        .map(beneficiary => ({
            account: beneficiary.name,
            weight: (beneficiary.percentage * 100).toFixed(0),
        }));

    const handleBeneficiaryPercentageChange = (index: number, newPercentage: number) => {
        const updatedBeneficiaries = [...beneficiaries];
        updatedBeneficiaries[index].percentage = newPercentage;
        setBeneficiaries(updatedBeneficiaries);
    };
    const [showTooltip, setShowTooltip] = React.useState(false);

    const handleCheckMark = () => {
        setIsChecked(!isChecked);
    }

    return (
        <Box width="100%">
            {showPreview &&
                <PreviewModal
                    isOpen={showPreview}
                    onClose={() => {
                        setShowPreview(false)
                    }
                    }
                    title={title}
                    body={value}
                    thumbnailUrl={thumbnailUrl || "https://ipfs.skatehive.app/ipfs/QmYkb6yq2nXSccdMwmyNWXND8T1exqUW1uUiMAQcV4nfVP?pinataGatewayToken=nxHSFa1jQsiF7IHeXWH-gXCY3LDLlZ7Run3aZXZc8DRCfQz4J4a94z9DmVftXyFE"}
                    user={hiveUser!}
                    beneficiariesArray={beneficiariesArray}
                    tags={tags}
                />}

            {/* Hidden file input for image upload */}
            <Input {...getInputProps()} id="md-image-upload" style={{ display: 'none' }} size="md" />

            <Flex direction={{ base: 'column', md: 'row' }} width="100%">
                {/* Content Editing Area */}
                <Box width={{ base: '100%', md: '50%' }} p="4">
                    <Center>
                        <Badge
                            background={"green.600"}
                            border={"1px solid limegreen"}
                        >
                            <Text fontSize={"22px"} color="limegreen">Title</Text>
                        </Badge>

                    </Center>
                    <Input
                        borderColor={"green.600"}
                        color={"limegreen"}
                        _placeholder={{ color: "limegreen", opacity: 0.4 }}
                        focusBorderColor="limegreen"
                        borderRadius={"0"}
                        placeholder="Insert title"
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)} />
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

                        <Badge width={"100%"} mt={5} size="24px" color="limegreen" background={"green.600"}
                            border={"1px solid limegreen"} {...getRootProps()}>
                            <Center>
                                <VStack>

                                    <Text fontSize={"22px"} color="limegreen">Select Thumbnail</Text>
                                    <Flex flexWrap="wrap">{renderThumbnailOptions()}</Flex>
                                </VStack>
                            </Center>

                        </Badge>

                        <Badge width={"100%"} mt={5} cursor={"pointer"} size="24px" color="limegreen"
                            background={"green.600"}
                            border={"1px solid limegreen"}
                            onClick={() => setShowAdvanced(!showAdvanced)}>
                            <Center>
                                <Text fontSize={"22px"} color="limegreen">
                                    Show Advanced Options
                                </Text>
                            </Center>
                        </Badge>
                    </VStack>
                    {showAdvanced && <Box marginTop="3">
                        <Box marginTop="3">
                            <Center>

                                <Badge
                                    color="limegreen" background={"green.600"} marginBottom={3} >
                                    <Text fontSize={"22px"} color="limegreen">Tags</Text>
                                </Badge>
                            </Center>
                            <Flex>
                                {newTagInputs.map((tag, index) => (
                                    <Input
                                        key={index}
                                        value={tag}
                                        onChange={(e) => handleNewTagChange(index, e.target.value)}
                                        placeholder={`New Tag ${index + 1}`}
                                        size="md"
                                        mr={2}
                                        borderColor={"green.600"}
                                        color={"limegreen"}
                                        _placeholder={{ color: "limegreen", opacity: 0.4 }}
                                        focusBorderColor="limegreen"
                                    />
                                ))}
                            </Flex>
                            <Center>
                                <Badge
                                    color="limegreen" background={"green.600"} margin={2}>
                                    <Tooltip label="Your Photographer/Video Maker deserves it">
                                        <Text fontSize={"22px"} color="limegreen">Split Rewards</Text>
                                    </Tooltip>

                                </Badge>
                            </Center>
                            <AuthorSearchBar onSearch={handleAuthorSearch} />
                            <Checkbox defaultChecked colorScheme="green" size="lg" onChange={handleCheckMark} >Support Devs</Checkbox>

                            {isChecked &&
                                defaultBeneficiaries.map((beneficiary, index) => (
                                    <Box key={index}>
                                        <Center>
                                            <Avatar
                                                size="sm"
                                                src={`https://images.ecency.com/webp/u/${beneficiary.name}/avatar/small`}
                                                mr={2}
                                            />
                                            <Text>
                                                {beneficiary.name} - {beneficiary.percentage}%
                                            </Text>
                                        </Center>
                                        <Slider
                                            id={`slider-${index}`} // Ensure unique ID for each slider
                                            defaultValue={beneficiary.percentage}
                                            min={0}
                                            max={100}
                                            colorScheme="green"
                                            onChange={(val) => handleBeneficiaryPercentageChange(index, val)}
                                            onMouseEnter={() => setShowTooltip(true)}
                                            onMouseLeave={() => setShowTooltip(false)}
                                        >
                                            <SliderTrack>
                                                <SliderFilledTrack bg="limegreen" />
                                            </SliderTrack>
                                            <Tooltip
                                                hasArrow
                                                bg="gray.300"
                                                color="black"
                                                placement="top"
                                                isOpen={showTooltip}
                                                label={`${beneficiary.percentage}%`}
                                            >
                                                <SliderThumb boxSize={6} />
                                            </Tooltip>
                                        </Slider>
                                    </Box>
                                ))
                            }

                            <Box marginTop={4}>
                                <Box ref={searchBarRef}>

                                    {beneficiaries.map((beneficiary, index) => (
                                        <Box key={index}>
                                            <Center>
                                                <Avatar
                                                    size="sm"
                                                    src={`https://images.ecency.com/webp/u/${beneficiary.name}/avatar/small`}
                                                    // @ts-ignore
                                                    alt="author"
                                                    mr={2}
                                                />
                                                <Text>
                                                    {beneficiary.name} - {beneficiary.percentage}%
                                                </Text>
                                            </Center>
                                            <Slider
                                                id="slider"
                                                defaultValue={beneficiary.percentage}
                                                min={0}
                                                max={100}
                                                colorScheme="green" // This affects the color of the slider thumb and filled track
                                                onChange={(val) => handleBeneficiaryPercentageChange(index, val)}
                                                onMouseEnter={() => setShowTooltip(true)}
                                                onMouseLeave={() => setShowTooltip(false)}
                                            >
                                                <SliderTrack>
                                                    <SliderFilledTrack bg="limegreen" /> {/* Customizing the filled track color */}
                                                </SliderTrack>
                                                <Tooltip
                                                    hasArrow
                                                    bg="gray.300"
                                                    color="black"
                                                    placement="top"
                                                    isOpen={showTooltip}
                                                    label={`${beneficiary.percentage}%`}
                                                >
                                                    <SliderThumb boxSize={6} />
                                                </Tooltip>
                                            </Slider>
                                        </Box>
                                    ))}
                                </Box>
                            </Box>
                        </Box>
                    </Box>}
                    <Center>

                        <Button
                            mt={5}
                            onClick={() => handlePost()}
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
