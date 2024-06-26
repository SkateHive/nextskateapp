import PostCarousel from '@/components/PostCard/Carousel';
import Footer from '@/components/PostCard/Footer';
import Header from '@/components/PostCard/Header';
import { PostProvider } from '@/contexts/PostContext';
import { Box, Card } from '@chakra-ui/react';
import React from 'react';

interface PostPreviewProps {
    postData: any;
}

const PostPreview: React.FC<PostPreviewProps> = ({ postData }) => {
    return (
        <Card
            bg={"black"}
            border={"1px solid #A5D6A7"}
            size="sm"
            boxShadow="none"
            borderRadius="5px"
            p={2}
            m={2}
            _hover={{ boxShadow: "0 0 1px 1px #A5D6A7" }}
        >
            <PostProvider postData={postData}>
                <Header />
                <Box m={0} maxW={"350px"} maxH={"240px"}>
                    <PostCarousel />
                </Box>
                <Footer />
            </PostProvider>
        </Card>
    );
};

export default PostPreview;
