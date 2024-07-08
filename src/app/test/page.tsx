'use client'
import React, { useState, useEffect, useRef } from 'react';
import { Box, Heading, Text, Divider, Flex, Image, Center, background, HStack, VStack } from '@chakra-ui/react';
import usePosts from '@/hooks/usePosts';
import { Discussion } from '@hiveio/dhive';
import HTMLFlipBook from 'react-pageflip';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { MarkdownRenderers } from '../upload/utils/MarkdownRenderers';
import AuthorAvatar from '@/components/AuthorAvatar';
import { getTotalPayout, transform3SpeakContent, transformEcencyImages, transformIPFSContent, transformNormalYoutubeLinksinIframes, transformShortYoutubeLinksinIframes } from '@/lib/utils';
import { Comment } from '../mainFeed/page';
import TipButton from '@/components/PostCard/TipButton';
import Head from 'next/head';

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
    margin: '0',
    width: '100%',
    height: '100%',
    transition: 'none',
};

const coverStyles = {
    ...pageStyles,
    backgroundColor: 'darkblue',
    color: 'white',
    backgroundImage: 'url(https://media1.giphy.com/media/9ZsHm0z5QwSYpV7g01/giphy.gif?cid=6c09b952uxaerotyqa9vct5pkiwvar6l6knjgsctieeg0sh1&ep=v1_gifs_search&rid=giphy.gif&ct=g)',
    backgroundSize: 'cover',
    textAlign: 'center',
};

const backCoverStyles = {
    ...pageStyles,
    backgroundColor: 'darkred',
    color: 'white',
    justifyContent: 'center',
    alignItems: 'center',
};
const textStyles = {
    position: 'absolute',
    bottom: '20px',
    width: '100%',
    textAlign: 'center',
    color: 'white',
};

export default function TestPage() {
    const SKATEHIVE_TAG = [{ tag: 'hive-173115', limit: 33 }];
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


        <VStack justify="center" align="center" w="100%" h="100vh" p={5}>
            <Heading color={'white'}>Use your keyboard arrows ←→ to navigate</Heading>
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
                <Box sx={coverStyles}>
                    <Flex direction="column" align="center">
                        <Heading>
                            <Image src="/skatehive-banner.png" alt="SkateHive Logo" />
                        </Heading>
                        <Center m={20}>
                            <Image boxSize={'360px'} src="/skatehive_square_green.png" alt="SkateHive Logo" />
                        </Center>
                        <Box m={5} borderRadius={5} backgroundColor={'black'} sx={textStyles}>
                            <Text fontSize={'22px'} color='white'>Welcome to the SkateHive Magazine</Text>
                            <Text fontSize={'22px'} color='white'>A infinity mag created by skaters all over the world.</Text>
                        </Box>
                    </Flex>
                </Box>
                {posts.map((post: Discussion) => (
                    <Box key={post.id} sx={pageStyles}>
                        <Flex align="center">
                            <AuthorAvatar username={post.author} boxSize={10} />
                            <Heading color={'white'} fontSize="xl" ml={2}>{post.title}</Heading>
                        </Flex>
                        <HStack justifyContent={'space-between'}>
                            <Text color={'white'} mt={4}>{post.author}</Text>
                            <Text color='white' mt={2}>{new Date(post.created).toLocaleDateString()}</Text>
                            <Text color='yellow' mt={2}>${getTotalPayout(post as Comment)} USD</Text>
                            <TipButton author={post.author} />
                        </HStack>
                        <Divider mt={4} mb={4} />
                        <ReactMarkdown
                            key={post.id}
                            className="page"
                            remarkPlugins={[remarkGfm]}
                            rehypePlugins={[rehypeRaw]}
                            components={MarkdownRenderers}
                        >
                            {transform3SpeakContent(transformIPFSContent(transformEcencyImages(transformNormalYoutubeLinksinIframes(transformShortYoutubeLinksinIframes(post.body)))))}
                        </ReactMarkdown>
                        <Divider mt={4} mb={4} />
                        <Text>Pending Payout: {post.pending_payout_value.toString()}</Text>
                    </Box>
                ))}
                <Box sx={backCoverStyles}>
                    <Heading>Back Cover</Heading>
                    <Text>Thrasher my ass!</Text>
                </Box>
            </HTMLFlipBook>
        </VStack>
    );
}
