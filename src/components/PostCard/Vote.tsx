'use client'
import { usePostContext } from "@/contexts/PostContext"
import { useHiveUser } from "@/contexts/UserContext"
import { vote } from "@/lib/hive/client-functions"
import { voteWithPrivateKey } from "@/lib/hive/server-functions"
import { Button, Text, Tooltip } from "@chakra-ui/react"
import { VoteOperation } from "@hiveio/dhive"
import { useState } from "react"
import { useReward } from "react-rewards"
import { voting_value2 } from "./calculateHiveVotingValueForHiveUser"

export default function Vote() {
  const { post } = usePostContext()
  const { hiveUser } = useHiveUser()
  const [postEarnings, setPostEarnings] = useState(Number(post.getEarnings().toFixed(2)))
  const [userVotingValue, setUserVotingValue] = useState(0)


  const rewardId = post.post_id ? "postReward" + post.post_id : ""
  const { reward, isAnimating } = useReward(rewardId, "emoji", {
    emoji: ["$", "*", "#"],
    spread: 60,
  })
  const [isVoted, setIsVoted] = useState(
    !!(hiveUser && hiveUser.name && post.userHasVoted(hiveUser.name))
  )
  const handleVoteClick = async () => {
    const loginMethod = localStorage.getItem("LoginMethod")
    const voteWeight = isVoted ? 0 : 10000

    if (!hiveUser) return

    const vote_value = await voting_value2(hiveUser);
    console.log(vote_value)
    setUserVotingValue(Number(vote_value.toFixed(2)));

    if (loginMethod === "keychain") {
      await vote({
        username: hiveUser.name,
        permlink: post.permlink,
        author: post.author,
        weight: voteWeight,
      })
      if (!isVoted && voteWeight > 0) {
        setPostEarnings(Number(postEarnings.toFixed(2)) + vote_value)
      } else if (isVoted && voteWeight === 0) {
        setPostEarnings(Number(postEarnings.toFixed(2)) - vote_value)
      }
    } else if (loginMethod === "privateKey") {
      const vote: VoteOperation = [
        "vote",
        {
          author: post.author,
          permlink: post.permlink,
          voter: hiveUser.name,
          weight: voteWeight,
        }
      ]
      const encryptedPrivateKey = localStorage.getItem("EncPrivateKey");
      voteWithPrivateKey(encryptedPrivateKey, vote)
    }

    if (!isVoted) reward()
    setIsVoted((isVoted) => !isVoted)
  }

  return (
    <Tooltip color={"white"} background={"blakc"} border={"1px dashed limegreen"} label="Vote fo this">
      <Button
        variant={"link"}
        disabled={isAnimating}
        colorScheme={isVoted || isAnimating ? "green" : "white"}
        onClick={handleVoteClick}
        gap={0}
      >
        <span
          id={rewardId}
          style={{
            left: "50%",
            bottom: "15px",
            transform: "translateX(-50%)",
            zIndex: 5,
          }}
        />
        <Text
          fontSize={"18px"}
          fontWeight={"bold"}
        >
          ${postEarnings.toFixed(2)}
        </Text>
      </Button>
    </Tooltip>
  )
}
