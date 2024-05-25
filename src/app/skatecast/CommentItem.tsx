"use client"
import {
  Avatar,
  Box,
  Button,
  Flex,
  HStack,
  Text,
  Badge,
  Divider,
} from "@chakra-ui/react"
import { FaRegComment, FaRegHeart, FaDollarSign } from "react-icons/fa"
import ReactMarkdown from "react-markdown"
import rehypeRaw from "rehype-raw"
import remarkGfm from "remark-gfm"
import { MarkdownRenderers } from "@/app/upload/utils/MarkdownRenderers"
import TipButton from "@/components/PostCard/TipButton"
import { transformIPFSContent, transformShortYoutubeLinksinIframes, formatDate } from "@/lib/utils"
import { useState } from "react"
import { useReward } from "react-rewards"
import { FaHeart } from "react-icons/fa"
import { handleVote } from "./utils/handleFeedVote"
import AuthorAvatar from "@/components/AuthorAvatar"
interface CommentItemProps {
  comment: any
  username: string
  handleCommentIconClick: (comment: any) => void
  handleVote: (author: string, permlink: string) => void
  getTotalPayout: (comment: any) => number
}

const VotingButton = ({ comment, username }: { comment: any, username: any }) => {
  const initialIsVoted = comment.active_votes?.some((vote: any) => vote.voter === username);
  const [isVoted, setIsVoted] = useState(initialIsVoted);
  const [voteCount, setVoteCount] = useState(comment.active_votes?.length || 0);
  const rewardId = `reward-${comment.id}`;
  const { reward } = useReward(rewardId, "emoji", {
    emoji: ["$", "*", "#"],
    spread: 60,
  });

  const handleVoteClick = async () => {
    const newIsVoted = !isVoted;
    await handleVote(comment.author, comment.permlink, username ?? "");
    setIsVoted(newIsVoted);

    setVoteCount((prevVoteCount: number) => newIsVoted ? prevVoteCount + 1 : prevVoteCount - 1);

    if (newIsVoted) {
      reward();
    }

  };

  return (
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
  );
};


const CommentItem = ({
  comment,
  username,
  handleCommentIconClick,
  handleVote,
  getTotalPayout,
}: CommentItemProps) => {
  const rewardId = comment.id ? "postReward" + comment.id : ""
  console.log(comment.author, typeof comment.author)
  return (
    <Box key={comment.id} p={4} width="100%" bg="black" color="white">
      <Flex>
        <AuthorAvatar username={comment.author} />
        <HStack ml={4}>
          <Text fontWeight="bold">{comment.author}</Text>
          <Text ml={2} color="gray.400">
            {formatDate(String(comment.created))}
          </Text>
          <Badge
            variant="ghost"
            color={"green.400"}
          >
            <HStack>
              <FaDollarSign />
              <Text>
                {getTotalPayout(comment)} USD
              </Text>
            </HStack>
          </Badge>
        </HStack>
      </Flex>
      <Box ml={"64px"} mt={4}>
        <ReactMarkdown
          components={MarkdownRenderers}
          rehypePlugins={[rehypeRaw]}
          remarkPlugins={[remarkGfm]}
        >
          {transformIPFSContent(
            transformShortYoutubeLinksinIframes(comment.body)
          )}
        </ReactMarkdown>
      </Box>
      <Flex ml={12} justifyContent={"space-between"} mt={4}>
        <Button
          colorScheme="green"
          variant="ghost"
          leftIcon={<FaRegComment />}
          onClick={() => handleCommentIconClick(comment)}
        >
          {comment.children}
        </Button>
        <VotingButton comment={comment} username={username} />

        <TipButton author={comment.author} />
      </Flex>
      <Divider mt={4} />
    </Box>
  )
}

export default CommentItem
