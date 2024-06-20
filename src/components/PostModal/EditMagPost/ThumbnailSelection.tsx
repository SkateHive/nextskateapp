import { Box, Flex, Image } from '@chakra-ui/react';
import React from 'react';

interface ThumbnailSelectionProps {
    postImages: string[];
    selectedThumbnail: string | null;
    setSelectedThumbnail: (value: string) => void;
}

const ThumbnailSelection: React.FC<ThumbnailSelectionProps> = ({ postImages, selectedThumbnail, setSelectedThumbnail }) => {
    return (
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
    );
};

export default ThumbnailSelection;
