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
import { useEffect, useRef } from "react";
import HTMLFlipBook from "react-pageflip";
import { FullMagazineRenderers } from "./FullMagazineRenderers";

const pageStyles = {
  backgroundColor: "black",
  border: "1px solid #ccc",
  boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.5)",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  padding: "20px",
  color: "black",
  overflow: "auto",
  position: "relative",
  height: 100,
  zIndex: 1, // Ensure page is below video and controls
};

const flipbookStyles = {
  width: "100vw",
  height: "100vh",
  transition: "none",
};

const coverStyles = {
  ...pageStyles,
  backgroundColor: "darkblue",
  color: "white",
  backgroundSize: "cover",
  textAlign: "center",
};

const backCoverStyles = {
  ...pageStyles,
  backgroundColor: "darkred",
  color: "white",
  justifyContent: "center",
  alignItems: "center",
  backgroundImage:
    "url(https://media1.giphy.com/media/9ZsHm0z5QwSYpV7g01/giphy.gif?cid=6c09b952uxaerotyqa9vct5pkiwvar6l6knjgsctieeg0sh1&ep=v1_gifs_search&rid=giphy.gif&ct=g)",
  backgroundSize: "cover",
};


export interface FullMagProps {
  tag: { tag: string; limit: number }[];
  query: string;
}

export default function FullMag({ tag, query }: FullMagProps) {
  const { posts, error, isLoading } = usePosts(query, tag);
  const flipBookRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (flipBookRef.current) {
        if (event.key === "ArrowRight") {
          flipBookRef.current.pageFlip().flipNext();
        } else if (event.key === "ArrowLeft") {
          flipBookRef.current.pageFlip().flipPrev();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const playSound = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0.02;
      audioRef.current.play();
    }
  };

  if (isLoading) {
    return (
      <Flex justify="center" align="center" w="100vw" h="100vh" p={5}>
        <Text color={"white"}>Use your keyboard to navigate and the mouse scroll to read</Text>
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

  if (!posts || posts.length === 0) {
    return (
      <Flex justify="center" align="center" w="100vw" h="100vh" p={5}>
        <Text>No posts available</Text>
      </Flex>
    );
  }
  const filteredPosts = posts ? posts.filter(post => !blockedUsers.includes(post.author)) : [];

  return (
    <VStack justify="center" align="center" w="100%" p={5}>
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
        onFlip={(e) => {
          playSound();
        }}
      >
        <Box sx={coverStyles}>
          <Flex direction="column" align="center" justify="center">
            <Image src="https://ipfs.skatehive.app/ipfs/QmR7KVsGDQH93eU3C8CSCejnbuXrmku2RkyodSdJn61RAN" alt="SkateHive Logo" height={750} loading="lazy" />
          </Flex>
          <Flex justifyContent={'right'}>
            <Text color={'limegreen'} fontSize={36}> issue ∞ </Text>
          </Flex>
        </Box>
        {filteredPosts
          .sort((a, b) => Number(getTotalPayout(b as any)) - Number(getTotalPayout(a as any)))
          .map((post: Discussion) => (
            <Box key={post.id} sx={pageStyles}>
              <HStack spacing={2}>
                <VStack p={1} borderRadius={5} width={"20%"} >
                  <AuthorAvatar username={post.author} boxSize={30} borderRadius={100} />
                  <Text color={"white"} mt={0} fontSize={10}>
                    {post.author}
                  </Text>
                </VStack>
                <Text
                  fontSize={'16px'}
                  color={"white"}
                  whiteSpace="nowrap"
                  overflow="hidden"
                  textOverflow="ellipsis"
                  bg={"#28292b"}
                  p={2}
                  borderRadius={5}
                  w={"80%"}
                  pl={5}
                >
                  {post.title}
                </Text>
                <Badge
                  variant={"outline"}
                  h={"30px"}
                  width={"20%"}
                  cursor={"pointer"}
                  onClick={(e) => e.stopPropagation()}
                  zIndex={10}
                >
                  <Center>
                    <Text fontSize={'22px'}> ${Number(getTotalPayout(post as any)).toFixed(2)}</Text>
                  </Center>
                </Badge>
              </HStack>

              <Divider mt={2} mb={2} />
              <MarkdownRenderer key={post.id} content={post.body} renderers={FullMagazineRenderers} className="page" />
              <Divider mt={4} mb={4} />
              <Flex justifyContent={"space-between"}>
                <Badge colorScheme="green" variant={"outline"} h={"30px"} width={"20%"}>
                  <Center>
                    <Text fontSize={'22px'}> ${Number(getTotalPayout(post as any)).toFixed(2)}</Text>
                  </Center>
                </Badge>
                <Badge colorScheme="green" variant={"outline"} mt={2}>
                  <Text color={"white"} fontSize={"16px"}>
                    {new Date(post.created).toLocaleDateString()}
                  </Text>
                </Badge>
              </Flex>
              <Text>Pending Payout: {post.pending_payout_value.toString()}</Text>
            </Box>
          ))}

        <Box sx={backCoverStyles}>
          <Heading>Back Cover</Heading>
          <Text>Last Page</Text>
        </Box>
      </HTMLFlipBook>
    </VStack>
  );
}
