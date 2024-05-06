'use client'
import React from 'react';
import { Box, Image, Text, Flex, Button, Avatar, Divider, Center, HStack, Textarea, border } from '@chakra-ui/react';
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
import { Comment } from '@/hooks/comments';

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
    const { comments, addComment, isLoading } = useComments(
        parent_author,
        parent_permlink
    )
    const [visiblePosts, setVisiblePosts] = useState(20);
    const [postBody, setPostBody] = useState('');
    const reversedComments = comments?.slice().reverse();
    const formatDate = (date: string) => {
        return new Date(date).toLocaleString();
    }

    const [mediaComments, setMediaComments] = useState(new Set());

    useEffect(() => {
        const mediaSet = new Set();
        comments?.forEach((comment) => {
            const media = comment.body.match(/https:\/\/ipfs.skatehive.app\/ipfs\/[a-zA-Z0-9]*/g);
            if (media) {
                mediaSet.add(comment.id);
            }
        });
        setMediaComments(mediaSet);
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
        console.log('Post');
        console.log(postBody)

        if (!window.hive_keychain) {
            console.error("Hive Keychain extension not found!")
            return
        }

        const username = "xvlad"
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



    return (
        isLoading ? (<Center>Loading...</Center>
        ) : (
            <Center flexDirection="column" w="100%" minH="100vh" bg="black">
                <Box flexWrap={"wrap"} borderLeft="1px solid gray" borderRight="1px solid gray" w={{ base: "100%", md: "50%" }} css={{ "&::-webkit-scrollbar": { display: "none" } }} overflowX="auto">
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
                                    border={mediaComments.has(comment.id) ? '2px solid green' : 'none'}
                                    mr={2} // Add margin right for consistent spacing
                                />
                            );
                        })}
                    </Flex>
                    <Divider />
                </Box>

                <Box p={4} width={{ base: "100%", md: "60%" }} bg="black" color="white" borderLeft="1px solid gray" borderRight="1px solid gray">
                    <Flex>
                        <Avatar
                            boxSize={12}
                            src="https://images.ecency.com/webp/u/skatehive/avatar/small"
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
                        <FaImage cursor="pointer" />
                        <Button variant="outline" ml="auto" onClick={handlePost}>Post</Button>
                    </HStack>
                    <Divider mt={4} />
                </Box>

                <Box overflowX="auto" width={{ base: "100%", md: "50%" }}>

                    {reversedComments?.map((comment) => (
                        <InfiniteScroll
                            dataLength={visiblePosts}
                            next={() => setVisiblePosts(visiblePosts + 3)}
                            hasMore={visiblePosts < reversedComments.length}
                            loader={<Flex justify="center"><BeatLoader size={8} color="darkgrey" /></Flex>}
                            style={{ overflow: "hidden" }}

                        >
                            <Box key={comment.id} p={4} width="100%" bg="black" color="white" borderLeft="1px solid gray" borderRight="1px solid gray" >
                                <Flex>
                                    <Avatar
                                        boxSize={12}
                                        src={`https://images.ecency.com/webp/u/${comment.author}/avatar/small`}
                                    />
                                    <Box ml={4}>
                                        <Text fontWeight="bold">{comment.author}</Text>
                                        <Text color="gray.400">{comment.author.toString()}</Text>
                                    </Box>
                                    <Box justifyContent="flex-end" ml="auto">
                                        <Text ml={2} color="gray.400">{formatDate(String(comment.created))}</Text>
                                    </Box>
                                </Flex>
                                <Box mt={4}>
                                    <ReactMarkdown
                                        components={MarkdownRenderers}
                                        rehypePlugins={[rehypeRaw]}
                                        remarkPlugins={[remarkGfm]}
                                    >
                                        {transformShortYoutubeLinksinIframes(comment.body)}
                                    </ReactMarkdown>
                                </Box>
                                <Flex mt={4}>
                                    <Button variant="ghost" leftIcon={<FaRegComment />}>
                                        {comment.children}
                                    </Button>
                                    <Button variant="ghost" leftIcon={<FaRegHeart />}>
                                        {comment.active_votes?.length}
                                    </Button>
                                    <Button variant="ghost" leftIcon={<AiOutlineRetweet />}>
                                        {comment.net_votes}
                                    </Button>
                                    <Button variant="ghost" leftIcon={<FaRegShareSquare />} />
                                </Flex>
                                <Divider mt={4} />
                            </Box>
                        </InfiniteScroll>

                    ))}
                </Box>
            </Center>
        )
    );
};

export default SkateCast;
