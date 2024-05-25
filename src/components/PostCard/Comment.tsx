"use client"
import { MarkdownRenderers } from "@/app/upload/utils/MarkdownRenderers"
import CommentsSection from "@/components/PostModal/commentSection"
import { usePostContext } from "@/contexts/PostContext"
import { useHiveUser } from "@/contexts/UserContext"
import { Comment, useComments } from "@/hooks/comments"
import useHiveAccount from "@/hooks/useHiveAccount"
import { Flex, Text } from "@chakra-ui/react"
import moment from "moment-timezone"
import { useEffect, useState } from "react"
import { FaFire } from "react-icons/fa"
import ReactMarkdown from "react-markdown"
import rehypeRaw from "rehype-raw"
import remarkGfm from "remark-gfm"
import CommandPrompt from "../PostModal/commentPrompt"
import UserAvatar from "../UserAvatar"
import { voting_value } from "./calculateHiveVotingValue"
import { handleVote } from "@/app/skatecast/utils/handleFeedVote"

interface PostCommentProps {
  comment: Comment
}

export default function PostComment({ comment }: PostCommentProps) {
  const { hiveAccount, isLoading } = useHiveAccount(comment.author)
  const { addComment } = useComments(comment.author, comment.permlink, true)
  const user = useHiveUser()
  const [hasVoted, setHasVoted] = useState(false)
  const [replies, setReplies] = useState<Comment[] | undefined>(comment.replies)
  const { post } = usePostContext()

  const calculateTotalPayout = (comment: Comment) => {
    return (
      Number(comment.pending_payout_value?.split(" ")[0]) +
      Number(comment.total_payout_value?.split(" ")[0]) +
      Number(comment.curator_payout_value?.split(" ")[0])
    )
  }
  const [newTotalPayout, setNewTotalPayout] = useState(
    calculateTotalPayout(comment)
  )
  const [commentsOpen, setCommentsOpen] = useState(false)

  const handleVoteClick = async () => {

    try {
      console.log(user.hiveUser?.name, comment.permlink, comment.author)
      await handleVote(
        comment.author,
        comment.permlink,
        String(user.hiveUser?.name),
      )
      setHasVoted(true)
      const newPayout = await voting_value(user)
      setNewTotalPayout(calculateTotalPayout(comment) + newPayout)
    } catch (error) {
      console.error(error)
    }
  }
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
        <UserAvatar hiveAccount={hiveAccount} />
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
        <ReactMarkdown
          components={MarkdownRenderers}
          rehypePlugins={[rehypeRaw]}
          remarkPlugins={[remarkGfm]}
        >
          {comment.body}
        </ReactMarkdown>
        <br />
        <Flex justifyContent="flex-end">
          {" "}
          {/* Adjust this Flex component */}
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
              color={hasVoted ? "limegreen" : "grey"}
            />
            <Text fontSize="12px" color="darkgray" fontWeight="300">
              {newTotalPayout.toFixed(2)}
            </Text>
          </Flex>
        </Flex>
        {commentsOpen ? (
          <CommandPrompt
            post={comment}
            addComment={(comment: Comment) => {
              setReplies((replies) =>
                replies ? [...replies, comment] : replies
              )
              setCommentsOpen(false)
            }}
          />
        ) : null}
      </Flex>
      <CommentsSection comments={replies} isCommentReply={true} />
    </Flex>
  )
}
