"use client";
import { MarkdownRenderers } from "@/app/upload/utils/MarkdownRenderers";
import AuthorAvatar from "@/components/AuthorAvatar";
import LoginModal from "@/components/Hive/Login/LoginModal";
import TipButton from "@/components/PostCard/TipButton";
import { useHiveUser } from "@/contexts/UserContext";
import { useComments } from "@/hooks/comments";
import {
  formatDate,
  getTotalPayout,
  transformIPFSContent,
  transformShortYoutubeLinksinIframes,
} from "@/lib/utils";
import {
  Box,
  Button,
  Flex,
  HStack,
  Text,
  Tooltip,
  VStack
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { FaEye, FaHeart, FaRegComment, FaRegHeart } from "react-icons/fa";
import { FaPencil } from "react-icons/fa6";
import ReactMarkdown from "react-markdown";
import { useReward } from "react-rewards";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import { handleVote } from "../utils/handleFeedVote";
import CommentList from "./CommentsList";
import ReplyModal from "./replyModal";

interface CommentItemProps {
  comment: any;
  username: string;
  handleVote: (author: string, permlink: string) => void;
}

const VotingButton = ({
  comment,
  username,
  toggleValueTooltip,
}: {
  comment: any;
  username: any;
  toggleValueTooltip: () => void;
}) => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const initialIsVoted = comment.active_votes?.some(
    (vote: any) => vote.voter === username,
  );
  const [isVoted, setIsVoted] = useState(initialIsVoted);
  const [voteCount, setVoteCount] = useState(comment.active_votes?.length || 0);
  const rewardId = `reward-${comment.id}`;
  const { reward } = useReward(rewardId, "emoji", {
    emoji: ["$", "*", "#"],
    spread: 60,
  });

  const handleVoteClick = async () => {
    if (username === "") {
      setIsLoginModalOpen(true);
      return;
    } else {
      const newIsVoted = !isVoted;
      await handleVote(comment.author, comment.permlink, username ?? "");
      setIsVoted(newIsVoted);
      toggleValueTooltip();
      setVoteCount((prevVoteCount: number) =>
        newIsVoted ? prevVoteCount + 1 : prevVoteCount - 1,
      );

      if (newIsVoted) {
        reward();
      }
    }
  };

  return (
    <>
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
      <Button
        onClick={handleVoteClick}
        colorScheme="green"
        variant="ghost"
        leftIcon={isVoted ? <FaHeart /> : <FaRegHeart />}
      >
        <span
          id={rewardId}
          style={{
            position: "absolute",
            left: "50%",
            bottom: "15px",
            transform: "translateX(-50%)",
            zIndex: 5,
          }}
        />
        {voteCount}
      </Button>
    </>
  );
};

const CommentItem = ({ comment, username, handleVote }: CommentItemProps) => {
  const rewardId = comment.id ? "postReward" + comment.id : "";
  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  const [isValueTooltipOpen, setIsValueTooltipOpen] = useState(false);
  const toggleValueTooltip = () => {
    setIsValueTooltipOpen(true);
    setTimeout(() => {
      setIsValueTooltipOpen(false);
    }, 3000);
  };

  const commentReplies = useComments(comment.author, comment.permlink);
  const comments_count = commentReplies.comments.length;
  const [numberOfComments, setNumberOfComments] = useState(0);

  useEffect(() => {
    setNumberOfComments(comments_count);
  }, [numberOfComments, comments_count]);

  const [isEyeClicked, setIsEyeClicked] = useState(false);
  const handleEyeClick = () => {
    setIsEyeClicked(!isEyeClicked);
  };

  const [visiblePosts, setVisiblePosts] = useState(5);

  const { voteValue } = useHiveUser();

  return (
    <Box key={comment.id} p={4} width="100%" bg="black" color="white">
      <ReplyModal
        comment={comment}
        isOpen={isModalOpen}
        onClose={handleModal}
      />

      <Flex>
        <AuthorAvatar username={comment.author} />
        <VStack w={"100%"} ml={4} alignItems={"start"} marginRight={"16px"}>
          <HStack justify={"space-between"} width={"full"}>
            <HStack
              cursor={"pointer"}
              onClick={() =>
                window.open(
                  `/post/test/@${comment.author}/${comment.permlink}`,
                  "_self",
                )
              }
              gap={"2px"}
            >
              <Text fontWeight="bold">{comment.author}</Text>
              <Text ml={2} color="gray.400" fontSize={"14px"}>
                · {formatDate(String(comment.created))}
              </Text>
            </HStack>

            <FaEye onClick={handleEyeClick} />
          </HStack>
          {/* Post Content */}
          <Box w={"100%"} bg="black" color="white">
            <ReactMarkdown
              components={MarkdownRenderers}
              rehypePlugins={[rehypeRaw]}
              remarkPlugins={[remarkGfm]}
            >
              {transformIPFSContent(
                transformShortYoutubeLinksinIframes(comment.body),
              )}
            </ReactMarkdown>
          </Box>
        </VStack>
      </Flex>

      {/* Buttons */}
      <Flex ml={14} justifyContent={"space-between"}>
        {comment.author === username ? (
          <Button
            _hover={{
              background: "transparent",
              color: "green.200",
            }}
            colorScheme="green"
            variant="ghost"
            leftIcon={<FaPencil />}
            onClick={() => window.alert('soon')}
            aria-label="Comments"
          >
          </Button>
        ) : (
          <TipButton author={comment.author} />
        )}
        <Button
          _hover={{
            background: "transparent",
            color: "green.200",
          }}
          colorScheme="green"
          variant="ghost"
          leftIcon={<FaRegComment />}
          onClick={handleModal}
          aria-label="Comments"
        >
          {numberOfComments}
        </Button>

        <VotingButton
          comment={comment}
          username={username}
          toggleValueTooltip={toggleValueTooltip}
        />
        <Tooltip
          label={`+$${voteValue.toFixed(6)}`}
          placement="top"
          isOpen={isValueTooltipOpen}
          hasArrow
        >
          <Text
            fontWeight={"bold"}
            color={"green.400"}
            onClick={() =>
              window.open(
                `/post/test/@${comment.author}/${comment.permlink}`,
                "_self",
              )
            }
            cursor={"pointer"}
            mt={2}
          >
            ${getTotalPayout(comment)}
          </Text>
        </Tooltip>
      </Flex>
      {isEyeClicked && (
        <Box ml={10} mt={4} pl={4} borderLeft="2px solid gray">
          <CommentList
            comments={commentReplies.comments}
            visiblePosts={visiblePosts}
            setVisiblePosts={() => { }}
            username={username}
            handleVote={handleVote}
          />
          {visiblePosts < numberOfComments && (
            <Button
              onClick={() => setVisiblePosts(visiblePosts + 5)}
              variant="outline"
              colorScheme="green"
              size="sm"
              mt={4}
            >
              Show More
            </Button>
          )}
        </Box>
      )}
    </Box>
  );
};

export default CommentItem;
