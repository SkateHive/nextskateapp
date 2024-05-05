'use client'
import { Flex, Text, Divider, HStack } from "@chakra-ui/react"
import moment from "moment-timezone"
import Markdown from "../Markdown"
import UserAvatar from "../UserAvatar"
import { Comment } from '@/hooks/comments';
import CommentsSection from "@/components/PostModal/commentSection"
import useHiveAccount from "@/hooks/useHiveAccount";
import { FaFire } from "react-icons/fa";
import { useHiveUser } from "@/contexts/UserContext";
import voteOnContent from "@/app/plaza/voting";
import React, { useState, useEffect } from 'react';
import { voting_value } from "./calculateHiveVotingValue"


interface PostCommentProps {
  comment: Comment
}

export default function PostComment({ comment }: PostCommentProps) {

  const { hiveAccount, isLoading } = useHiveAccount(comment.author)
  const user = useHiveUser()
  const [hasVoted, setHasVoted] = useState(false);
  const calculateTotalPayout = (comment: Comment) => {
    return Number(comment.pending_payout_value?.split(' ')[0]) + Number(comment.total_payout_value?.split(' ')[0]) + Number(comment.curator_payout_value?.split(' ')[0])
  }
  const [newTotalPayout, setNewTotalPayout] = useState(calculateTotalPayout(comment));

  const handleVote = async () => {
    try {
      await voteOnContent(String(user.hiveUser?.name), comment.permlink, comment.author, 10000)
      setHasVoted(true);
      const newPayout = await voting_value(user)
      setNewTotalPayout(calculateTotalPayout(comment) + newPayout)
    } catch (error) {
      console.error(error)
    }
  }
  useEffect(() => {
    setHasVoted(comment?.active_votes?.some(vote => vote.voter === user.hiveUser?.name) ?? false);
  }, []);



  if (isLoading || !hiveAccount) return <div>Loading...</div>
  return (
    <Flex gap={2} direction={"column"}>
      <Flex gap={1} alignItems="center" border={"1px solid white"} mb={-2}>
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
      <Flex direction={"column"} border={"1px solid"} p={5} bg={"#201d21"}>
        <Markdown content={comment.body} />
        <br />
        <Flex justifyContent="flex-end"> {/* Adjust this Flex component */}
          <Text fontSize="12px" color="darkgray" fontWeight="300">
            Reply
          </Text>
          <Flex ml={2}>
            <FaFire cursor={"pointer"} onClick={handleVote} color={hasVoted ? "limegreen" : "grey"} />
            <Text fontSize="12px" color="darkgray" fontWeight="300">
              {newTotalPayout.toFixed(2)}
            </Text>
          </Flex>
        </Flex>
      </Flex>
      <CommentsSection comments={comment.replies} isCommentReply={true} />
    </Flex>


  )
}
