import { Box, Flex, Image, Textarea } from '@chakra-ui/react';
import React from 'react';

interface ModalBodySectionProps {
    editedContent: string;
    setEditedContent: (value: string) => void;
    postImages: string[];
    selectedThumbnail: string | null;
    setSelectedThumbnail: (value: string) => void;
}

const ModalBodySection: React.FC<ModalBodySectionProps> = ({ editedContent, setEditedContent, postImages, selectedThumbnail, setSelectedThumbnail }) => {
    return (
        <>
            <Box
                paddingRight="20px" 
                marginBottom="20px" 
            >
                <Textarea
                    placeholder="Content"
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    fontSize="16px"
                    color="white"
                    variant="unstyled"
                    bg="gray.900"
                    h={{ base: "200px", md: "400px", lg: "600px"  }}
                    _placeholder={{ color: 'gray.100' }}
                    border="2px solid"
                    paddingLeft="15px" 

                />
            </Box>
            {postImages && postImages.length > 0 && (
                <Flex borderRadius={"10px"} m="25px" marginBottom={"-25px"} padding={"10px"} alignItems="center" marginTop={4}>
                    <Flex direction="row" alignItems="center" flexWrap="wrap">
                        {postImages.map((image: string, index: number) => (
                            <Box
                                key={index}
                                width="148px"
                                height="148px"
                                m={1}
                                borderRadius="5px">
                                <Image
                                    src={image}
                                    boxSize={"148px"}
                                    alt={`Thumbnail ${index + 1}`}
                                    style={{
                                        objectFit: 'cover',
                                        cursor: 'pointer',
                                        border: selectedThumbnail === image ? '2px solid teal' : 'none',
                                        width: '148px',
                                        marginRight: (index + 1) % 4 === 0 ? 0 : '10px',
                                        marginBottom: '10px',
                                        borderRadius: '5px',
                                    }}
                                    onClick={() => setSelectedThumbnail(image)}
                                />
                                {(index + 1) % 4 === 0 && <br />}
                            </Box>
                        ))}
                    </Flex>
                </Flex>
            )}
        </>
    );
};

export default ModalBodySection;