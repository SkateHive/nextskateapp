import LoginModal from '@/components/Hive/Login/LoginModal';
import { useHiveUser } from '@/contexts/UserContext';
import { Box, Button, Center, Flex, Modal, ModalBody, ModalContent, ModalOverlay, Slider, SliderFilledTrack, SliderThumb, SliderTrack, Text, VStack } from '@chakra-ui/react';
import { debounce } from 'lodash';
import { useEffect, useState } from 'react';
import { FaHeart } from 'react-icons/fa';
import useHiveData from './HiveDataFetcher';

interface VoteButtonProps {
    author: string;
    permlink: string;
    comment: any;
    isModal?: boolean;
    onClose?: () => void;
    onSuccess?: (voteType: 'upvote' | 'downvote') => void;
    currentVoteType?: 'upvote' | 'downvote' | 'none';
}

const VoteButton = ({ author, permlink, comment, isModal = true, onClose = () => { }, onSuccess, currentVoteType = 'none' }: VoteButtonProps) => {
    const user = useHiveUser();
    const [voteWeight, setVoteWeight] = useState(0);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

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

    // Function to handle the click on the vote button and broadcast the vote using Hive Keychain
    const handleVoteClick = async () => {
        if (!user?.hiveUser?.name) {
            setIsLoginModalOpen(true);
            return;
        }

        const weight = voteWeight;
        const voteType = weight > 0 ? 'upvote' : 'downvote'; 

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
                (response: any) => {
                    if (response.success) {
                        console.log("Vote successfully cast:", response);

                        if (onSuccess) {
                            onSuccess(voteType);
                        }

                        if (onClose) {
                            onClose();
                        }
                    } else {
                        console.error("Error when voting:", response);
                    }
                }
            );
        } else {
            alert("Hive Keychain não está disponível. Por favor, instale o Hive Keychain.");
        }
    };

    // Debounced slider value update
    const handleSliderChangeDebounced = debounce((value: number) => {
        setVoteWeight(value);
    }, 300);

    const handleSliderChange = (value: number) => {
        setVoteWeight(value);
        handleSliderChangeDebounced(value);
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
                    sx={{ overflowY: 'auto', maxHeight: '90vh' }} // Ensure modal content doesn't overflow
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
                                            colorScheme="green"
                                            height="50px"
                                            borderRadius="md"
                                            boxShadow="sm"
                                        >
                                            <SliderTrack>
                                                <SliderFilledTrack bg="green.500" />
                                            </SliderTrack>
                                            <SliderThumb boxSize={6} bg="green.500" borderRadius="full" />
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
                                            bgGradient="linear(to-r, #1d6b2e, #07ca69)"
                                            color="white"
                                            onClick={handleVoteClick}
                                            mt={4}
                                            _hover={{ bg: "#0caf35" }}
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
                                                ${estimatedPayout.toFixed(3)} USD
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
                    <Box width="full" position="relative">
                        <Slider
                            aria-label="vote weight"
                            min={-10000}
                            max={10000}
                            step={100}
                            value={voteWeight}
                            onChange={handleSliderChange}
                            colorScheme="green"
                            height="50px"
                            borderRadius="md"
                            boxShadow="sm"
                        >
                            <SliderTrack>
                                <SliderFilledTrack bg="green.500" />
                            </SliderTrack>
                            <SliderThumb boxSize={6} bg="green.500" borderRadius="full" />
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
                    <Flex justifyContent="space-between" alignItems="center" width="100%">
                        <Button
                            leftIcon={<FaHeart />}
                            width="initial"
                            bgGradient="linear(to-r, #1d6b2e, #07ca69)"
                            color="white"
                            onClick={handleVoteClick}
                            mt={4}
                            _hover={{ bg: "#0caf35" }}
                        >
                            {voteLabel}
                        </Button>

                        <Box mt={5}>
                            <Text fontSize="lg" color="white">
                                ${estimatedPayout.toFixed(3)} USD
                            </Text>
                        </Box>
                    </Flex>
                </Box>
            </VStack>
        </Center>
    );
};

export default VoteButton;
