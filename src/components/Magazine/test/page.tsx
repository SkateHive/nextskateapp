"use client";
import AuthorAvatar from "@/components/AuthorAvatar";
import TipButton from "@/components/PostCard/TipButton";
import { MagModal } from "@/components/Profile/MagModal";
import { useQueryResult } from "@/contexts/QueryContext";
import {
  getTotalPayout,
  transform3SpeakContent,
  transformEcencyImages,
  transformNormalYoutubeLinksinIframes,
  transformShortYoutubeLinksinIframes,
} from "@/lib/utils";
import { PINATA_URL } from "@/utils/constants";
import {
  Box,
  Center,
  Divider,
  Flex,
  Heading,
  HStack,
  Image,
  Kbd,
  Text,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import { Discussion } from "@hiveio/dhive";
import { memo, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import HTMLFlipBook from "react-pageflip";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import { Comment } from "../../../app/mainFeed/page";
import { MagazineRenderers } from "../MagazineRenderers";
interface Post extends Discussion {
  post_id: number;
  pending_payout_value: string;
}


// CSS styles as a constant
const pageStyles = {
  backgroundColor: "black",
  border: "1px solid #ccc",
  boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.5)",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  padding: "20px",
  color: "black",
  // maxHeight: '100vh',
  overflow: "auto",
  position: "relative",
};

const flipbookStyles = {
  margin: "0",
  width: "100%",
  height: "100%",
  transition: "none",
};

const coverStyles = {
  ...pageStyles,
  backgroundColor: "darkblue",
  color: "white",
  backgroundImage:
    "url(https://media1.giphy.com/media/9ZsHm0z5QwSYpV7g01/giphy.gif?cid=6c09b952uxaerotyqa9vct5pkiwvar6l6knjgsctieeg0sh1&ep=v1_gifs_search&rid=giphy.gif&ct=g)",
  backgroundSize: "cover",
  textAlign: "center",
};

const backCoverStyles = {
  ...pageStyles,
  backgroundColor: "darkred",
  color: "white",
  justifyContent: "center",
  alignItems: "center",
};
const textStyles = {
  position: "absolute",
  bottom: "20px",
  width: "100%",
  textAlign: "center",
  color: "white",
};

export interface TestPageProps {
  tag: { tag: string; limit: number }[];
  query: string;
}
export default memo(function Zine({ tag, query }: TestPageProps) {
  const { posts, isLoading, error } = useQueryResult();
  const [isZineFullScreen, setIsZineFullScreen] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const flipBookRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (flipBookRef.current) {
        if (event.key === "ArrowRight") {
          flipBookRef.current.pageFlip().flipNext();
        } else if (event.key === "ArrowLeft") {
          flipBookRef.current.pageFlip().flipPrev();
        } else if (event.code === "Space") {
          setIsZineFullScreen(!isZineFullScreen);
          onOpen(); // Trigger the modal to open
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isZineFullScreen, onOpen]);

  if (isLoading) {
    return (
      <Flex justify="center" align="center" w="100%" h="100%" p={5}>
        <Text color={"white"}>Loading...</Text>
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
  const playSound = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0.02;
      audioRef.current.play();
    }
  };
  return (
    <>
      <VStack
        justify="center"
        align="center"
        w="100%"
        p={5}
        overflow={"hidden"}
      >
        <Text
          border={"1px solid white"}
          borderRadius="10px"
          p={2}
          color={"white"}
        >
          Use your keyboard arrows <Kbd background={"black"}>←</Kbd> and{" "}
          <Kbd background={"black"}>→</Kbd> to navigate. Press <Kbd background={"black"}>Space</Kbd> for full screen.
        </Text>
        <HTMLFlipBook
          width={1000}
          height={1300}
          minWidth={0}
          maxWidth={1000}
          minHeight={0}
          maxHeight={750}
          startPage={0}
          size="stretch"
          drawShadow
          flippingTime={1000}
          usePortrait
          startZIndex={0}
          autoSize={true}
          maxShadowOpacity={0.5}
          showCover={false}
          mobileScrollSupport
          swipeDistance={30}
          clickEventForward
          useMouseEvents
          renderOnlyPageLengthChange={false}
          showPageCorners={false}
          disableFlipByClick={false}
          className="flipbook"
          style={flipbookStyles}
          ref={flipBookRef}
          onFlip={(e) => {
            playSound();
          }}
        >
          <Box sx={coverStyles}>
            <Flex direction="column" align="center">
              <Heading>
                <Image src="/skatehive-banner.png" alt="SkateHive Logo" />
              </Heading>
              <Center m={20}>
                <Image
                  boxSize={"auto"}
                  src="/SKATE_HIVE_VECTOR_FIN.svg"
                  alt="SkateHive Logo"
                />
              </Center>
              <Box
                m={5}
                borderRadius={5}
                backgroundColor={"black"}
                sx={textStyles}
              >
                <Text fontSize={"12px"} color="white">
                  Welcome to the {String(tag[0].tag)} Magazine
                </Text>
                <Text fontSize={"12px"} color="white">
                  An infinite mag created by skaters all over the world.
                </Text>
              </Box>
            </Flex>
          </Box>
          {posts.map((post: Discussion) => (
            <Box key={post.id} sx={pageStyles}>
              <Flex align="center">
                <AuthorAvatar username={post.author} boxSize={10} />
                <Heading color={"white"} fontSize="xl" ml={2}>
                  {post.title}
                </Heading>
              </Flex>
              <HStack justifyContent={"space-between"}>
                <Text color={"white"} mt={2}>
                  {post.author}
                </Text>
                <Text color="yellow" mt={2}>
                  ${Number(getTotalPayout(post as Comment)).toFixed(2)} USD
                </Text>
                <TipButton author={post.author} permlink={post.permlink} />
              </HStack>
              <Divider mt={4} mb={4} />
              <Text fontSize={"8px"} color="white" mt={-2}>
                {new Date(post.created).toLocaleDateString()}
              </Text>

              <ReactMarkdown
                key={post.id}
                className="page"
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                components={MagazineRenderers}
              >
                {transform3SpeakContent(
                  transformEcencyImages(
                    transformNormalYoutubeLinksinIframes(
                      transformShortYoutubeLinksinIframes(post.body),
                    ),
                  ),
                )}
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
      {isOpen && <MagModal username={tag[0].tag} query={query} isOpen={isOpen} onClose={onClose} />}
    </>
  );
});