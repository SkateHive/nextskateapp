import PostCarousel from '@/components/PostCard/Carousel';
import Footer from '@/components/PostCard/Footer';
import Header from '@/components/PostCard/Header';
import { PostProvider } from '@/contexts/PostContext';
import { Card } from '@chakra-ui/react';
import React from 'react';

interface PostPreviewProps {
    postData: any;
}

const PostPreview: React.FC<PostPreviewProps> = ({ postData }) => {
    return (
        <Card bg={"black"} border={"0.6px solid white"} size="sm" boxShadow="none" borderRadius="none" p={2}>
            <PostProvider postData={postData}>
                <Header />
                <PostCarousel />
                <Footer />
            </PostProvider>
        </Card>
    );
};

export default PostPreview;
