import { usePostContext } from "@/contexts/PostContext"
import { useHiveUser } from "@/contexts/UserContext"
import { SWR_POSTS_TAG } from "@/hooks/usePosts"
import { vote } from "@/lib/hive/functions"
import { Flex, Text, Tooltip } from "@chakra-ui/react"
import { useState } from "react"
import { useSWRConfig } from "swr"

export default function Vote() {
  const { post } = usePostContext()
  const { mutate } = useSWRConfig()
  const { hiveUser } = useHiveUser()

  const [isVoted, setIsVoted] = useState(
    !!(hiveUser && hiveUser.name && post.userHasVoted(hiveUser.name))
  )

  const handleVoteClick = async () => {
    if (hiveUser) {
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
    hiveUser && (
      <Tooltip label="Earnings">
        <Flex
          gap={1}
          align={"center"}
          cursor={"pointer"}
          onClick={handleVoteClick}
        >
          <Text
            color={isVoted ? "limegreen" : "white"}
            fontSize={"28px"}
            fontWeight={"bold"}
          >
            ${post.getEarnings().toFixed(2)}
          </Text>
        </Flex>
      </Tooltip>
    )
  )
}
