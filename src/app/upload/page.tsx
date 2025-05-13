'use client'
import MarkdownRenderer from "@/components/ReactMarkdown/page";
import useAuthHiveUser from "@/lib/useHiveAuth";
import { Avatar, Badge, Box, Button, Center, Checkbox, Divider, Flex, HStack, Image, Input, Slider, SliderFilledTrack, SliderThumb, SliderTrack, Spinner, Text, Tooltip, VStack } from "@chakra-ui/react";
import MDEditor, { commands } from '@uiw/react-md-editor';
import { ArrowRightIcon } from "lucide-react";
import React, { RefObject, useEffect, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import { FaImage, FaSave } from "react-icons/fa";
import PreviewModal from "./components/previewModal";
import AuthorSearchBar from "./components/searchBar";
import { extractImageUrls } from "./utils/extractImages";
import { uploadFileToIPFS } from "./utils/uploadToIPFS";

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
    const defaultTags = ["skatehive", "skateboarding", "skate", "inleo", "neoxian", "sportstalk"];
    const [tags, setTags] = useState([...defaultTags]);
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
    const [newTagInputs, setNewTagInputs] = useState(Array(5).fill(""));
    const searchBarRef: RefObject<HTMLDivElement> = useRef(null);
    const [userBeneficiaries, setUserBeneficiaries] = useState<Beneficiary[]>([]);
    const [defaultBeneficiaryState, setDefaultBeneficiaryState] = useState(defaultBeneficiaries);
    const [showPreview, setShowPreview] = useState(false);
    const [isChecked, setIsChecked] = useState(true);
    const [isButtonVisible, setIsButtonVisible] = useState(true);
    const buttonRef = useRef(null);
    const [showTooltip, setShowTooltip] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setValue(localStorage.getItem('draft') || '');
        }
    }, []);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsButtonVisible(entry.isIntersecting);
            },
            { threshold: 0.1 }
        );

        if (buttonRef.current) {
            observer.observe(buttonRef.current);
        }

        return () => {
            if (buttonRef.current) {
                observer.unobserve(buttonRef.current);
            }
        };
    }, []);

    const { getRootProps, getInputProps } = useDropzone({
        noClick: true,
        noKeyboard: true,
        onDrop: async (acceptedFiles) => {
            setIsUploading(true);
            for (const file of acceptedFiles) {
                if (file.type !== "image/png" && file.type !== "image/jpeg" && file.type !== "image/gif" && file.type !== "video/mp4") {
                    alert("Invalid file type. Only images and videos are allowed. To use .mov files upload in Feed");
                    setIsUploading(false);
                    return;
                }
                const ipfsData = await uploadFileToIPFS(file);
                if (ipfsData !== undefined) {
                    const ipfsUrl = `https://ipfs.skatehive.app/ipfs/${ipfsData.IpfsHash}`;
                    const markdownLink = file.type.startsWith("video/") ? `<iframe src="${ipfsUrl}" allowFullScreen={true}></iframe>` : `![Image](${ipfsUrl})`;
                    setValue(prevMarkdown => `${prevMarkdown}\n${markdownLink}\n`);
                    setThumbnailUrl(acceptedFiles[0].type.startsWith("video/") ? "https://ipfs.skatehive.app/ipfs/QmWgkeX38hgWNh7cj2mTvk8ckgGK3HSB5VeNn2yn9BEnt7" : `https://ipfs.skatehive.app/ipfs/${ipfsData.IpfsHash}`);
                }
            }
            setIsUploading(false);
        },
        accept: {
            'image/*': ['.png', '.gif', '.jpeg', '.jpg'],
            'video/*': [".mp4"],
        },
        multiple: false
    });
    // TODO: We are using the same function in mainFeed.tsx we probably want to move that to utils
    const handlePaste = async (event: React.ClipboardEvent<HTMLDivElement>) => {
        const clipboardItems = event.clipboardData.items;
        const newImageList: string[] = [];

        for (const item of clipboardItems) {
            if (item.type.startsWith("image/")) {
                const blob = item.getAsFile();

                if (blob) {
                    // Convert Blob to File
                    const file = new File([blob], "pasted-image.png", { type: blob.type });

                    setIsUploading(true);
                    const ipfsData = await uploadFileToIPFS(file);
                    if (ipfsData !== undefined) {
                        const ipfsUrl = `https://ipfs.skatehive.app/ipfs/${ipfsData.IpfsHash}`;
                        const markdownLink = `![Image](${ipfsUrl})`;
                        newImageList.push(markdownLink);
                    }
                }
            }
        }

        if (newImageList.length > 0) {
            setValue((prevMarkdown) => `${prevMarkdown}\n${newImageList.join("\n")}\n`);
            setIsUploading(false);
        }
    };

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
            border: '4px solid red',
        };

        const imageUrls = extractImageUrls(value);

        const options = imageUrls.map((imageUrl, index) => (
            <HStack key={index}>
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
                    style={imageUrl === thumbnailUrl ? selectedThumbnailStyle : { opacity: '0.3' }}
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

        // Check if the total percentage of beneficiaries exceeds 100%
        const totalBeneficiaryPercentage = [...userBeneficiaries, ...(isChecked ? defaultBeneficiaryState : [])]
            .reduce((total, beneficiary) => total + beneficiary.percentage, 0);

        if (totalBeneficiaryPercentage > 100) {
            alert("The total percentage of beneficiaries cannot exceed 100%");
            return;
        }

        setShowPreview(true);
    }

    const handleAuthorSearch = (searchUsername: string) => {
        const percentage = 10;

        const beneficiaryExists = userBeneficiaries.some(b => b.name === searchUsername);

        if (!beneficiaryExists && percentage > 0) {
            const newBeneficiary = { name: searchUsername, percentage };
            setUserBeneficiaries(prevBeneficiaries => [...prevBeneficiaries, newBeneficiary]);
        } else {
            alert(`Beneficiary ${searchUsername} already exists or percentage is zero.`);
        }
    };

    const combineBeneficiaries = () => {
        const allBeneficiaries = [
            ...userBeneficiaries,
            ...(isChecked ? defaultBeneficiaryState : [])
        ];

        // Ensure the user is always a beneficiary with a weight of 10000 - sum of other weights
        const userAccount = hiveUser?.name || '';
        const otherWeightsSum = allBeneficiaries.reduce((total, b) => total + b.percentage * 100, 0);
        const userWeight = Math.max(10000 - otherWeightsSum, 0);

        // Create the beneficiaries list for broadcasting
        const combinedBeneficiaries = allBeneficiaries
            .sort((a, b) => a.name.localeCompare(b.name))
            .map(beneficiary => ({
                account: beneficiary.name,
                weight: (beneficiary.percentage * 100).toFixed(0),
            }));

        // Add the user beneficiary with the remaining weight
        combinedBeneficiaries.push({
            account: userAccount,
            weight: userWeight.toFixed(0),
        });

        return combinedBeneficiaries;
    };


    const handleBeneficiaryPercentageChange = (index: number, newPercentage: number) => {
        if (index < 0 || index >= userBeneficiaries.length) {
            console.error('Invalid index for user beneficiaries:', index);
            return;
        }

        const updatedBeneficiaries = [...userBeneficiaries];
        updatedBeneficiaries[index].percentage = newPercentage;
        setUserBeneficiaries(updatedBeneficiaries);
    };

    const handleDefaultBeneficiaryPercentageChange = (index: number, newPercentage: number) => {
        if (index < 0 || index >= defaultBeneficiaryState.length) {
            console.error('Invalid index for default beneficiaries:', index);
            return;
        }

        const updatedDefaultBeneficiaries = [...defaultBeneficiaryState];
        updatedDefaultBeneficiaries[index].percentage = newPercentage;
        setDefaultBeneficiaryState(updatedDefaultBeneficiaries);
    }

    const handleCheckMark = () => {
        setIsChecked(!isChecked);
    };

    const handleChange = (value: string) => {
        localStorage.setItem('draft', value);
        setValue(value || localStorage.getItem('draft') || '');
    }

    const [isMobile, setIsMobile] = useState(false)
    useEffect(() => {
        if (window) {
            const isMobile = window.innerWidth < 768
            setIsMobile(isMobile)
        }
    }, [])
    const isButtonDisabled = isUploading || !title || !value;

    return (
        <Box width="100%" overflow="hidden" color={"white"} >
            {showPreview &&
                <PreviewModal
                    isOpen={showPreview}
                    onClose={() => {
                        setShowPreview(false)
                    }}
                    title={title}
                    body={value}
                    thumbnailUrl={thumbnailUrl || "https://ipfs.skatehive.app/ipfs/QmYkb6yq2nXSccdMwmyNWXND8T1exqUW1uUiMAQcV4nfVP?pinataGatewayToken=nxHSFa1jQsiF7IHeXWH-gXCY3LDLlZ7Run3aZXZc8DRCfQz4J4a94z9DmVftXyFE"}
                    user={hiveUser!}
                    beneficiariesArray={combineBeneficiaries()}
                    tags={tags}
                />}

            <Input {...getInputProps()} id="md-image-upload" style={{ display: 'none' }} size="md" />

            <Flex direction={{ base: 'column', md: 'row' }} >
                <Box h={"100vh"} width={{ base: '100%', md: '50%' }} p="4" overflow={'auto'}
                    sx={{
                        "&::-webkit-scrollbar": {
                            display: "none",
                        },
                        "&::-webkit-scrollbar-thumb": {
                            display: "none",
                        }
                    }}
                >
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

                    <Box marginTop="3" {...getRootProps()} onPaste={handlePaste}>
                        {isUploading && <Center m={3}><Spinner color="#A5D6A7" /></Center>}

                        <MDEditor
                            value={value}
                            onChange={(value) => handleChange(value || '')}
                            commands={[
                                commands.bold, commands.italic, commands.strikethrough, commands.table, commands.link, commands.quote, commands.unorderedListCommand, commands.fullscreen
                            ]}
                            extraCommands={extraCommands}
                            height={isMobile ? "500px" : "700px"}
                            preview="edit"
                            style={{
                                color: "#A5D6A7",
                                border: "1px solid #A5D6A7",
                                padding: "10px",
                                backgroundColor: "black",
                            }}
                        />
                    </Box>
                    <VStack>
                        <Badge width={"100%"} mt={5} size="24px" color="#A5D6A7" backgroundColor={"#1e2021"}
                            border={"1px solid #A5D6A7"} {...getRootProps()}>
                            <Center>
                                <VStack padding={5}>
                                    <Text fontSize={"22px"} color="white">Select Thumbnail</Text>
                                    <Flex flexWrap="wrap">
                                        <Input
                                            {...getInputProps()}
                                            id="md-image-upload"
                                            style={{ display: 'none' }}
                                            size="md"
                                        />
                                        <Box
                                            cursor="pointer"
                                            width="100px"
                                            height="100px"
                                            display="flex"
                                            border={"2px dashed #A5D6A7"}
                                            justifyContent="center"
                                            alignItems="center"
                                            onClick={() => {
                                                const element = document.getElementById('md-image-upload');
                                                if (element) {
                                                    element.click();
                                                }
                                            }}
                                        >
                                            +
                                        </Box>

                                        {renderThumbnailOptions()}
                                    </Flex>
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
                                defaultBeneficiaryState.map((beneficiary, index) => (
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
                                    {userBeneficiaries.map((beneficiary, index) => (
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
                    <Button
                        mt={5}
                        ref={buttonRef}
                        onClick={() => handlePost()}
                        isDisabled={isButtonDisabled}
                        w={"100%"}
                        bg="black"
                        color={"white"}
                        border={"1px solid #A5D6A7"}
                        _hover={{ bg: "limegreen", color: 'white' }}
                    >
                        Send it !
                    </Button>

                    {!isButtonVisible && (
                        <Box
                            position="fixed"
                            bottom={isMobile ? "100px" : "10px"}
                            right="20px"
                            zIndex="999"
                        >
                            <Button
                                leftIcon={<ArrowRightIcon />}
                                bg="black"
                                color={"limegreen"}
                                border={"1px solid #A5D6A7"}
                                size="lg"
                                isDisabled={isButtonDisabled}
                                borderRadius={"full"}
                                onClick={() => handlePost()}
                                _hover={{ bg: "limegreen", color: 'black' }}
                            >
                                {"Send it !"}
                            </Button>
                        </Box>
                    )}
                </Box>
                <Box h={"100vh"} mt={4} width={{ base: '100%', md: '50%' }} p="4" borderRadius="2px" border="1px solid #A5D6A7" sx={{
                    "&::-webkit-scrollbar": {
                        display: "none",
                    },
                    "&::-webkit-scrollbar-thumb": {
                        display: "none",
                    }
                }}>
                    <HStack>
                        <Avatar name={hiveUser?.name} src={hiveUser?.metadata?.profile?.profile_image} boxSize="58px" borderRadius={'10px'} />
                        <Box borderRadius="4px" width="100%">
                            <Text ml={5} color={"green.200"} fontSize="28px">{title}</Text>
                        </Box>
                    </HStack>
                    <Divider my={5} />
                    <Box maxH="90vh" overflow="auto" p={1} borderRadius="md" sx={{
                        "&::-webkit-scrollbar": {
                            display: "none",
                        },
                        "&::-webkit-scrollbar-thumb": {
                            display: "none",
                        }
                    }}>
                        <MarkdownRenderer content={value} />
                    </Box>
                </Box>
            </Flex>
        </Box>
    );
}
