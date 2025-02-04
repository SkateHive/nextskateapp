"use client";
import AuthorAvatar from "@/components/AuthorAvatar";
import VotingButton from "@/components/ButtonVoteComponent/VotingButton";
import TipButton from "@/components/PostCard/TipButton";
import { useHiveUser } from "@/contexts/UserContext";
import { useComments } from "@/hooks/comments";
import { formatDate, getTotalPayout, extractMediaItems } from "@/lib/utils";
import {
  Box,
  Button,
  Flex,
  HStack,
  Text,
  Tooltip,
  VStack,
} from "@chakra-ui/react";
import { useEffect, useState, useMemo } from "react";
import { FaRegComment } from "react-icons/fa";
import { FaPencil } from "react-icons/fa6";
import CarrouselRenderer from "../utils/CarrouselRenderer";
import { EditCommentModal } from "./EditCommentModal";
import ReplyModal from "./replyModal";
import ToggleComments from "./ToggleComments";
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { MarkdownRenderers } from '@/app/upload/utils/MarkdownRenderers';
import {
  autoEmbedZoraLink,
  transformNormalYoutubeLinksinIframes,
  transformShortYoutubeLinksinIframes
} from '@/lib/utils';
import { RiUserFollowLine } from "react-icons/ri";
import { checkFollow, changeFollow } from "@/lib/hive/client-functions";
import { changeFollowWithPassword } from "@/lib/hive/server-functions";

interface CommentItemProps {
  comment: any;
  username: string;
  handleVote: (author: string, permlink: string) => void;
  onClick?: () => void;
  onNewComment?: (comment: any) => void;
  onClose?: () => void;
}

interface MediaItem {
  type: 'image' | 'video';
  url: string;
}

const CommentItem = ({
  comment,
  username,
  handleVote,
  onNewComment,
  onClose = () => { },
}: CommentItemProps) => {
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
  const { comments } = useComments(comment.author, comment.permlink);
  const { voteValue } = useHiveUser();
  const [isFollowing, setIsFollowing] = useState<boolean | null>(null);
  const loginMethod = localStorage.getItem("LoginMethod");

  const toggleValueTooltip = () => {
    setIsValueTooltipOpen(true);
    setTimeout(() => {
      setIsValueTooltipOpen(false);
    }, 3000);
  };

  useEffect(() => {
    setCommentReplies(comments);
    setNumberOfComments(comments.length);
  }, [comments]);

  useEffect(() => {
    if (isCommentFormVisible) {
      setShouldShowAllComments(false);
    }
  }, [isCommentFormVisible]);

  useEffect(() => {
    if (username && comment.author !== username) {
      checkFollow(username, comment.author)
        .then(result => setIsFollowing(result))
        .catch(error => {
          console.error("Failed to check follow status:", error);
          setIsFollowing(false);
        });
    }
  }, [username, comment.author]);

  const handleNewComment = (newComment: any) => {
    setCommentReplies((prevComments) => [newComment, ...prevComments]);
    setNumberOfComments((prevCount: number) => prevCount + 1);
  };

  const handleEditSave = async (editedBody: string) => {
    try {
      setEditedCommentBody(editedBody);
      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Error saving comment edit:", error);
    }
  };

  const CommentVisibility = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(`/post/test/@${comment.author}/${comment.permlink}`, "_self");
  };

  const toggleCommentVisibility = () => {
    setIsCommentFormVisible((prev) => !prev);
  }

  const handleFollow = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!username) return;
    if (loginMethod === "keychain") {
      try {
        const result = await changeFollow(username, comment.author);
        setIsFollowing(result === 'blog');
      } catch (error) {
        console.error("Failed to change follow:", error);
      }
    } else if (loginMethod === "privateKey") {
      try {
        const encryptedKey = localStorage.getItem("EncPrivateKey");
        if (!encryptedKey) {
          throw new Error("Encrypted private key not found");
        }
        await changeFollowWithPassword(encryptedKey, username, comment.author);
        setIsFollowing(true); // update state on successful follow
      } catch (error) {
        console.error("Failed to change follow with private key:", error);
      }
    }
  };

  const mediaItems = useMemo(() => extractMediaItems(editedCommentBody), [editedCommentBody]);

  const markdownWithoutMedia = useMemo(() => {
    return editedCommentBody
      .replace(/!\[.*?\]\((.*?)\)/g, '')
      .replace(/<iframe[^>]*>/g, '')
      .replace(/allowFullScreen>/g, '')
      .replace(/allowFullScreen={true}>/g, '');
  }, [editedCommentBody]);

  return (
    <Box key={comment.id} bg="black" color="white">
      {isReplyModalOpen && (
        <ReplyModal
          comment={comment}
          isOpen={isReplyModalOpen}
          onClose={() => setIsReplyModalOpen(false)}
          onNewComment={handleNewComment}
          content={editedCommentBody}
        />
      )}
      <Flex onClick={toggleCommentVisibility} cursor="pointer">
        <Box p={2} pl={4}>
          <AuthorAvatar username={comment.author} />
        </Box>
        <VStack w={"100%"} ml={4} alignItems={"start"} marginRight={"16px"}>
          <HStack justify={"space-between"} width={"full"} cursor="pointer" gap="2px" >
            <HStack mt={2}>
              <Text fontWeight="bold">{comment.author}</Text>
              {username && comment.author !== username && isFollowing === false && (
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
            <ReactMarkdown components={MarkdownRenderers} rehypePlugins={[rehypeRaw]} remarkPlugins={[remarkGfm]}>
              {autoEmbedZoraLink(
                transformNormalYoutubeLinksinIframes(
                  (transformShortYoutubeLinksinIframes(markdownWithoutMedia))
                )
              )}
            </ReactMarkdown>
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
            onClick={(e) => {
              e.stopPropagation();
              setIsEditModalOpen(true);
            }}
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
            onClick={(e: any) => {
              e.stopPropagation();
              console.log("Opening ReplyModal with content:", editedCommentBody);
              setIsReplyModalOpen(true);
            }}
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
            onClick={(e: any) => {
              e.stopPropagation();
              toggleCommentVisibility();
            }}
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
          toggleValueTooltipButton={toggleValueTooltip}
        />

        <Tooltip
          label={`+$${voteValue.toFixed(6)}`}
          placement="top"
          isOpen={isValueTooltipOpen}
          hasArrow
        >
          <Text
            fontWeight={"bold"}
            onClick={CommentVisibility}
            cursor={"pointer"}
            mt={2}
            color="#A5D6A7"

          >
            ${getTotalPayout(comment)}
          </Text>
        </Tooltip>
      </Flex>

      <EditCommentModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
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
        handleVote={handleVote}
        shouldShowAllComments={shouldShowAllComments}
        isCommentFormVisible={isCommentFormVisible}
      />
    </Box>
  );
};

export default CommentItem;
