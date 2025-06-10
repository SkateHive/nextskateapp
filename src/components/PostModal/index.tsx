"use client";
import VotingButton from "@/components/ButtonVoteComponent/VotingButton";
import { usePostContext } from "@/contexts/PostContext";
import { useUserData, useVoteValue } from "@/contexts/UserContext";
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
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Text,
  Tooltip,
  VStack,
} from "@chakra-ui/react";
import debounce from "lodash.debounce";
import { useCallback, useEffect, useMemo, useState, memo, useRef } from "react";
import { FaGlobe } from "react-icons/fa";
import Header from "../PostCard/Header";
import TipButton from "../PostCard/TipButton";
import MarkdownRenderer from "../ReactMarkdown/page";
import CommentsComponent from "@/app/dao/components/comments";

interface PostModalInterface {
  isOpen: boolean;
  onClose(): void;
  username?: string;
}

// Memoized language options to prevent recreating on every render
const LANGUAGE_OPTIONS = [
  { code: "english", label: "English" },
  { code: "portuguese", label: "Portuguese" },
  { code: "spanish", label: "Spanish" },
  { code: "french", label: "French" },
  { code: "greek", label: "Greek" },
] as const;

// Memoized translation menu component
const TranslationMenu = memo(
  ({
    onTranslate,
    isLoading,
  }: {
    onTranslate: (language: string) => void;
    isLoading: boolean;
  }) => (
    <Menu>
      <MenuButton disabled={isLoading}>
        <FaGlobe />
      </MenuButton>
      <MenuList bg="black">
        {LANGUAGE_OPTIONS.map(({ code, label }) => (
          <MenuItem
            key={code}
            onClick={() => onTranslate(code)}
            bg="black"
            color="white"
            _hover={{ bg: "gray.700" }}
          >
            {label}
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  )
);

TranslationMenu.displayName = "TranslationMenu";

// Memoized content renderer
const ContentRenderer = memo(
  ({ content, isLoading }: { content: string; isLoading: boolean }) => {
    if (isLoading) {
      return (
        <Center>
          <VStack>
            <Text>Translation Loading</Text>
            <Spinner size="xl" color="white" />
          </VStack>
        </Center>
      );
    }

    return <MarkdownRenderer content={content} />;
  }
);

ContentRenderer.displayName = "ContentRenderer";

// Memoized voting section
const VotingSection = memo(
  ({
    post,
    username,
    onVoteSuccess,
    voteValue,
    isTooltipOpen,
    postEarnings,
  }: {
    post: any;
    username: string;
    onVoteSuccess: () => void;
    voteValue: number;
    isTooltipOpen: boolean;
    postEarnings: number;
  }) => (
    <HStack ml="10px" mr="35px" justifyContent="space-between">
      <Box mr={5} mt={1}>
        <TipButton author={post.author} permlink={post.permlink} />
      </Box>
      <VotingButton
        comment={post}
        username={username}
        onVoteSuccess={onVoteSuccess}
      />
      <Tooltip
        label={`+$${voteValue.toFixed(6)}`}
        placement="top"
        isOpen={isTooltipOpen}
        hasArrow
      >
        <Text fontWeight="bold" color="green.400" cursor="pointer" mt={2}>
          ${postEarnings.toFixed(2)}
        </Text>
      </Tooltip>
    </HStack>
  )
);

VotingSection.displayName = "VotingSection";

export const PostModal = memo(
  ({ isOpen, onClose, username }: PostModalInterface) => {
    const { post } = usePostContext();
    const { comments, addComment } = useComments(
      post.author,
      post.permlink,
      true
    );
    const [isValueTooltipOpen, setIsValueTooltipOpen] = useState(false);
    const hiveUser = useUserData();
    const voteValue = useVoteValue();

    // Memoize username calculation to prevent recalculation on every render
    const usernameString = useMemo(() => {
      if (username) {
        return typeof username === "string"
          ? username
          : (username as HiveAccount)?.name || "";
      }
      return hiveUser?.name || "";
    }, [username, hiveUser?.name]);

    // Translation state
    const [isTranslated, setIsTranslated] = useState(false);
    const [selectedLanguage, setSelectedLanguage] = useState("english");
    const [translatedPost, setTranslatedPost] = useState("");
    const [translationsCache, setTranslationsCache] = useState<{
      [key: string]: string;
    }>({});
    const [isLoadingTranslation, setIsLoadingTranslation] = useState(false);

    // Memoize post earnings calculation
    const postEarnings = useMemo(
      () => Number(post.getEarnings().toFixed(2)),
      [post]
    );

    // Use useRef for tooltip timeout to avoid stale closures
    const tooltipTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Memoize the debounced translate function
    const translate = useMemo(
      () =>
        debounce(async (language: string) => {
          setIsLoadingTranslation(true);
          try {
            if (translationsCache[language]) {
              setTranslatedPost(translationsCache[language]);
            } else {
              const translated = await getTranslation(post.body, language);
              setTranslatedPost(translated);
              setTranslationsCache((prev) => ({
                ...prev,
                [language]: translated,
              }));
            }
          } catch (error) {
            console.error("Translation error:", error);
          } finally {
            setIsLoadingTranslation(false);
          }
        }, 300),
      [post.body, translationsCache]
    );

    // Memoize handlers to prevent child re-renders
    const handleTranslation = useCallback(
      (language: string) => {
        setSelectedLanguage(language);
        setIsTranslated(true);
        translate(language);
      },
      [translate]
    );

    const toggleValueTooltip = useCallback(() => {
      if (tooltipTimeoutRef.current) {
        clearTimeout(tooltipTimeoutRef.current);
      }

      setIsValueTooltipOpen(true);
      tooltipTimeoutRef.current = setTimeout(() => {
        setIsValueTooltipOpen(false);
      }, 3000);
    }, []);

    const handleCommentPosted = useCallback(() => {
      // The addComment function is already called by the hook internally
      // This is just a callback to notify that a comment was posted
    }, []);

    // Optimize the content to display
    const displayContent = useMemo(
      () => (isTranslated ? translatedPost : post.body),
      [isTranslated, translatedPost, post.body]
    );

    // Only fetch posts when modal opens and post author changes
    useEffect(() => {
      if (!isOpen) return;

      const fetchPosts = async (username: string) => {
        try {
          const query = { tag: username, limit: 3 };
          await HiveClient.database.getDiscussions("blog", query);
        } catch (error) {
          console.error("Error fetching posts:", error);
        }
      };

      fetchPosts(post.author);
    }, [post.author, isOpen]);

    // Cleanup timeout on unmount
    useEffect(() => {
      return () => {
        if (tooltipTimeoutRef.current) {
          clearTimeout(tooltipTimeoutRef.current);
        }
      };
    }, []);

    // Memoize modal size to prevent object recreation
    const modalSize = useMemo(
      () => ({
        base: "lg",
        md: "2xl",
        lg: "6xl",
      }),
      []
    );

    // Memoize flex direction to prevent object recreation
    const flexDirection = useMemo(
      () => ({
        base: "column" as const,
        lg: "row" as const,
      }),
      []
    );

    return (
      <Modal isOpen={isOpen} onClose={onClose} size={modalSize}>
        <ModalOverlay style={{ backdropFilter: "blur(5px)" }} />
        <ModalContent
          color="white"
          bg="black"
          border="1.4px solid #A5D6A7"
          borderRadius={0}
          p={4}
          w="100%"
        >
          <ModalHeader>
            <Header variant="open" />
          </ModalHeader>
          <ModalCloseButton mr={4} mt={2} color="red" />
          <ModalBody display="flex" flexDir={flexDirection} minH="60vh" gap={6}>
            <Box
              bg="black"
              flex={0}
              p={0}
              border="0px solid #A5D6A7"
              borderRadius={0}
              minW="50%"
              key={post.post_id}
            >
              <TranslationMenu
                onTranslate={handleTranslation}
                isLoading={isLoadingTranslation}
              />
              <ContentRenderer
                content={displayContent}
                isLoading={isLoadingTranslation}
              />
            </Box>
            <Box minW="50%">
              <VotingSection
                post={post}
                username={usernameString}
                onVoteSuccess={toggleValueTooltip}
                voteValue={voteValue}
                isTooltipOpen={isValueTooltipOpen}
                postEarnings={postEarnings}
              />
              <Center>
                <Text fontSize="2xl">Comments</Text>
              </Center>
              <CommentsComponent
                author={post.author}
                permlink={post.permlink}
                onCommentPosted={handleCommentPosted}
              />
            </Box>
          </ModalBody>
          <ModalFooter />
        </ModalContent>
      </Modal>
    );
  }
);

PostModal.displayName = "PostModal";
PostModal.displayName = "PostModal";

export default PostModal;
