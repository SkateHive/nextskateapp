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
        "skatehive",
        "the-weekly-stoken-55"
    )
    const reversedComments = comments?.slice().reverse();
    const formatDate = (date: string) => {
        return new Date(date).toLocaleString();
    }



    return (
        <Center flexDirection="column" w="100%" minH="100vh" bg="black">
            <Box borderLeft="1px solid gray" borderRight="1px solid gray" minW={"50%"}>
                <Flex p={5} overflowX={"hidden"} justifyContent={"space-between"}>
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
            <Box p={4} width="50%" bg="black" color="white" borderLeft="1px solid gray" borderRight="1px solid gray">
                <Flex>
                    <Avatar
                        boxSize={12}
                        src="https://images.ecency.com/webp/u/skatehive/avatar/small"
                    />
                    <Textarea
                        border="none"
                        _focus={{
                            border: "none", // Ensures no border is shown on focus
                            boxShadow: "none" // Removes any focus shadow that might be applied
                        }}
                        placeholder="What's happening?"
                    />
                </Flex>
                <HStack justifyContent={"space-between"} m={4}>
                    <FaImage cursor={"pointer"} />
                    <Button variant={"outline"} ml={"auto"}>Post</Button>
                </HStack>
                <Divider mt={4} />
            </Box>



            {reversedComments?.map((comment) => (
                <Box key={comment.id} p={4} width="50%" bg="black" color="white" borderLeft="1px solid gray" borderRight={"1px solid gray"} >

                    <Flex>
                        <Avatar
                            boxSize={12}
                            src={`https://images.ecency.com/webp/u/${comment.author}/avatar/small`}
                        />
                        <Box ml={4}>
                            <Text fontWeight="bold">{comment.author}</Text>
                            <Text color="gray.400">{comment.author.toString()}</Text>
                        </Box>
                        <Box justifyContent={"flex-end"} ml={"auto"}>
                            <Text ml={2} color="gray.400">{formatDate(String(comment.created))}</Text>
                        </Box>
                    </Flex>
                    <Box mt={4}><ReactMarkdown
                        components={MarkdownRenderers}
                        rehypePlugins={[rehypeRaw]}
                        remarkPlugins={[remarkGfm]}
                    >{transformShortYoutubeLinksinIframes(comment.body)}
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
            ))}
        </Center>
    );
};

export default SkateCast;
