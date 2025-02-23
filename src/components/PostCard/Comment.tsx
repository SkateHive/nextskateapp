"use client"
import { handleVote } from "@/app/mainFeed/utils/handleFeedVote"
import CommentsSection from "@/components/PostModal/commentSection"
import { useHiveUser } from "@/contexts/UserContext"
import useHiveAccount from "@/hooks/useHiveAccount"
import { Flex, Text } from "@chakra-ui/react"
import moment from "moment-timezone"
import { useEffect, useState } from "react"
import { FaFire } from "react-icons/fa"
import CommandPrompt from "../PostModal/commentPrompt"
import MarkdownRenderer from "../ReactMarkdown/page"
import UserAvatar from "../UserAvatar"
import { voting_value } from "./calculateHiveVotingValue"
import { Discussion } from "@hiveio/dhive"


export default function PostComment({ comment }: { comment: Discussion }) {
  const { hiveAccount, isLoading } = useHiveAccount(comment.author)
  const user = useHiveUser()
  const [hasVoted, setHasVoted] = useState(false)
  const [replies, setReplies] = useState<Discussion[] | undefined>(comment.replies as unknown as Discussion[] | undefined)
  const [isVoting, setIsVoting] = useState(false)

  const calculateTotalPayout = (comment: Discussion) => {
    return (
      Number(typeof comment.pending_payout_value === 'string' ? comment.pending_payout_value.split(" ")[0] : 0) +
      Number(typeof comment.total_payout_value === 'string' ? comment.total_payout_value.split(" ")[0] : 0) +
      Number(typeof comment.curator_payout_value === 'string' ? comment.curator_payout_value.split(" ")[0] : 0)
    )
  }
  const [newTotalPayout, setNewTotalPayout] = useState(
    calculateTotalPayout(comment)
  )
  const [commentsOpen, setCommentsOpen] = useState(false)

  const handleVoteClick = async () => {
    try {
      if (!user.hiveUser?.name) {
        console.error("User is not logged in");
        return;
      }

      const updateVotes = () => {
        setHasVoted(true);
      };

      setIsVoting(true);

      console.log(user.hiveUser?.name, comment.permlink, comment.author);
      await handleVote(
        comment.author,
        comment.permlink,
        String(user.hiveUser?.name),
        10000,
        updateVotes,
        setIsVoting
      );

      const newPayout = await voting_value(user);
      setNewTotalPayout(calculateTotalPayout(comment) + newPayout);
      setIsVoting(false);
    } catch (error) {
      console.error("Error registering vote:", error);
      setIsVoting(false);
    }
  };

  useEffect(() => {
    setHasVoted(
      comment?.active_votes?.some(
        (vote) => vote.voter === user.hiveUser?.name
      ) ?? false
    )
  }, [comment, user.hiveUser?.name])

  if (isLoading || !hiveAccount) return <div>Loading...</div>
  return (
    <Flex gap={2} direction={"column"}>
      <Flex gap={1} alignItems="center" border={"1px solid grey"} mb={-2}>
        <UserAvatar hiveAccount={hiveAccount} borderRadius={5} boxSize={12} />
        <Text fontSize="14px" as="b">
          {comment.author}
        </Text>
        <Text fontSize="14px" color="darkgray">
          ·
        </Text>
        <Text fontSize="12px" color="darkgray" fontWeight="300">
          {moment.utc(comment.last_update).fromNow()}
        </Text>
      </Flex>
      <Flex direction={"column"} border={"1px solid grey"} p={5} bg={"#201d21"}>
        <MarkdownRenderer content={comment.body} />
        <br />
        <Flex justifyContent="flex-end">
          {" "}

          <Text
            fontSize="12px"
            color="darkgray"
            fontWeight="300"
            onClick={() => setCommentsOpen((comment) => !comment)}
          >
            Reply
          </Text>
          <Flex ml={2}>
            <FaFire
              cursor={"pointer"}
              onClick={handleVoteClick}
              color={hasVoted ? "#A5D6A7" : "grey"}
            />
            <Text fontSize="12px" color="darkgray" fontWeight="300">
              {newTotalPayout.toFixed(2)}
            </Text>
          </Flex>
        </Flex>
        {commentsOpen ? (
          <CommandPrompt
            addComment={(comment: Discussion) => {
              setReplies((replies) => replies ? [...replies, comment] : replies)
              setCommentsOpen(false)
            }}
            onNewComment={() => { }}
            onClose={() => { }}
            author={comment.author}
            permlink={comment.permlink}
          />

        ) : null}
      </Flex>
      <CommentsSection comments={replies} isCommentReply={true} />
    </Flex>
  )
}
