import { usePostContext } from "@/contexts/PostContext"
import { useHiveUser } from "@/contexts/UserContext"
import { SWR_POSTS_TAG } from "@/hooks/usePosts"
import { vote } from "@/lib/hive/functions"
import { Button, Text, Tooltip } from "@chakra-ui/react"
import { useState } from "react"
import { useReward } from "react-rewards"
import { useSWRConfig } from "swr"

export default function Vote() {
  const { post } = usePostContext()
  const { mutate } = useSWRConfig()
  const { hiveUser } = useHiveUser()

  const rewardId = post.post_id ? "postReward" + post.post_id : ""
  const { reward, isAnimating } = useReward(rewardId, "emoji", {
    emoji: ["$", "*", "#"],
    spread: 60,
  })

  const [isVoted, setIsVoted] = useState(
    !!(hiveUser && hiveUser.name && post.userHasVoted(hiveUser.name))
  )

  const handleVoteClick = async () => {
    if (hiveUser) {
      if (!isVoted) reward()
      const voteWeight = isVoted ? 0 : 10000
      await vote({
        username: hiveUser.name,
        permlink: post.permlink,
        author: post.author,
        weight: voteWeight,
      })
      setIsVoted((isVoted) => !isVoted)
      mutate(SWR_POSTS_TAG)
    }
  }

  return (
    <Tooltip label="Earnings">
      <Button
        variant={"link"}
        disabled={isAnimating}
        colorScheme={isVoted || isAnimating ? "green" : "white"}
        onClick={hiveUser ? handleVoteClick : () => {}}
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
          // color={isVoted ? "limegreen" : "white"}
          fontSize={"28px"}
          fontWeight={"bold"}
        >
          ${post.getEarnings().toFixed(2)}
        </Text>
      </Button>
    </Tooltip>
  )
}
