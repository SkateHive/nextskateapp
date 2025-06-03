"use client";
import React from "react";
import AuthorAvatar from "@/components/AuthorAvatar";
import VotingButton from "@/components/ButtonVoteComponent/VotingButton";
import TipButton from "@/components/PostCard/TipButton";
import MarkdownRenderer from "@/components/ReactMarkdown/page";
import { useUserData, useVoteValue } from "@/contexts/UserContext";
import { useComments } from "@/hooks/comments";
import { changeFollow, checkFollow } from "@/lib/hive/client-functions";
import { changeFollowWithPassword } from "@/lib/hive/server-functions";
import { extractMediaItems, formatDate, getTotalPayout } from "@/lib/utils";
import { processVote, VoteParams } from "@/lib/hive/vote-utils";
import { getDownvoteCount } from "@/lib/voteUtils";
import {
  Box,
  Button,
  Flex,
  HStack,
  Text,
  Tooltip,
  VStack,
} from "@chakra-ui/react";
import { useEffect, useMemo, useState, useCallback } from "react";
import { FaRegComment } from "react-icons/fa";
import { FaPencil } from "react-icons/fa6";
import { RiUserFollowLine } from "react-icons/ri";
import CarrouselRenderer from "../utils/CarrouselRenderer";
import { EditCommentModal } from "./EditCommentModal";
import ReplyModal from "./replyModal";
import ToggleComments from "./ToggleComments";
import { MarkdownRenderers } from "@/app/upload/utils/MarkdownRenderers";

interface CommentItemProps {
  comment: any;
  username: string;
  onClick?: () => void;
  onNewComment?: (comment: any) => void;
}

interface MediaItem {
  type: "image" | "video";
  url: string;
}

const CommentItem = React.memo(
  ({ comment, username, onNewComment }: CommentItemProps) => {
    // Prevent rendering if the comment is not yet available in the RPC
    if (!comment || !comment.id) {
      return null; // Return null to avoid rendering
    }

    // Memoize static values to prevent unnecessary re-calculations
    const loginMethod = useMemo(() => localStorage.getItem("LoginMethod"), []);
    const initialEarnings = useMemo(() => getTotalPayout(comment), [comment]);
    const downvotes = useMemo(
      () => getDownvoteCount(comment.active_votes),
      [comment.active_votes]
    );

    // Single useComments call to avoid duplicate API calls
    const { comments, addComment } = useComments(
      comment.author,
      comment.permlink
    );

    // State declarations
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
    const [isValueTooltipOpen, setIsValueTooltipOpen] = useState(false);
    const [numberOfComments, setNumberOfComments] = useState(0);
    const [editedCommentBody, setEditedCommentBody] = useState(comment.body);
    const [commentReplies, setCommentReplies] = useState<any[]>([]);
    const [visiblePosts, setVisiblePosts] = useState(5);
    const [isEyeClicked, setIsEyeClicked] = useState(false);
    const [isCommentFormVisible, setIsCommentFormVisible] = useState(false);
    const [shouldShowAllComments, setShouldShowAllComments] = useState(false);
    const [isFollowing, setIsFollowing] = useState<boolean | null>(null);
    const [commentEarnings, setCommentEarnings] = useState(initialEarnings);

    // Context hooks
    const hiveUser = useUserData();
    const voteValue = useVoteValue();

    // Consolidated useEffect for comments and follow status
    useEffect(() => {
      // Update comments
      setCommentReplies(comments);
      setNumberOfComments(comments.length);

      // Check follow status only when necessary
      if (username && comment.author !== username && isFollowing === null) {
        checkFollow(username, comment.author)
          .then((result) => setIsFollowing(result))
          .catch((error) => {
            console.error("Failed to check follow status:", error);
            setIsFollowing(false);
          });
      }
    }, [comments, username, comment.author, isFollowing]);

    useEffect(() => {
      if (isCommentFormVisible) {
        setShouldShowAllComments(false);
      }
    }, [isCommentFormVisible]);

    // Memoized callbacks to prevent recreating function references on every render
    const handleNewComment = useCallback(
      (newComment: any) => {
        setCommentReplies((prevComments) => [newComment, ...prevComments]);
        setNumberOfComments((prevCount: number) => prevCount + 1);

        // Optimistically add the comment to the parent list
        if (onNewComment) {
          onNewComment(newComment);
        }

        // Add the comment to the global comments state
        addComment(newComment);
      },
      [onNewComment, addComment]
    );

    const handleEditSave = useCallback(async (editedBody: string) => {
      try {
        setEditedCommentBody(editedBody);
        setIsEditModalOpen(false);
      } catch (error) {
        console.error("Error saving comment edit:", error);
      }
    }, []);

    const toggleCommentVisibility = useCallback(() => {
      setIsCommentFormVisible((prev) => !prev);
    }, []);

    const handleFollow = useCallback(
      async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!username) return;

        if (loginMethod === "keychain") {
          try {
            const result = await changeFollow(username, comment.author);
            setIsFollowing(result === "blog");
          } catch (error) {
            console.error("Failed to change follow:", error);
          }
        } else if (loginMethod === "privateKey") {
          try {
            const encryptedKey = localStorage.getItem("EncPrivateKey");
            if (!encryptedKey) {
              throw new Error("Encrypted private key not found");
            }
            await changeFollowWithPassword(
              encryptedKey,
              username,
              comment.author
            );
            setIsFollowing(true);
          } catch (error) {
            console.error("Failed to change follow with private key:", error);
          }
        }
      },
      [username, comment.author, loginMethod]
    );

    const mediaItems = useMemo(
      () => extractMediaItems(editedCommentBody),
      [editedCommentBody]
    );

    const markdownWithoutMedia = useMemo(() => {
      return editedCommentBody
        .replace(/!\[.*?\]\((.*?)\)/g, "")
        .replace(/<iframe[^>]*>/g, "")
        .replace(/allowFullScreen>/g, "")
        .replace(/allowFullScreen={true}>/g, "");
    }, [editedCommentBody]);

    const handleVoteSuccess = useCallback(
      (voteType: string, actualVoteValue: number) => {
        console.log("CommentItem: handleVoteSuccess triggered:", {
          voteType,
          actualVoteValue,
        });

        setCommentEarnings((prev) => {
          const newEarnings =
            voteType === "upvote"
              ? Math.max(prev + actualVoteValue, 0)
              : voteType === "cancel"
                ? Math.max(prev - actualVoteValue, 0)
                : prev;

          console.log("CommentItem: Updating commentEarnings:", {
            prev,
            newEarnings,
          });
          return newEarnings;
        });
      },
      []
    );

    // Memoized adapter function for ToggleComments
    const handleVoteForToggleComments = useCallback(
      async (params: VoteParams | { author: string; permlink: string }) => {
        if ("author" in params && "permlink" in params) {
          // Handle legacy signature
          return processVote({
            username,
            author: params.author,
            permlink: params.permlink,
            weight: 10000,
            userAccount: hiveUser,
          });
        } else {
          // Handle VoteParams - ensure userAccount is included
          const voteParams: VoteParams = {
            ...(params as VoteParams),
            userAccount: hiveUser,
          };
          return processVote(voteParams);
        }
      },
      [username, hiveUser]
    );

    // Memoize callbacks to prevent recreating function references on every render
    const handleReplyModalClose = useCallback(() => {
      setIsReplyModalOpen(false);
    }, []);

    const handleNewCommentCallback = useCallback((newComment: any) => {
      setCommentReplies((prevComments) => [newComment, ...prevComments]);
      setNumberOfComments((prevCount: number) => prevCount + 1);
    }, []);

    // Memoized click handlers to prevent inline function creation
    const handleEditClick = useCallback((e: React.MouseEvent) => {
      e.stopPropagation();
      setIsEditModalOpen(true);
    }, []);

    const handleReplyClick = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        console.log("Opening ReplyModal with content:", editedCommentBody);
        setIsReplyModalOpen(true);
      },
      [editedCommentBody]
    );

    const handleCommentToggleClick = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        toggleCommentVisibility();
      },
      [toggleCommentVisibility]
    );

    const handleEditModalClose = useCallback(() => {
      setIsEditModalOpen(false);
    }, []);

    const handleVoteSuccessCallback = useCallback(
      (voteType: string, actualVoteValue: number) => {
        console.log("CommentItem: VotingButton onVoteSuccess called:", {
          voteType,
          actualVoteValue,
        });
        handleVoteSuccess(voteType, actualVoteValue); // Only update earnings here
      },
      [handleVoteSuccess]
    );

    return (
      <Box key={comment.id} bg="black" color="white">
        {isReplyModalOpen && (
          <ReplyModal
            comment={comment}
            isOpen={isReplyModalOpen}
            onClose={handleReplyModalClose}
            onNewComment={handleNewCommentCallback}
            mediaItems={mediaItems}
          />
        )}
        <Flex onClick={toggleCommentVisibility} cursor="pointer">
          <Box p={2} pl={4}>
            <AuthorAvatar username={comment.author} />
          </Box>
          <VStack w={"100%"} ml={4} alignItems={"start"} marginRight={"16px"}>
            <HStack
              justify={"space-between"}
              width={"full"}
              cursor="pointer"
              gap="2px"
            >
              <HStack mt={2}>
                <Text fontWeight="bold">{comment.author}</Text>
                {/* Follow Button */}
                {username &&
                  comment.author !== username &&
                  isFollowing === false && (
                    <Button
                      id="follow"
                      height={6}
                      variant="outline"
                      size="sm"
                      colorScheme="green"
                      onClick={handleFollow}
                    >
                      <RiUserFollowLine />
                    </Button>
                  )}
              </HStack>
              <Text ml={2} color="gray.400" fontSize="14px">
                {formatDate(String(comment.created))}
              </Text>
            </HStack>
            <Box w="100%">
              <MarkdownRenderer
                content={markdownWithoutMedia}
                renderers={MarkdownRenderers}
                useDecryptedText
              />
            </Box>
          </VStack>
        </Flex>

        <Box w="100%" mt={4}>
          <CarrouselRenderer
            mediaItems={mediaItems}
            onImageClick={toggleCommentVisibility}
            onCommentIconClick={toggleCommentVisibility}
          />
        </Box>

        <Flex m={4} justifyContent={"space-between"}>
          {comment.author === username ? (
            <Button
              _hover={{
                background: "transparent",
                color: "green.200",
              }}
              color="#A5D6A7"
              variant="ghost"
              leftIcon={<FaPencil />}
              onClick={handleEditClick}
              aria-label="Edit Comment"
            >
              Edit
            </Button>
          ) : (
            <TipButton author={comment.author} permlink={comment.permlink} />
          )}
          <HStack spacing={4} cursor="pointer" color="#A5D6A7">
            <Box
              as="button"
              onClick={handleReplyClick}
              _hover={{
                background: "transparent",
                color: "green.200",
              }}
              color="limegreen"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <FaRegComment color="#A5D6A7" />
            </Box>
            <Box
              as="button"
              onClick={handleCommentToggleClick}
              _hover={{
                background: "transparent",
                color: "green.200",
              }}
              display="flex"
              alignItems="center"
              justifyContent="center"
              ml={-2}
              color="#A5D6A7"
              fontSize={"18px"}
            >
              {numberOfComments}
            </Box>
          </HStack>

          <VotingButton
            comment={comment}
            username={username}
            onVoteSuccess={handleVoteSuccessCallback}
          />

          <Tooltip
            label={`+$${voteValue.toFixed(6)}`}
            placement="top"
            isOpen={isValueTooltipOpen}
            hasArrow
          >
            <Text fontWeight={"bold"} cursor={"pointer"} mt={2} color="#A5D6A7">
              ${commentEarnings.toFixed(3)}
            </Text>
          </Tooltip>
        </Flex>

        <EditCommentModal
          isOpen={isEditModalOpen}
          onClose={handleEditModalClose}
          commentBody={editedCommentBody}
          onSave={handleEditSave}
          post={comment}
          username={username}
        />

        <ToggleComments
          isEyeClicked={isEyeClicked}
          commentReplies={commentReplies}
          visiblePosts={visiblePosts}
          setVisiblePosts={setVisiblePosts}
          username={username}
          handleVote={handleVoteForToggleComments}
          shouldShowAllComments={shouldShowAllComments}
          isCommentFormVisible={isCommentFormVisible}
        />
      </Box>
    );
  },
  // Custom comparison function to prevent unnecessary re-renders
  (prevProps, nextProps) => {
    // Only re-render if comment content, username, or callback reference changes
    return (
      prevProps.comment?.id === nextProps.comment?.id &&
      prevProps.comment?.body === nextProps.comment?.body &&
      prevProps.comment?.active_votes?.length ===
        nextProps.comment?.active_votes?.length &&
      prevProps.username === nextProps.username &&
      prevProps.onNewComment === nextProps.onNewComment
    );
  }
);

export default CommentItem;
