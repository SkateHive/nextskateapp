import { useEffect, useState } from 'react';
import { fetchSkateHivePostMetadata } from '@/lib/utils';
import { Box, Text, Image, Link, HStack, Spinner } from '@chakra-ui/react';
import { extractImageUrls } from '@/app/upload/utils/extractImages';
import Footer from '@/components/PostCard/Footer';
import Vote from '@/components/PostCard/Vote';
import { FaHeart } from 'react-icons/fa';

interface SkateHivePreviewProps {
    postId: string;
    username: string;
}

export const SkateHivePreviewCard = ({ postId, username }: SkateHivePreviewProps) => {
    const [post, setPost] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchPostMetadata = async () => {
            setLoading(true);
            try {
                const postData = await fetchSkateHivePostMetadata(postId, username);
                console.log("postData", postData);
                setPost(postData);
            } catch (error) {
                console.error("Error fetching post metadata:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPostMetadata();
    }, [postId, username]);

    if (loading) {
        return (
            <Box p={4} display="flex" justifyContent="center">
                <Spinner size="sm" />
            </Box>
        );
    }

    if (!post) return null;

    const metadata = JSON.parse(post.json_metadata);
    console.log("post", post);
    const thumbnail = extractImageUrls(post.body)[0] || metadata.image[0];

    return (
        <Link href={`https://www.skatehive.app/post/${postId}/@${username}/${post.permlink}`} isExternal>
            <Box
                borderWidth="1px"
                borderRadius="lg"
                overflow="hidden"
                border={"1px solid #A5D6A7"}
                display="flex"
                flexDirection="row"
                bg="gray.900"
                p={4}
                m={4}
                alignItems="center"
            >
                <Image src={thumbnail} alt={post.title} boxSize="100px" objectFit="cover" border={"1px solid #A5D6A7"} />
                <Box ml={4}>
                    <Text color={"#A5D6A7"} fontSize="lg" fontWeight="bold">
                        {post.title}
                    </Text>
                    <Text mt={2} fontSize="sm" color="gray.400">
                        By {username} | {new Date(post.created).toLocaleDateString()}
                    </Text>
                </Box>
            </Box>
        </Link>
    );
};
