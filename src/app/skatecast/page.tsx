'use client'
import React from 'react';
import { Box, Image, Text, Flex, Button, Avatar, Divider, Center, HStack, Textarea, border } from '@chakra-ui/react';
import { FaImage, FaRegComment, FaRegHeart, FaRegShareSquare } from 'react-icons/fa';
import { AiOutlineRetweet } from 'react-icons/ai';
import { useComments } from '@/hooks/comments';
import { MarkdownRenderers } from '../upload/utils/MarkdownRenderers';
import ReactMarkdown from 'react-markdown';
import MDEditor from '@uiw/react-md-editor';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { transformShortYoutubeLinksinIframes } from '@/lib/utils';
import InfiniteScroll from "react-infinite-scroll-component";
import { useState } from 'react';
import { BeatLoader } from 'react-spinners';
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

const SkateCast = () => {
    const { comments, addComment } = useComments(
        "skatehacker",
        "test-advance-mode-post"
    )
    const reversedComments = comments?.slice().reverse();
    const [visiblePosts, setVisiblePosts] = useState(20);
    const [expandedCommentId, setExpandedCommentId] = useState(null);

    const formatDate = (date: string) => {
        const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);

        let interval = seconds / 31536000;
        if (interval > 1) {
            return Math.floor(interval) + " year" + (Math.floor(interval) > 1 ? "s" : "") + " ago";
        }
        interval = seconds / 2592000;
        if (interval > 1) {
            return Math.floor(interval) + " month" + (Math.floor(interval) > 1 ? "s" : "") + " ago";
        }
        interval = seconds / 86400;
        if (interval > 1) {
            return Math.floor(interval) + " day" + (Math.floor(interval) > 1 ? "s" : "") + " ago";
        }
        interval = seconds / 3600;
        if (interval > 1) {
            return Math.floor(interval) + " hour" + (Math.floor(interval) > 1 ? "s" : "") + " ago";
        }
        interval = seconds / 60;
        if (interval > 1) {
            return Math.floor(interval) + " minute" + (Math.floor(interval) > 1 ? "s" : "") + " ago";
        }
        return Math.floor(seconds) + " second" + (Math.floor(seconds) > 1 ? "s" : "") + " ago";
    }
    const toggleExpandComment = (commentId: any) => {
        setExpandedCommentId(expandedCommentId === commentId ? null : commentId);
    };

    const renderContent = (comment: any) => {
        const content = transformShortYoutubeLinksinIframes(comment.body);
        const shouldShorten = comment.body.length > 140 && expandedCommentId !== comment.id;
        let displayContent;

        if (shouldShorten) {
            // Attempt to find a safe cut-off point that doesn't split Markdown elements
            const cutOffIndex = Math.min(240, content.lastIndexOf(" ", 240)); // Find last space before 240 chars
            displayContent = `${content.substring(0, cutOffIndex)}...`;
        } else {
            displayContent = content;
        }

        return (
            <>
                <ReactMarkdown
                    components={MarkdownRenderers}
                    rehypePlugins={[rehypeRaw]}
                    remarkPlugins={[remarkGfm]}
                >
                    {displayContent}
                </ReactMarkdown>
                {shouldShorten && (
                    <Button border={"none"} variant={"outline"} size="sm" onClick={() => toggleExpandComment(comment.id)}>Read more</Button>
                )}
            </>
        );
    };


    return (
        <Center flexDirection="column" w="100%" minH="100vh" bg="black">
            <Box borderLeft="1px solid gray" borderRight={"1px solid gray"} width={["100%", "100%", "75%", "50%"]}>
                <Flex p={5} overflowX="hidden" justifyContent="space-between">
                    {reversedComments?.map((comment, index) => (
                        <Avatar
                            key={index}
                            boxSize={12}
                            m={1}
                            src={`https://images.ecency.com/webp/u/${comment.author}/avatar/small`}
                        />
                    ))}
                </Flex>
                <Divider />
            </Box>
            <Box width={["100%", "100%", "75%", "50%"]} bg="black" color="white" borderLeft="1px solid gray" borderRight={"1px solid gray"}>
                <Flex p={4}>
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
                        flex={1} // Makes the textarea flexibly fill the space
                    />

                </Flex>
                <HStack justifyContent="space-between" m={4}>
                    <FaImage cursor="pointer" />
                    <Button variant="outline" ml="auto">Post</Button>
                </HStack>
                <Divider mt={4} />
                <InfiniteScroll
                    dataLength={visiblePosts} //This is important field to render the next data
                    next={() => setVisiblePosts(visiblePosts + 3)}
                    hasMore={visiblePosts < (comments?.length ?? 0)}
                    loader={<Flex justify="center"><BeatLoader size={8} color="darkgrey" /></Flex>}
                    style={{ overflow: "hidden" }}
                >
                    {reversedComments?.map((comment) => (
                        <Box key={comment.id} p={4} width={["100%", "100%", "75%", "50%"]} bg="black" color="white">
                            <HStack spacing={4}>
                                <Avatar
                                    boxSize={12}
                                    src={`https://images.ecency.com/webp/u/${comment.author}/avatar/small`}
                                />
                                <Box flex={1}>
                                    <Text fontWeight="bold">{comment.author}</Text>
                                    <Text fontSize={10} color="gray.400">{formatDate(String(comment.created))}</Text>
                                    <Box mt={2}>
                                        {renderContent(comment)}
                                    </Box>
                                </Box>
                            </HStack>
                            <Flex mt={4} justifyContent={"space-between"}>
                                <Button variant="ghost" leftIcon={<FaRegComment />}>{comment.children}</Button>
                                <Button variant="ghost" leftIcon={<FaRegHeart />}>{comment.active_votes?.length}</Button>
                                <Button variant="ghost" leftIcon={<AiOutlineRetweet />}>{comment.net_votes}</Button>
                                <Button variant="ghost" leftIcon={<FaRegShareSquare />} />

                            </Flex>
                            <Divider mt={4} />

                        </Box>
                    ))}
                </InfiniteScroll>
            </Box>

        </Center >
    );
};
export default SkateCast;
