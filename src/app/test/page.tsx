'use client'
import React, { useState, useEffect, useRef } from 'react';
import { Box, Heading, Text, Divider, Flex } from '@chakra-ui/react';
import usePosts from '@/hooks/usePosts';
import { Discussion } from '@hiveio/dhive';
import HTMLFlipBook from 'react-pageflip';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { MarkdownRenderers } from '../upload/utils/MarkdownRenderers';
import Header from '@/components/PostCard/Header';

// Define the type for a post
interface Post extends Discussion {
    post_id: number;
    pending_payout_value: string;
}

// CSS styles as a constant
const pageStyles = {
    backgroundColor: 'black',
    border: '1px solid #ccc',
    boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.5)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '20px',
    color: 'black',
    maxHeight: '100vh',
    overflow: 'auto',
    position: 'relative',
};

const flipbookStyles = {
    margin: 'auto',
    width: '100%',
    height: '100%',
    transition: 'none',
};

export default function TestPage() {
    const SKATEHIVE_TAG = [{ tag: 'hive-173115', limit: 20 }];
    const [tag, setTag] = useState(SKATEHIVE_TAG);
    const [query, setQuery] = useState('created');
    const { posts, error, isLoading, setQueryCategory, setDiscussionQuery } = usePosts(query, tag);
    const flipBookRef = useRef<any>(null);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (flipBookRef.current) {
                if (event.key === 'ArrowRight') {
                    flipBookRef.current.pageFlip().flipNext();
                } else if (event.key === 'ArrowLeft') {
                    flipBookRef.current.pageFlip().flipPrev();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    if (isLoading) {
        return (
            <Flex justify="center" align="center" w="100vw" h="100vh" p={5}>
                <Text color={'white'}>Loading...</Text>
            </Flex>
        );
    }

    if (error) {
        return (
            <Flex justify="center" align="center" w="100vw" h="100vh" p={5}>
                <Text color={'white'}>Error loading posts</Text>
            </Flex>
        );
    }

    if (!posts || posts.length === 0) {
        return (
            <Flex justify="center" align="center" w="100vw" h="100vh" p={5}>
                <Text>No posts available</Text>
            </Flex>
        );
    }

    return (
        <Flex justify="center" align="center" w="100%" h="100vh" p={5}>
            <HTMLFlipBook
                width={600}
                height={850}
                minWidth={300}
                maxWidth={1200}
                minHeight={500}
                maxHeight={1600}
                size="fixed"
                startPage={0}
                drawShadow
                flippingTime={1000}
                usePortrait
                startZIndex={0}
                autoSize
                maxShadowOpacity={0.5}
                showCover={true}
                mobileScrollSupport
                swipeDistance={30}
                clickEventForward
                useMouseEvents
                renderOnlyPageLengthChange={false}
                onFlip={(e) => console.log('Current page:', e.data)}
                onChangeOrientation={(e) => console.log('Orientation:', e.data)}
                onChangeState={(e) => console.log('State:', e.data)}
                onInit={(e) => console.log('Book initialized:', e.data)}
                onUpdate={(e) => console.log('Book updated:', e.data)}
                showPageCorners
                disableFlipByClick={false}
                className="flipbook"
                style={flipbookStyles}
                ref={flipBookRef}
            >
                {posts.map((post: Discussion) => (
                    <Box key={post.id} sx={pageStyles}>
                        <Heading color={'white'} fontSize="xl">{post.title}</Heading>
                        <Text color={'white'} mt={4}>Author: {post.author}</Text>
                        <Text color='white' mt={2}>{new Date(post.created).toLocaleDateString()}</Text>
                        <Divider mt={4} mb={4} />
                        <ReactMarkdown
                            key={post.id}
                            className="page"
                            remarkPlugins={[remarkGfm]}
                            rehypePlugins={[rehypeRaw]}
                            components={MarkdownRenderers}
                        >
                            {post.body}
                        </ReactMarkdown>
                        <Divider mt={4} mb={4} />
                        <Text>Pending Payout: {post.pending_payout_value.toString()}</Text>
                        <Text>Category: {post.category}</Text>
                        <Text>Tags: {JSON.parse(post.json_metadata).tags.join(', ')}</Text>
                    </Box>
                ))}
            </HTMLFlipBook>
        </Flex>
    );
}
