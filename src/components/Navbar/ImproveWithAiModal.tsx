import { Badge, Box, Button, Center, HStack, Image, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Spinner, VStack } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { FaCheck } from 'react-icons/fa';

interface ImproveWithAiModalProps {
    isOpen: boolean;
    onClose: () => void;
    improveWithAi: (body: string) => Promise<string>;
}

const ImproveWithAiModal: React.FC<ImproveWithAiModalProps> = ({ isOpen, onClose, improveWithAi }) => {
    const [initialText, setInitialText] = useState<string>('');
    const [improvedTexts, setImprovedTexts] = useState<string[]>([]);
    const [loading, setLoading] = useState<boolean[]>([]);
    const [replacedIndexes, setReplacedIndexes] = useState<boolean[]>([]);

    useEffect(() => {
        const fetchInitialText = () => {
            if (typeof window !== 'undefined' && isOpen) {
                const draftText = localStorage.getItem('draft') || '';
                setInitialText(draftText);
                const paragraphs = draftText.split('\n\n');
                setImprovedTexts(Array(paragraphs.length).fill(''));
                setLoading(Array(paragraphs.length).fill(false));
                setReplacedIndexes(Array(paragraphs.length).fill(false));
            }
        };

        fetchInitialText();
    }, [isOpen]);

    const handleImprove = async (paragraph: string, index: number) => {
        setLoading(prev => {
            const newLoading = [...prev];
            newLoading[index] = true;
            return newLoading;
        });
        try {
            const newText = await improveWithAi(paragraph);
            setImprovedTexts(prev => {
                const newImprovedTexts = [...prev];
                newImprovedTexts[index] = newText;
                return newImprovedTexts;
            });
        } catch (error) {
            console.error('Error improving text:', error);
        } finally {
            setLoading(prev => {
                const newLoading = [...prev];
                newLoading[index] = false;
                return newLoading;
            });
        }
    };

    const handleReplace = (index: number): void => {
        const paragraphs = initialText.split('\n\n');
        paragraphs[index] = improvedTexts[index];
        const newText = paragraphs.join('\n\n');
        localStorage.setItem('draft', newText);
        setInitialText(newText);
        setReplacedIndexes(prev => {
            const newReplacedIndexes = [...prev];
            newReplacedIndexes[index] = true;
            return newReplacedIndexes;
        });
    };

    const paragraphs = initialText.split('\n\n');
    const handleClose = () => {
        onClose();
        window.location.reload();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} isCentered>
            <ModalOverlay />
            <ModalContent bg={"black"} color={"white"}>
                <ModalHeader>Improve with AI</ModalHeader>
                <ModalCloseButton />
                <Center>
                    <Image
                        src="/brain.png"
                        alt="AI"
                        boxSize={'88px'}
                    />
                </Center>
                <ModalBody>
                    {paragraphs.map((paragraph, index) => (
                        <Box key={index} borderWidth="1px" borderRadius="lg" p={4} mb={4}>
                            <VStack>
                                <Badge
                                    sx={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}
                                    mb={2}
                                    bg={"red.400"}
                                >
                                    {paragraph}
                                </Badge>
                                <HStack>
                                    <Button
                                        colorScheme={improvedTexts[index] ? 'green' : 'blue'}
                                        p={1}
                                        h={6}
                                        variant={improvedTexts[index] ? 'outline' : 'outline'}
                                        onClick={() => handleImprove(paragraph, index)}
                                        isDisabled={loading[index]}
                                    >
                                        Improve
                                    </Button>
                                    {!loading[index] && improvedTexts[index] && (
                                        <Button
                                            p={1}
                                            h={6}
                                            variant={improvedTexts[index] ? 'outline' : 'solid'}
                                            colorScheme={replacedIndexes[index] ? 'green' : 'gray'}
                                            onClick={() => handleReplace(index)}
                                        >
                                            Replace
                                        </Button>
                                    )}
                                    {replacedIndexes[index] && (
                                        <FaCheck color="green" />
                                    )}
                                </HStack>
                            </VStack>
                            {loading[index] && <Spinner mt={2} />}
                            {!loading[index] && improvedTexts[index] && (
                                <Badge sx={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}
                                    colorScheme="green" mt={2} p={2}>
                                    {improvedTexts[index]}
                                </Badge>
                            )}
                        </Box>
                    ))}
                </ModalBody>
                <ModalFooter>
                    <Button colorScheme="blue" mr={3} onClick={handleClose}>
                        Close
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default ImproveWithAiModal;
