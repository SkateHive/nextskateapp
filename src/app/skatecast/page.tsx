'use client'
import React from 'react';
import { Box, Image, Text, Flex, Button, Avatar, Divider, Center, HStack, Textarea } from '@chakra-ui/react';
import { FaRegComment, FaRegHeart, FaRegShareSquare } from 'react-icons/fa';
import { AiOutlineRetweet } from 'react-icons/ai';
import { useComments } from '@/hooks/comments';
import { MarkdownRenderers } from '../upload/utils/MarkdownRenderers';
import ReactMarkdown from 'react-markdown';
import MDEditor from '@uiw/react-md-editor';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import CommandPrompt from '@/components/PostModal/commentPrompt';

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
                    >{comment.body}
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
