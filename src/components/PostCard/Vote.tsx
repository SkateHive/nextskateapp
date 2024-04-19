import { usePostContext } from "@/contexts/PostContext"
import { useHiveUser } from "@/contexts/UserContext"
//import { SWR_POSTS_TAG } from "@/hooks/usePosts"
import { vote } from "@/lib/hive/client-functions"
import { voteWithPrivateKey } from "@/lib/hive/server-functions"
import { Button, Text, Tooltip } from "@chakra-ui/react"
import { VoteOperation } from "@hiveio/dhive"
import { useState } from "react"
import { RiArrowRightUpLine } from "react-icons/ri"
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
    const loginMethod = localStorage.getItem("LoginMethod")
    const voteWeight = isVoted ? 0 : 10000

    if (!hiveUser) return

    if (loginMethod === "keychain") {
      await vote({
        username: hiveUser.name,
        permlink: post.permlink,
        author: post.author,
        weight: voteWeight,
      })
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
      console.log("Voting with private key")
    }

    if (!isVoted) reward()
    setIsVoted((isVoted) => !isVoted)
    //mutate(SWR_POSTS_TAG)
  }

  return (
    <Tooltip label="Earnings">
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
          // color={isVoted ? "limegreen" : "white"}
          fontSize={"18px"}
          fontWeight={"bold"}
        >
          ${post.getEarnings().toFixed(2)}
        </Text>
        <RiArrowRightUpLine size={25} style={{ marginLeft: "-4px" }} />
      </Button>
    </Tooltip>
  )
}
