'use client'
import useAuthHiveUser from "@/lib/useHiveAuth";
import { transformIPFSContent } from "@/lib/utils";
import { Avatar, Badge, Box, Button, Center, Checkbox, Divider, Flex, HStack, Image, Input, Slider, SliderFilledTrack, SliderThumb, SliderTrack, Spinner, Text, Tooltip, VStack } from "@chakra-ui/react";
import MDEditor, { commands } from '@uiw/react-md-editor';
import React, { RefObject, useEffect, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import { FaImage, FaSave } from "react-icons/fa";
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import PreviewModal from "./components/previewModal";
import AuthorSearchBar from "./components/searchBar";
import { MarkdownRenderers } from "./utils/MarkdownRenderers";
import { extractImageUrls } from "./utils/extractImages";
import { uploadFileToIPFS } from "./utils/uploadToIPFS";

const PINATA_GATEWAY_TOKEN = process.env.NEXT_PUBLIC_PINATA_GATEWAY_TOKEN;


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
    const [title, setTitle] = useState('');
    const [value, setValue] = useState('');
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

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setValue(localStorage.getItem('draft') || '');
        }
    }, []);

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
            'video/*': [".mp4", ".mov"],
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
            icon: (<Tooltip label="Save Draft" ><span><FaSave color="#A5D6A7" /></span></Tooltip>),
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

    const renderThumbnailOptions = () => {
        const selectedThumbnailStyle = {
            border: '2px solid #A5D6A7',
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
                    <Image
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
        const updatedNewTags = newTagInputs.map((tag, tagIndex) => tagIndex === index ? newValue : tag);
        setNewTagInputs(updatedNewTags);
    };

    const handlePost = async () => {
        const combinedTags = [
            ...tags,
            ...newTagInputs.filter(tag => tag.trim() !== "")
        ];

        setTags(combinedTags);

        setShowPreview(true);
    }

    const handleAuthorSearch = (searchUsername: string) => {
        const percentage = 10;

        const beneficiaryExists = beneficiaries.some(b => b.name === searchUsername);

        if (!beneficiaryExists && percentage > 0) {
            const newBeneficiary = { name: searchUsername, percentage };
            setBeneficiaries(prevBeneficiaries => [...prevBeneficiaries, newBeneficiary]);
        } else {
            alert(`Beneficiary ${searchUsername} already exists or percentage is zero.`);
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
        if (index < 0 || index >= beneficiaries.length) {
            console.error('Invalid index for beneficiaries:', index);
            return;
        }

        const updatedBeneficiaries = [...beneficiaries];
        updatedBeneficiaries[index].percentage = newPercentage;
        setBeneficiaries(updatedBeneficiaries);
    };

    const [showTooltip, setShowTooltip] = React.useState(false);

    const handleCheckMark = () => {
        setIsChecked(!isChecked);
    }
    const handleDefaultBeneficiaryPercentageChange = (index: number, newPercentage: number) => {
        if (index < 0 || index >= defaultBeneficiaries.length) {
            console.error('Invalid index for default beneficiaries:', index);
            return;
        }

        const updatedDefaultBeneficiaries = [...defaultBeneficiaries];
        updatedDefaultBeneficiaries[index].percentage = newPercentage;
    }

    const handleChange = (value: string) => {
        localStorage.setItem('draft', value);
        setValue(value || localStorage.getItem('draft') || '');
    }



    return (
        <Box width="100%" overflow="hidden">
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

            <Input {...getInputProps()} id="md-image-upload" style={{ display: 'none' }} size="md" />

            <Flex direction={{ base: 'column', md: 'row' }} >
                <Box width={{ base: '100%', md: '50%' }} p="4">
                    <HStack>
                        <Input
                            borderColor={"green.600"}
                            color={"#A5D6A7"}
                            _placeholder={{ color: "#A5D6A7", opacity: 0.4 }}
                            focusBorderColor="#A5D6A7"
                            placeholder="Insert title"
                            style={{ caretColor: "#A5D6A7" }}
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)} />
                    </HStack>

                    <Box marginTop="3" {...getRootProps()} >
                        {isUploading && <Center m={3}><Spinner color="#A5D6A7" /></Center>}

                        <MDEditor
                            value={value}
                            onChange={(value) => handleChange(value || '')}
                            commands={[
                                commands.bold, commands.italic, commands.strikethrough, commands.hr, commands.code, commands.table, commands.link, commands.quote, commands.unorderedListCommand, commands.orderedListCommand, commands.codeBlock, commands.fullscreen
                            ]
                            }
                            extraCommands={extraCommands}
                            height="700px"
                            preview="edit"
                            style={{
                                border: "1px solid #A5D6A7",
                                padding: "10px",
                                backgroundColor: "black",
                            }}
                        />
                    </Box>
                    <VStack>

                        <Badge width={"100%"} mt={5} size="24px" color="#A5D6A7" background={"green.600"}
                            border={"1px solid #A5D6A7"} {...getRootProps()}>
                            <Center>
                                <VStack padding={5}>

                                    <Text fontSize={"22px"} color="black">Select Thumbnail</Text>
                                    <Flex flexWrap="wrap">{renderThumbnailOptions()}</Flex>
                                </VStack>
                            </Center>

                        </Badge>

                        <Badge width={"100%"} mt={5} cursor={"pointer"} size="24px" color="#A5D6A7"
                            background={"green.600"}
                            border={"1px solid #A5D6A7"}
                            onClick={() => setShowAdvanced(!showAdvanced)}>
                            <Center>
                                <Text fontSize={"22px"} color="black">
                                    Show Advanced Options
                                </Text>
                            </Center>
                        </Badge>
                    </VStack>
                    {showAdvanced && <Box marginTop="3">
                        <Box marginTop="3">
                            <Center>

                                <Badge
                                    color="#A5D6A7" background={"green.600"} marginBottom={3} >
                                    <Text fontSize={"22px"} color="#A5D6A7">Tags</Text>
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
                                        color={"#A5D6A7"}
                                        _placeholder={{ color: "#A5D6A7", opacity: 0.4 }}
                                        focusBorderColor="#A5D6A7"
                                    />
                                ))}
                            </Flex>
                            <Center>
                                <Badge
                                    color="#A5D6A7" background={"green.600"} margin={2}>
                                    <Tooltip label="Your Photographer/Video Maker deserves it">
                                        <Text fontSize={"22px"} color="#A5D6A7">Split Rewards</Text>
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
                                            id={`slider-${index}`}
                                            defaultValue={beneficiary.percentage}
                                            min={0}
                                            max={100}
                                            colorScheme="green"
                                            onChange={(val) => handleDefaultBeneficiaryPercentageChange(index, val)}
                                            onMouseEnter={() => setShowTooltip(true)}
                                            onMouseLeave={() => setShowTooltip(false)}
                                        >
                                            <SliderTrack>
                                                <SliderFilledTrack bg="#A5D6A7" />
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
                                                colorScheme="green"
                                                onChange={(val) => handleBeneficiaryPercentageChange(index, val)}
                                                onMouseEnter={() => setShowTooltip(true)}
                                                onMouseLeave={() => setShowTooltip(false)}
                                            >
                                                <SliderTrack>
                                                    <SliderFilledTrack bg="#A5D6A7" />
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
                            colorScheme="blue"
                            variant={"outline"}

                        >
                            Submit
                        </Button>
                    </Center>

                </Box>
                <Box h={"100vh"} mt={4} width={{ base: '100%', md: '50%' }} p="4" borderRadius="2px" border="1px solid #A5D6A7">
                    <HStack>
                        <Avatar name={hiveUser?.name} src={hiveUser?.metadata?.profile?.profile_image} boxSize="58px" borderRadius={'10px'} />
                        <Box borderRadius="4px" width="100%">
                            <Text ml={5} color={"green.200"} fontSize="28px">{title}</Text>
                        </Box>
                    </HStack>
                    <Divider my={5} />
                    <Box maxH="90vh" overflow="auto" p={1} borderRadius="md">
                        <ReactMarkdown components={MarkdownRenderers} rehypePlugins={[rehypeRaw]} remarkPlugins={[remarkGfm]}>
                            {(transformIPFSContent(value))}
                        </ReactMarkdown>
                    </Box>
                </Box>
            </Flex>
        </Box>
    );
}
