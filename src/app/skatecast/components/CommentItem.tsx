"use client";
import { MarkdownRenderers } from "@/app/upload/utils/MarkdownRenderers";
import AuthorAvatar from "@/components/AuthorAvatar";
import LoginModal from "@/components/Hive/Login/LoginModal";
import TipButton from "@/components/PostCard/TipButton";
import {
  formatDate,
  transformIPFSContent,
  transformShortYoutubeLinksinIframes,
} from "@/lib/utils";
import {
  Box,
  Button,
  Divider,
  Flex,
  HStack,
  Text,
  VStack
} from "@chakra-ui/react";
import { useState } from "react";
import {
  FaHeart,
  FaRegComment,
  FaRegHeart
} from "react-icons/fa";
import ReactMarkdown from "react-markdown";
import { useReward } from "react-rewards";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import { handleVote } from "../utils/handleFeedVote";
import ReplyModal from "./replyModal";

interface CommentItemProps {
  comment: any;
  username: string;
  handleVote: (author: string, permlink: string) => void;
  getTotalPayout: (comment: any) => number;
}

const VotingButton = ({
  comment,
  username,
}: {
  comment: any;
  username: any;
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

const CommentItem = ({
  comment,
  username,
  handleVote,
  getTotalPayout,
}: CommentItemProps) => {
  const rewardId = comment.id ? "postReward" + comment.id : "";
  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  return (

    <Box key={comment.id} p={4} width="100%" bg="black" color="white">
      <ReplyModal
        comment={comment}
        isOpen={isModalOpen}
        onClose={handleModal}
      />

      <Flex>
        <AuthorAvatar username={comment.author} />
        <VStack ml={4} gap={0} alignItems={"start"}>
          <HStack gap={"2px"}>
            <Text fontWeight="bold">{comment.author}</Text>
            <Text ml={2} color="gray.400" fontSize={"14px"}>
              · {formatDate(String(comment.created))}
            </Text>
          </HStack>
          <Text onClick={() => window.open(`/post/test/@${comment.author}/${comment.permlink}`, "_self")} fontWeight={"bold"} color={"green.400"}>${getTotalPayout(comment)}</Text>
        </VStack>
      </Flex>

      <Box cursor={"pointer"} ml={"64px"} mt={4} onClick={() => window.open(`/post/test/@${comment.author}/${comment.permlink}`, "_self")}>
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
      <Flex ml={14} justifyContent={"space-between"} mt={4}>
        <TipButton author={comment.author} />

        <Button
          colorScheme="green"
          variant="ghost"
          leftIcon={<FaRegComment />}
          // onClick={() => handleCommentIconClick(comment)}
          onClick={handleModal}
        >
          {comment.children}
        </Button>
        <VotingButton comment={comment} username={username} />
      </Flex>
      <Divider mt={4} />
    </Box>

  );
};

export default CommentItem;
