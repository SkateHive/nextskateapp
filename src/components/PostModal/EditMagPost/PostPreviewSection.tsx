import PostPreview from '@/app/upload/components/PostPreview';
import { Box, Center, HStack, Image, Text } from '@chakra-ui/react';
import React from 'react';
import PreviewContent from './PreviewContent';

interface PostPreviewSectionProps {
    editedTitle: string;
    editedContent: string;
    selectedThumbnail: string | null;
    postImages: string[];
    postDataForPreview: any;
}

const PostPreviewSection: React.FC<PostPreviewSectionProps> = ({ 
    editedTitle, editedContent, selectedThumbnail, postImages, postDataForPreview 
}) => {
    return (
        <>
            <HStack justifyContent={"space-between"}>
                <Text fontSize="28px" color="green.200" as="b">
                    {editedTitle}
                </Text>
            </HStack>
            <Box p={2} border={'2px dashed #2D3748'} overflow={'auto'} h={{ base: "200px", md: "400px", lg: "600px" }}>
            <PreviewContent content={editedContent} />
            </Box>
            <HStack>
                <Box w={'100%'} textAlign={'center'}>
                    <Text color={'green.200'} fontSize={'2xl'} mb={4}> Selected Thumbnail </Text>
                    {postImages && postImages.length > 0 && (
                        <Center>
                            <Image
                                src={selectedThumbnail || postImages[0]}
                                alt="Thumbnail"
                                style={{
                                    objectFit: 'cover',
                                    width: '40%',
                                    borderRadius: '5px',
                                }}
                            />
                        </Center>
                    )}
                </Box>
                <Box w={'50%'}>
                    <PostPreview postData={postDataForPreview} />
                </Box>
            </HStack>
        </>
    );
};

export default PostPreviewSection;