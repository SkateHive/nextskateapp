import LoginModal from '@/components/Hive/Login/LoginModal';
import { useHiveUser } from '@/contexts/UserContext';
import { Box, Button, Center, Flex, Modal, ModalBody, ModalContent, ModalOverlay, Slider, SliderFilledTrack, SliderThumb, SliderTrack, Text, VStack } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { FaHeart } from 'react-icons/fa';
import useHiveData from './HiveDataFetcher';
import { voteWithPrivateKey } from '@/lib/hive/server-functions';
import { KeychainRequestResponse } from 'keychain-sdk';
import { VoteOperation } from '@hiveio/dhive';

interface VoteButtonProps {
    author: string;
    permlink: string;
    comment: any;
    isModal?: boolean;
    onClose?: () => void;
    onSuccess?: (voteType: 'upvote' | 'downvote') => void;
    currentVoteType?: 'upvote' | 'downvote' | 'none';
}

const VoteButtonModal = ({ author, permlink, comment, isModal = true, onClose = () => { }, onSuccess, currentVoteType = 'none' }: VoteButtonProps) => {
    const user = useHiveUser();
    const [voteWeight, setVoteWeight] = useState(5000);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isUpvoted, setIsUpvoted] = useState<boolean>(false);
    const [isDownvoted, setIsDownvoted] = useState<boolean>(false);
    const [upvoteCount, setUpvoteCount] = useState<number>(0);
    const [downvoteCount, setDownvoteCount] = useState<number>(0);

    // Effect that adjusts the weight of the vote whenever the type of vote changes (upvote or downvote)
    useEffect(() => {

        if (currentVoteType === 'upvote') {
            setVoteWeight(10000);
        } else if (currentVoteType === 'downvote') {
            setVoteWeight(-10000);
        } else {
            setVoteWeight(0);
        }

    }, [currentVoteType]);

    // Function to fetch data from Hive
    const { rshares, estimatedPayout, error } = useHiveData(voteWeight, user?.hiveUser?.name ?? '');

    if (!user) {
        return <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />;
    }

    // Function that is called after the vote is successful
    const handleVoteSuccess = async (voteType: 'upvote' | 'downvote') => {
        if (voteType === 'upvote') {
            setIsUpvoted(true);
            setIsDownvoted(false);
            setUpvoteCount(upvoteCount + 1);
        } else {
            setIsDownvoted(true);
            setIsUpvoted(false);
            setDownvoteCount(downvoteCount + 1);
        }

        if (onSuccess) {
            onSuccess(voteType);
        }

        setIsLoginModalOpen(false);
    };

    // Function that is called when the vote button is clicked
    const handleVoteClick = async () => {
        const loginMethod = localStorage.getItem("LoginMethod");


        if (!user?.hiveUser?.name) {
            setIsLoginModalOpen(true);
            return;
        }

        const weight = voteWeight;
        const voteType = weight > 0 ? 'upvote' : 'downvote';
        if (loginMethod === "keychain") {
            if (window.hive_keychain) {
                window.hive_keychain.requestBroadcast(
                    user.hiveUser.name,
                    [
                        [
                            "vote",
                            {
                                "voter": user.hiveUser.name,
                                "author": author,
                                "permlink": permlink,
                                "weight": weight,
                                "__rshares": rshares,
                                "__config": {
                                    title: voteType === 'upvote' ? 'Confirm Upvote' : 'Confirm Downvote',
                                }
                            }
                        ]
                    ],
                    'Posting',
                    (response: KeychainRequestResponse) => {
                        if (response.success) {
                            handleVoteSuccess(voteType);
                        } else {
                            console.error("Error when voting:", response);
                        }
                    }
                );
            }
        } else if (loginMethod === "privateKey") {
            const encryptedPrivateKey = localStorage.getItem("EncPrivateKey");
            const vote: VoteOperation = [
                "vote",
                {
                    author,
                    permlink,
                    voter: user.hiveUser.name,
                    weight,
                },
            ];
            if (!encryptedPrivateKey) {
                console.error("Private key not found in localStorage");
                return;
            }
            voteWithPrivateKey(encryptedPrivateKey, vote)
                .then(() => {
                    handleVoteSuccess(voteType);
                })
                .catch(error => {
                    console.error("Error when voting:", error);
                });
        }
        else {
            console.error("Login method not recognized.");
        }
    };

    // Function to handle the change in slider value (where the user adjusts the weight of the vote)
    const handleSliderChange = (value: number) => {
        setVoteWeight(value);
    };

    const calculateSliderPosition = (value: number) => {
        return ((value + 10000) / 20000) * 100;
    };

    const generateMarks = () => [
        { value: -10000, label: '-100%' },
        { value: -5000, label: '-50%' },
        { value: 0, label: '0%' },
        { value: 5000, label: '50%' },
        { value: 10000, label: '100%' },
    ];

    const voteLabel = voteWeight < 0
        ? `Downvote (${(voteWeight / -10000 * 100).toFixed(0)}%)`
        : `Upvote (${(voteWeight / 10000 * 100).toFixed(0)}%)`;

    // Determine color scheme based on vote type (upvote is green, downvote is red)
    const sliderColorScheme = voteWeight < 0 ? "red" : "green";
    const buttonBgColor = voteWeight < 0 ? "red.500" : "green.500";
    const buttonHoverColor = voteWeight < 0 ? "#e53e3e" : "#0caf35";
    if (isModal) {
        return (
            <Modal isOpen={isModal} onClose={onClose} isCentered closeOnOverlayClick={false}>
                <ModalOverlay style={{ backdropFilter: "blur(5px)" }} />
                <ModalContent
                    color="white"
                    w={{ base: "100%", md: "75%" }}
                    bg="black"
                    border="0.6px solid grey"
                    borderRadius="md"
                    mx={4}
                    sx={{ overflowY: 'auto', maxHeight: '90vh' }}
                >
                    <ModalBody>
                        <Center width="100%">
                            <VStack width="100%" spacing={6}>
                                <Box width="full">
                                    <Box width="full" position="relative">
                                        <Slider
                                            aria-label="vote weight"
                                            min={-10000}
                                            max={10000}
                                            step={100}
                                            value={voteWeight}
                                            onChange={handleSliderChange}
                                            colorScheme={sliderColorScheme}  // Set the color scheme dynamically based on vote type
                                            height="50px"
                                            borderRadius="md"
                                            boxShadow="sm"
                                        >
                                            <SliderTrack>
                                                <SliderFilledTrack bg={sliderColorScheme === "green" ? "green.500" : "red.500"} />
                                            </SliderTrack>
                                            <SliderThumb boxSize={6} bg={sliderColorScheme === "green" ? "green.500" : "red.500"} borderRadius="full" />
                                        </Slider>

                                        <Box
                                            position="absolute"
                                            top="-10%"
                                            left="0"
                                            right="0"
                                            display="flex"
                                            justifyContent="space-between"
                                            transform="translateY(-50%)"
                                            zIndex={1}
                                        >
                                            {generateMarks().map((mark) => (
                                                <Box
                                                    key={mark.value}
                                                    position="absolute"
                                                    left={`${calculateSliderPosition(mark.value)}%`}
                                                    transform="translateX(-50%)"
                                                    fontSize="sm"
                                                    color="white"
                                                    display="flex"
                                                    alignItems="center"
                                                    justifyContent="center"
                                                >
                                                    <Text>{mark.label}</Text>
                                                </Box>
                                            ))}
                                        </Box>
                                    </Box>
                                    <Flex justifyContent="space-between" alignItems="center" >
                                        <Button
                                            leftIcon={<FaHeart />}
                                            width="initial"
                                            bg={buttonBgColor}
                                            color="white"
                                            onClick={handleVoteClick}
                                            mt={4}
                                            _hover={{ bg: buttonHoverColor }}
                                        >
                                            {voteLabel}
                                        </Button>
                                        <Button
                                            onClick={() => onClose && onClose()}
                                            variant="ghost"
                                            color="red.500"
                                            mt={4}
                                        >
                                            Cancel
                                        </Button>
                                        <Box mt={4}>
                                            <Text fontSize="lg" color="white">
                                                ${estimatedPayout !== null ? estimatedPayout.toFixed(3) : '0.000'} USD
                                            </Text>
                                        </Box>
                                    </Flex>
                                </Box>
                            </VStack>
                        </Center>
                    </ModalBody>
                </ModalContent>
            </Modal>

        );
    }

    return (
        <Center width="100%">
            <VStack width="100%" spacing={6}>
                <Box width="full">
                    <Flex justifyContent="space-between" alignItems="center" width="100%">
                        <Button
                            leftIcon={<FaHeart />}
                            width="initial"
                            bgGradient="linear(to-r, #1d6b2e, #07ca69)"
                            color="white"
                            onClick={handleVoteClick}
                            bg={buttonBgColor}
                            _hover={{ bg: buttonHoverColor }}
                        >
                            {voteLabel}
                        </Button>

                        <Box mt={4}>
                            <Text fontSize="lg" color="white">
                                ${estimatedPayout !== null ? estimatedPayout.toFixed(3) : '0.000'} USD
                            </Text>
                        </Box>
                    </Flex>

                    <Box width="full" position="relative" mt={4}>
                        <Slider
                            aria-label="vote weight"
                            min={-10000}
                            max={10000}
                            step={100}
                            value={voteWeight}
                            onChange={setVoteWeight}
                            colorScheme={sliderColorScheme}
                            height="50px"
                            borderRadius="md"
                            boxShadow="sm"
                        >
                            <SliderTrack>
                                <SliderFilledTrack bg={sliderColorScheme === "green" ? "green.500" : "red.500"} />
                            </SliderTrack>
                            <SliderThumb boxSize={6} bg={sliderColorScheme === "green" ? "green.500" : "red.500"} borderRadius="full" />
                        </Slider>

                        <Box
                            position="absolute"
                            top="-10%"
                            left="0"
                            right="0"
                            display="flex"
                            justifyContent="space-between"
                            transform="translateY(-50%)"
                            zIndex={1}
                        >
                            {generateMarks().map((mark) => (
                                <Box
                                    key={mark.value}
                                    position="absolute"
                                    left={`${calculateSliderPosition(mark.value)}%`}
                                    transform="translateX(-50%)"
                                    fontSize="sm"
                                    color="white"
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                >
                                    <Text>{mark.label}</Text>
                                </Box>
                            ))}
                        </Box>
                    </Box>
                </Box>
            </VStack>
        </Center>
    );
};

export default VoteButtonModal;
