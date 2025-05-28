"use client";
import AuthorAvatar from "@/components/AuthorAvatar";
import MarkdownRenderer from "@/components/ReactMarkdown/page";
import usePosts from "@/hooks/usePosts";
import { blockedUsers } from "@/lib/constants";
import {
  getTotalPayout
} from "@/lib/utils";
import { PINATA_URL } from "@/utils/constants";
import {
  Badge,
  border,
  Box,
  Center,
  Divider,
  Flex,
  Heading,
  HStack,
  Image,
  Text,
  VStack
} from "@chakra-ui/react";
import { Discussion } from "@hiveio/dhive";
import { useMemo, useRef } from "react";
import HTMLFlipBook from "react-pageflip";
import { FullMagazineRenderers } from "./FullMagazineRenderers";

const backgroundGradient = {
  minHeight: "100vh",
  width: "100vw",
  p: 0,
  m: 0,
  overflow: "hidden",
};

const pageStyles = {
  background: "linear-gradient(135deg,rgb(8, 8, 8) 80%,rgb(51, 54, 57) 100%)",
  borderRadius: "16px",
  boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.15)",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  padding: "32px 28px 48px 28px",
  color: "#232526",
  overflow: "auto",
  position: "relative",
  minHeight: 400,
  zIndex: 1,
  border: "1px solid #e0e7ef",
};

const flipbookStyles = {
  width: "100vw",
  height: "100vh",
  transition: "none",
};

const retroFont = {
  fontFamily: `'Joystix', 'VT323', 'Fira Mono', 'monospace'`,
  letterSpacing: '0.5px',
};
const neonGreen = '#39FF14';
const neonShadow = '0 0 8px #39FF14, 0 0 16px #39FF14';
const retroBoxShadow = '0 0 0 2px #232526, 0 0 8px #39FF14';

const coverStyles = {
  ...pageStyles,
  borderRadius: '0px 16px 0px 0px',
  background: 'linear-gradient(120deg,rgba(56, 161, 105, 0.6),rgb(5, 5, 5) 100%)',
  color: neonGreen,
  backgroundSize: 'cover',
  textAlign: 'center',
  boxShadow: retroBoxShadow,
  ...retroFont,
};

const backCoverStyles = {
  ...pageStyles,
  background: "linear-gradient(120deg, #b31217 60%, #e52d27 100%)",
  color: "white",
  justifyContent: "center",
  alignItems: "center",
  backgroundImage:
    "url(https://media1.giphy.com/media/9ZsHm0z5QwSYpV7g01/giphy.gif?cid=6c09b952uxaerotyqa9vct5pkiwvar6l6knjgsctieeg0sh1&ep=v1_gifs_search&rid=giphy.gif&ct=g)",
  backgroundSize: "cover",
  boxShadow: "0 8px 32px 0 rgba(179,18,23,0.25)",
};


export interface FullMagProps {
  tag: { tag: string; limit: number }[];
  query: string;
}

export default function FullMag({ tag, query }: FullMagProps) {
  const { posts, error, isLoading } = usePosts(query, tag);
  const flipBookRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Memoize filtered and sorted posts for performance
  const filteredPosts = useMemo(() => {
    if (!posts) return [];
    return posts
      .filter(post => !blockedUsers.includes(post.author))
      .sort((a, b) => Number(getTotalPayout(b as any)) - Number(getTotalPayout(a as any)));
  }, [posts]);

  const playSound = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0.02;
      audioRef.current.play();
    }
  };

  if (isLoading) {
    return (
      <Flex justify="center" align="center" w="100vw" h="100vh" p={5}>
        <Text color={"white"}>Use your mouse to flip pages and scroll the pages</Text>
      </Flex>
    );
  }

  if (error) {
    return (
      <Flex justify="center" align="center" w="100%" h="100%" p={5}>
        <Text color={"white"}>Error loading posts</Text>
      </Flex>
    );
  }

  if (!filteredPosts.length) {
    return (
      <Flex justify="center" align="center" w="100vw" h="100vh" p={5}>
        <Text>No posts available</Text>
      </Flex>
    );
  }

  return (
    <VStack {...backgroundGradient} justify="center" align="center">
      {/* Debug: Show ref content */}
      <audio ref={audioRef} src="/pageflip.mp3" preload="auto" />

      <HTMLFlipBook
        width={1000}
        height={1300}
        minWidth={0}
        maxWidth={1000}
        minHeight={0}
        maxHeight={750}
        startPage={0}
        size="stretch"
        drawShadow={false} // Disable shadow drawing
        flippingTime={1000}
        usePortrait
        startZIndex={0}
        autoSize={true}
        maxShadowOpacity={0.2} // Reduce shadow opacity
        showCover={false}
        mobileScrollSupport
        swipeDistance={50} // Increase swipe distance for less sensitivity
        clickEventForward={false}
        useMouseEvents
        renderOnlyPageLengthChange={true} // Enable render only on page length change
        showPageCorners={false}
        disableFlipByClick={true}
        className="flipbook"
        style={flipbookStyles}
        ref={flipBookRef}
        onInit={(instance) => {
          flipBookRef.current = instance;
        }}
        onFlip={(e) => {
          playSound();
        }}
      >
        <Box sx={coverStyles}>
          <Flex direction="column" align="center" justify="center" h="100%">
            <Image src="/cover.png" alt="SkateHive Logo" height={[200, 300, 400, 500, 600]} loading="lazy" borderRadius="lg" boxShadow="xl" mb={6} />
            <Heading size="2xl" fontWeight="extrabold" letterSpacing="tight" mb={2} style={{ ...retroFont, textShadow: neonShadow, color: neonGreen }}>
              SkateHive Magazine
            </Heading>
            <Text fontSize="xl" color={neonGreen} mb={4} style={{ ...retroFont, textShadow: neonShadow }}>
              The Community Skateboarding Zine
            </Text>
            <Badge fontSize="lg" px={4} py={2} borderRadius="md" mb={4} bg={neonGreen} color="#181c1b" boxShadow={neonShadow} style={{ ...retroFont }}>
              Issue ∞
            </Badge>
          </Flex>
        </Box>
        {filteredPosts.map((post: Discussion, index) => {
          const isLeftPage = index % 2 === 0;
          const pageBorderRadius = isLeftPage
            ? "16px 0 0 0px"
            : "0 16px 0px 0";
          return (
            <Box
              key={`${post.id}-${index}`}
              sx={{ ...pageStyles, borderRadius: pageBorderRadius }}
              position="relative"
            >
              <HStack
                spacing={2}
                mb={1}
                align="center"
                minH="56px"
                py={1}
                boxShadow="0px 4px 12px rgba(0, 0, 0, 0.2)"
                bg="linear-gradient(90deg, rgba(10,30,10,0.98) 80%, rgba(30,40,20,0.98) 100%)"
                border="1px solid #3a3639"
                borderRadius={0}
                position="fixed"
                top={0}
                left={0}
                right={0}
                width="100vw"
                zIndex={200}
                style={{ backdropFilter: 'blur(2px)', marginTop: 0 }}
              >
                <Box borderRadius={8} ml={2}>
                  <AuthorAvatar username={post.author} boxSize={20} borderRadius={0} />
                </Box>
                <VStack align={{ base: "center", sm: "start" }} spacing={0.5} flex="1">
                  <Text
                    fontSize={{ base: "xs", md: "xs" }}
                    color={"white"}
                    style={{ ...retroFont }}
                  >
                    @{post.author}
                  </Text>
                  <Heading
                    fontSize={{ base: "sm", md: "sm" }}
                    fontWeight="bold"
                    textAlign={{ base: "center", sm: "left" }}
                    lineHeight="1.2"
                    color={neonGreen}
                    style={{ ...retroFont }}
                    noOfLines={2}
                    isTruncated
                    maxW={{ base: "180px", md: "340px" }}
                    whiteSpace="normal"
                  >
                    {post.title}
                  </Heading>
                  <Text fontSize="xs" color="#A6E22E" style={{ ...retroFont }}>{new Date(post.created).toLocaleDateString()}</Text>
                </VStack>
                <Badge
                  variant={"solid"}
                  bg={neonGreen}
                  color="#181c1b"
                  h={"28px"}
                  minW={"48px"}
                  px={2}
                  cursor={"pointer"}
                  onClick={(e) => e.stopPropagation()}
                  zIndex={10}
                  borderRadius={8}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  fontWeight="bold"
                  style={{ ...retroFont }}
                  mr={2}
                >
                  <Center>
                    <Text fontSize={'14px'} fontWeight="bold" style={{ ...retroFont }}>
                      $ {Number(getTotalPayout(post as any)).toFixed(2)}
                    </Text>
                  </Center>
                </Badge>
              </HStack>
              <br/>
               <br/>
                <br/>
              <MarkdownRenderer key={post.id} content={post.body} renderers={FullMagazineRenderers} className="page" />
              <Divider mt={4} mb={4} />
              <Flex justifyContent={"space-between"} alignItems="center">
                <Badge colorScheme="green" variant={"solid"} h={"30px"} width={"20%"} borderRadius={8} display="flex" alignItems="center" justifyContent="center">
                  <Center>
                    <Text fontSize={'22px'} fontWeight="bold"> ${Number(getTotalPayout(post as any)).toFixed(2)}</Text>
                  </Center>
                </Badge>
                <Badge colorScheme="gray" variant={"subtle"} mt={2} px={3} py={1} borderRadius={8} display="flex" alignItems="center">
                  <Text color="#232526" fontSize={"16px"}>
                    {new Date(post.created).toLocaleDateString()}
                  </Text>
                </Badge>
              </Flex>
            </Box>
          );
        })}

        <Box sx={backCoverStyles}>
          <Heading>Back Cover</Heading>
          <Text>Last Page</Text>
        </Box>
      </HTMLFlipBook>
    </VStack>
  );
}
