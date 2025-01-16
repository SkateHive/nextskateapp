"use client";
import AuthorAvatar from "@/components/AuthorAvatar";
import VotingButton from "@/components/ButtonVoteComponent/VotingButton";
import TipButton from "@/components/PostCard/TipButton";
import { useHiveUser } from "@/contexts/UserContext";
import { useComments } from "@/hooks/comments";
import { formatDate, getTotalPayout } from "@/lib/utils";
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
  transformIPFSContent,
  transformNormalYoutubeLinksinIframes,
  transformShortYoutubeLinksinIframes
} from '@/lib/utils';

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

  const extractMediaItems = (markdown: string): MediaItem[] => {
    const imageRegex = /!\[.*?\]\((.*?)\)/g;
    const iframeRegex = /<iframe[^>]+src="([^"]+)"[^>]*>/g;
    const mediaItems: MediaItem[] = [];

    let match;
    while ((match = imageRegex.exec(markdown))) {
      mediaItems.push({ type: 'image', url: match[1] });
    }
    while ((match = iframeRegex.exec(markdown))) {
      mediaItems.push({ type: 'video', url: match[1] });
    }
    return mediaItems;
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
        />
      )}
      <Flex onClick={toggleCommentVisibility} cursor="pointer">
        <Box p={4}>
          <AuthorAvatar username={comment.author} />
        </Box>
        <VStack w={"100%"} ml={4} alignItems={"start"} marginRight={"16px"}>
          <HStack justify={"space-between"} width={"full"} cursor="pointer" gap="2px" >
            <Text fontWeight="bold">{comment.author}</Text>
            <Text ml={2} color="gray.400" fontSize="14px">
              {formatDate(String(comment.created))}
            </Text>
          </HStack>
          <Box w="100%">
            <ReactMarkdown components={MarkdownRenderers} rehypePlugins={[rehypeRaw]} remarkPlugins={[remarkGfm]}>
              {autoEmbedZoraLink(
                transformNormalYoutubeLinksinIframes(
                  transformIPFSContent(transformShortYoutubeLinksinIframes(markdownWithoutMedia))
                )
              )}
            </ReactMarkdown>
          </Box>
        </VStack>
      </Flex>

      <Box w="100%" mt={4}>
        <CarrouselRenderer mediaItems={mediaItems} />
      </Box>

      <Flex m={4} justifyContent={"space-between"}>
        {comment.author === username ? (
          <Button
            _hover={{
              background: "transparent",
              color: "green.200",
            }}
            color="limegreen"
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
        <Button
          _hover={{
            background: "transparent",
            color: "green.200",
          }}
          color="limegreen"
          variant="ghost"
          leftIcon={<FaRegComment />}
          onClick={(e) => {
            e.stopPropagation();
            setIsReplyModalOpen(true);
          }}
          aria-label="Comments"
        >
          {numberOfComments}
        </Button>
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
            color="limegreen"
            onClick={CommentVisibility}
            cursor={"pointer"}
            mt={2}
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
