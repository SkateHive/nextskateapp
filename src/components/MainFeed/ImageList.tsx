import React from "react";
import { Box, HStack, IconButton, Image } from "@chakra-ui/react";
import { FaTimes } from "react-icons/fa";

interface ImageListComponentProps {
    imageList: string[];
    setImageList: React.Dispatch<React.SetStateAction<string[]>>;
}

export const ImageListComponent: React.FC<ImageListComponentProps> = ({ imageList, setImageList }) => (
    <HStack spacing={2} mt={2} wrap="wrap">
        {imageList.map((item: string, index: number) => (
            <Box key={index} position="relative" maxW={20} maxH={20} borderRadius="md" overflow="hidden">
                <IconButton
                    aria-label="Remove image"
                    icon={<FaTimes size={12} color="white" />}
                    size="xs"
                    position="absolute"
                    top={1}
                    right={1}
                    bg="blackAlpha.700"
                    _hover={{ bg: "red.500" }}
                    onClick={() => setImageList(imageList.filter((_, i) => i !== index))}
                />
                <Image src={item} alt="Uploaded media" objectFit="cover" w="full" h="full" />
            </Box>
        ))}
    </HStack>
);
