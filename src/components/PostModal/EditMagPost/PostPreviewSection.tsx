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
            <HStack justifyContent={"space-between"} alignItems="center" marginBottom={4} flexDirection={{ base: 'column', md: 'row' }}>
                <Text fontSize={{ base: '24px', md: '28px' }} color="green.200" as="b" textAlign={{ base: 'center', md: 'left' }}>
                    {editedTitle}
                </Text>
            </HStack>
            <Box p={2} border={'2px dashed #2D3748'} overflow={'auto'} h={{ base: "200px", md: "400px", lg: "600px" }} marginBottom={4}>
                <PreviewContent content={editedContent} />
            </Box>
            <HStack flexWrap="wrap" justifyContent="center" alignItems="center" marginBottom={4}>
                <Box w={{ base: '100%', md: '50%' }} textAlign={'center'} marginBottom={{ base: 4, md: 0 }}>
                    <Text color={'green.200'} fontSize={'2xl'} mb={4}> Selected Thumbnail </Text>
                    {postImages && postImages.length > 0 && (
                        <Center>
                            <Image
                                src={selectedThumbnail || postImages[0]}
                                alt="Thumbnail"
                                style={{
                                    objectFit: 'cover',
                                    width: '80%',
                                    maxWidth: '300px',
                                    borderRadius: '5px',
                                }}
                            />
                        </Center>
                    )}
                </Box>
                <Box w={{ base: '100%', md: '50%' }}>
                    <PostPreview postData={postDataForPreview} />
                </Box>
            </HStack>
        </>
    );
};

export default PostPreviewSection;