'use client'
import React from 'react';
import { Badge, Box, Image, Text, Flex, Button, Avatar, Divider, Center, HStack, Textarea, border } from '@chakra-ui/react';
import { FaImage, FaRegComment, FaRegHeart, FaRegShareSquare } from 'react-icons/fa';
import { AiOutlineRetweet } from 'react-icons/ai';
import { useComments } from '@/hooks/comments';
import { MarkdownRenderers } from '../upload/utils/MarkdownRenderers';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { transformShortYoutubeLinksinIframes } from '@/lib/utils';
import { useState, useEffect } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { BeatLoader } from 'react-spinners';
import { useMemo } from 'react';
import { vote } from '@/lib/hive/client-functions';
import { useHiveUser } from '@/contexts/UserContext';
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, useDisclosure } from "@chakra-ui/react"

const PINATA_TOKEN = process.env.NEXT_PUBLIC_PINATA_GATEWAY_TOKEN;
const PINATA_SECRET = process.env.NEXT_PUBLIC_PINATA_SECRET;
interface mediaProps {
    media: string[];
    type: string;
}

const AvatarMediaModal = ({ isOpen, onClose, media }: { isOpen: boolean, onClose: () => void, media: string[] }) => {
    const pinataToken = PINATA_TOKEN;
    return (
        <Modal isOpen={isOpen} onClose={onClose} size="full">
            <ModalOverlay filter="blur(8px)" />
            <ModalContent>
                <ModalHeader>Media</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Flex>

                    </Flex>
                </ModalBody>
                <ModalFooter>
                    <Button colorScheme="blue" mr={3} onClick={onClose}>
                        Close
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    )
}







let thumbnailUrl = 'https://www.skatehive.app/assets/skatehive.jpeg';

let postDataForPreview = {
    post_id: Number(1),
    author: "skatehive",
    permlink: 'permlink',
    title: 'title',
    body: 'body',
    json_metadata: JSON.stringify({ images: [thumbnailUrl] }),
    created: String(Date.now()),
    url: 'url',
    root_title: 'root_title',
    total_payout_value: '4.20',
    curator_payout_value: '0.0',
    pending_payout_value: '0.0',
    active_votes: [
        { voter: "BamMargera", weight: 10000, percent: "0", reputation: 78, rshares: 0 },
        { voter: "SpiderMan", weight: 5000, percent: "0", reputation: 69, rshares: 0 },
        { voter: "Magnolia", weight: 20000, percent: "0", reputation: 100, rshares: 0 },
    ]
}

const parent_author = 'skatehacker';
const parent_permlink = 'test-advance-mode-post';

const SkateCast = () => {
    const { comments, addComment, isLoading } = useComments(parent_author, parent_permlink)
    const [visiblePosts, setVisiblePosts] = useState(20);
    const [postBody, setPostBody] = useState('');
    const reversedComments = comments?.slice().reverse();
    const user = useHiveUser();
    const username = user?.hiveUser?.name;
    const [mediaModalOpen, setMediaModalOpen] = useState(false);
    const [media, setMedia] = useState<string[]>([]);



    const formatDate = (date: string) => {
        const now = new Date();
        const postDate = new Date(date);
        const diffInSeconds = Math.floor((now.getTime() - postDate.getTime()) / 1000);

        if (diffInSeconds < 60) {
            return 'Just now';
        } else if (diffInSeconds < 3600) {
            const minutes = Math.floor(diffInSeconds / 60);
            return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        } else if (diffInSeconds < 86400) {
            const hours = Math.floor(diffInSeconds / 3600);
            return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        } else {
            const days = Math.floor(diffInSeconds / 86400);
            return `${days} day${days > 1 ? 's' : ''} ago`;
        }
    }

    const [mediaComments, setMediaComments] = useState(new Set());
    const [mediaDictionary, setMediaDictionary] = useState(new Map());
    useEffect(() => {
        const mediaSet = new Set();
        const mediaDict = new Map();
        comments?.forEach((comment) => {
            const media = comment.body.match(/https:\/\/ipfs.skatehive.app\/ipfs\/[a-zA-Z0-9]*/g);
            const mediaType = comment.body.includes("<video") || comment.body.includes("<iframe") ? "video" : "image";
            if (media) {
                mediaSet.add(comment.id);
                mediaDict.set(comment.id, { media, type: mediaType });
            }
        });
        setMediaComments(mediaSet);
        setMediaDictionary(mediaDict);
    }, [comments]);


    const sortedComments = useMemo(() => {
        return comments?.slice().sort((a: any, b: any) => {
            const aHasMedia = mediaComments.has(a.id);
            const bHasMedia = mediaComments.has(b.id);
            if (aHasMedia && !bHasMedia) {
                return -1;
            } else if (!aHasMedia && bHasMedia) {
                return 1;
            }
            const aCreated = new Date(a.created);
            const bCreated = new Date(b.created);
            if (aCreated && bCreated) {
                return bCreated.getTime() - aCreated.getTime();
            }
            return 0;
        });
    }, [comments, mediaComments]);

    const handlePost = () => {
        if (!window.hive_keychain) {
            console.error("Hive Keychain extension not found!")
            return
        }

        if (!username) {
            console.error("Username is missing")
            return
        }


        const permlink = new Date()
            .toISOString()
            .replace(/[^a-zA-Z0-9]/g, "")
            .toLowerCase()

        const postData = {
            parent_author: parent_author,
            parent_permlink: parent_permlink,
            author: username,
            permlink: permlink,
            title: "",
            body: postBody,
            json_metadata: JSON.stringify({
                tags: ["skateboard"],
                app: "skatehive",
            }),
        }


        const operations = [
            [
                "comment",
                postData,
            ],
        ]
        window.hive_keychain.requestBroadcast(
            username,
            operations,
            "posting",
            async (response: any) => {
                if (response.success) {
                    setPostBody('')
                    addComment(postData)
                    console.log("Comment posted successfully")
                }
                else {
                    console.error("Error posting comment:", response.message)
                }
            }
        )



    }

    const handleVote = async (author: string, permlink: string) => {
        console.log('Vote');
        if (!username) {
            console.error("Username is missing")
            return
        }
        vote({
            username: username,
            permlink: permlink,
            author: author,
            weight: 10000,
        })
    }

    const handleMediaAvatarClick = (commentId: number) => {
        console.log('commentId', commentId);
        const media = mediaDictionary.get(commentId);
        console.log('media', media);
        setMedia(media ?? []);
        setMediaModalOpen(true);


    }

    return (
        isLoading ? (<Center>Loading...</Center>
        ) : (
            <>

                <AvatarMediaModal isOpen={mediaModalOpen} onClose={() => setMediaModalOpen(false)} media={media} />
                <Center flexDirection="column" w="100%" minH="100vh" bg="black">
                    <Box flexWrap={"wrap"} borderLeft="1px solid gray" borderRight="1px solid gray" w={{ base: "100%", md: "60%" }} css={{ "&::-webkit-scrollbar": { display: "none" } }} overflowX="auto">
                        <Flex p={5} >
                            {sortedComments?.map((comment, index, commentsArray) => {
                                const isDuplicate = commentsArray.findIndex((c) => c.author === comment.author) !== index;
                                if (isDuplicate) {
                                    return null;
                                }
                                return (
                                    <Avatar
                                        key={comment.id}
                                        boxSize="12"
                                        m="1"
                                        src={`https://images.ecency.com/webp/u/${comment.author}/avatar/small`}
                                        border={mediaComments.has(comment.id) ? '2px solid limegreen' : 'none'}
                                        mr={2}
                                        cursor={"pointer"}
                                        onClick={() => handleMediaAvatarClick(Number(comment.id))}
                                    />
                                );
                            })}
                        </Flex>
                        <Divider />
                    </Box>
                    <Box p={4} width={{ base: "100%", md: "60%" }} bg="black" color="white" borderLeft="1px solid gray" borderRight="1px solid gray">
                        <Flex >
                            <Avatar
                                borderRadius={10}
                                boxSize={12}
                                src={`https://images.ecency.com/webp/u/${username}/avatar/small`}
                            />
                            <Textarea
                                border="none"
                                _focus={{
                                    border: "none",
                                    boxShadow: "none"
                                }}
                                placeholder="What's happening?"
                                onChange={(e) => setPostBody(e.target.value)}

                            />
                        </Flex>
                        <HStack justifyContent="space-between" m={4}>
                            <FaImage color='#ABE4B8' cursor="pointer" />
                            <Button colorScheme='green' variant="outline" ml="auto" onClick={handlePost}>Post</Button>
                        </HStack>
                        <Divider mt={4} />
                    </Box>

                    <Box overflowX="auto" width={{ base: "100%", md: "60%" }}>
                        <InfiniteScroll
                            dataLength={visiblePosts}
                            next={() => setVisiblePosts(visiblePosts + 3)}
                            hasMore={visiblePosts < (comments?.length ?? 0)}
                            loader={<Flex justify="center"><BeatLoader size={8} color="darkgrey" /></Flex>}
                            style={{ overflow: "hidden" }}


                        >
                            {reversedComments?.map((comment) => (

                                <Box key={comment.id} p={4} width="100%" bg="black" color="white" borderLeft="1px solid gray" borderRight="1px solid gray" >
                                    <Flex>
                                        <Avatar
                                            borderRadius={10}
                                            boxSize={12}
                                            src={`https://images.ecency.com/webp/u/${comment.author}/avatar/small`}
                                        />
                                        <HStack ml={4}>
                                            <Text fontWeight="bold">{comment.author}</Text>
                                            <Text ml={2} color="gray.400">{formatDate(String(comment.created))}</Text>
                                            <Badge colorScheme="green" variant="outline" mt={0}>
                                                4.20 USD
                                            </Badge>
                                        </HStack>

                                    </Flex>
                                    <Box ml={"64px"} mt={4}>
                                        <ReactMarkdown
                                            components={MarkdownRenderers}
                                            rehypePlugins={[rehypeRaw]}
                                            remarkPlugins={[remarkGfm]}
                                        >
                                            {transformShortYoutubeLinksinIframes(comment.body)}
                                        </ReactMarkdown>
                                    </Box>
                                    <Flex justifyContent={"flex-start"} mt={4}>
                                        <Button colorScheme='green' variant="ghost" leftIcon={<FaRegComment />}>
                                            {comment.children}
                                        </Button>
                                        <Button onClick={() => handleVote(comment.author, comment.permlink)} colorScheme='green' variant="ghost" leftIcon={<FaRegHeart />}>
                                            {comment.active_votes?.length}
                                        </Button>
                                        <Button colorScheme='green' variant="ghost" leftIcon={<AiOutlineRetweet />}>
                                            {comment.net_votes}
                                        </Button>

                                    </Flex>

                                    <Divider mt={4} />
                                </Box>

                            ))}
                        </InfiniteScroll>
                    </Box>

                </Center>
            </>
        )
    );
};

export default SkateCast;
