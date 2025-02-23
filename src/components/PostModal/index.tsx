'use client'
import VotingButton from "@/components/ButtonVoteComponent/VotingButton";
import { usePostContext } from "@/contexts/PostContext";
import { useHiveUser } from "@/contexts/UserContext";
import { useComments } from "@/hooks/comments";
import getTranslation from "@/lib/getTranslation";
import HiveClient from "@/lib/hive/hiveclient";
import { HiveAccount } from "@/lib/useHiveAuth";
import { transform3SpeakContent, transformEcencyImages } from "@/lib/utils";
import {
  Box,
  Center,
  HStack,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Modal, ModalBody, ModalCloseButton, ModalContent,
  ModalFooter, ModalHeader, ModalOverlay,
  Spinner,
  Text,
  Tooltip,
  VStack
} from "@chakra-ui/react";
import debounce from "lodash.debounce";
import { useCallback, useEffect, useMemo, useState } from 'react';
import { FaGlobe } from "react-icons/fa";
import Header from "../PostCard/Header";
import TipButton from "../PostCard/TipButton";
import MarkdownRenderer from "../ReactMarkdown/page";
import CommandPrompt from "./commentPrompt";
import CommentsSection from "./commentSection";
interface PostModalInterface {
  isOpen: boolean;
  onClose(): void;
  username?: string
}

export function PostModal({ isOpen, onClose, username }: PostModalInterface) {
  const { post } = usePostContext();
  const { comments, addComment } = useComments(post.author, post.permlink, true);
  const postBody = transform3SpeakContent(post.body);
  const transformedPostBody = useMemo(() => transformEcencyImages(postBody), [postBody]);
  const [isValueTooltipOpen, setIsValueTooltipOpen] = useState(false);
  const { hiveUser, voteValue } = useHiveUser()

  const usernameString = username
    ? typeof username === "string"
      ? username
      : (username as HiveAccount)?.name || ""
    : hiveUser?.name || "";

  const [isTranslated, setIsTranslated] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("english");
  const [translatedPost, setTranslatedPost] = useState("");
  const [translationsCache, setTranslationsCache] = useState<{ [key: string]: string }>({});
  const [isLoadingTranslation, setIsLoadingTranslation] = useState(false);
  const [postEarnings, setPostEarnings] = useState(Number(post.getEarnings().toFixed(2)))

  const translate = useCallback(
    debounce(async (language: string) => {
      setIsLoadingTranslation(true);
      if (translationsCache[language]) {
        setTranslatedPost(translationsCache[language]);
      } else {
        const translated = await getTranslation(post.body, language);
        setTranslatedPost(translated);
        setTranslationsCache((prev) => ({ ...prev, [language]: translated }));
      }
      setIsLoadingTranslation(false);
    }, 300),
    [post.body, translationsCache]
  );

  useEffect(() => {
    const fetchPosts = async (username: string) => {
      try {
        const query = { tag: username, limit: 3 };
        const response = await HiveClient.database.getDiscussions("blog", query);
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };
    fetchPosts(post.author);
  }, [post.author]);

  const handleTranslation = (language: string) => {
    setSelectedLanguage(language);
    setIsTranslated(true);
    translate(language);
  };

  const toggleValueTooltip = () => {
    setIsValueTooltipOpen(true);
    setTimeout(() => {
      setIsValueTooltipOpen(false);
    }, 3000);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={{ base: "lg", md: "2xl", lg: "6xl" }}>
      <ModalOverlay style={{ backdropFilter: "blur(5px)" }} />
      <ModalContent color={"white"} bg="black" border="1.4px solid #A5D6A7" borderRadius={0} p={4} w="100%">
        <ModalHeader><Header variant="open" /></ModalHeader>
        <ModalCloseButton mr={4} mt={2} color="red" />
        <ModalBody display="flex" flexDir={{ base: "column", lg: "row" }} minH="60vh" gap={6}>
          <Box bg="black" flex={0} p={0} border="0px solid #A5D6A7" borderRadius={0} minW="50%" key={post.post_id}>
            <Menu>
              <MenuButton><FaGlobe /> </MenuButton>
              <MenuList bg={'black'}>
                <MenuItem onClick={() => handleTranslation("english")} bg={'black'} color={"white"}>English</MenuItem>
                <MenuItem onClick={() => handleTranslation("portuguese")} bg={'black'} color={"white"}>Portuguese</MenuItem>
                <MenuItem onClick={() => handleTranslation("spanish")} bg={'black'} color={"white"}>Spanish</MenuItem>
                <MenuItem onClick={() => handleTranslation("french")} bg={'black'} color={"white"}>French</MenuItem>
                <MenuItem onClick={() => handleTranslation("greek")} bg={'black'} color={"white"}>Greek</MenuItem>
              </MenuList>
            </Menu>

            {isLoadingTranslation ? (
              <Center>
                <VStack>

                  <Text> Translation Loading </Text>

                  <Spinner size="xl" color="white" />
                </VStack>

              </Center>
            ) : (

              <MarkdownRenderer content={isTranslated ? translatedPost : transformedPostBody} />
            )}
          </Box>
          <Box minW="50%">
            <HStack ml={"10px"} mr={"35px"} justifyContent={"space-between"}>
              <Box mr={5} mt={1} >
                <TipButton author={post.author} permlink={post.permlink} />
              </Box>
              <VotingButton comment={post} username={usernameString} />
              <Tooltip
                label={`+$${voteValue.toFixed(6)}`}
                placement="top"
                isOpen={isValueTooltipOpen}
                hasArrow
              >
                <Text
                  fontWeight={"bold"}
                  color={"green.400"}
                  cursor={"pointer"}
                  mt={2}
                >
                  ${postEarnings.toFixed(2)}
                </Text>
              </Tooltip>
            </HStack>
            <CommandPrompt
              addComment={addComment}
              onClose={onClose}
              author={post.author}
              permlink={post.permlink}
              onNewComment={(newComment) => {
                addComment(newComment);
              }}
            />

            <Center><Text fontSize="2xl">Comments</Text></Center>
            <CommentsSection comments={comments} />
          </Box>
        </ModalBody>
        <ModalFooter></ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default PostModal;
