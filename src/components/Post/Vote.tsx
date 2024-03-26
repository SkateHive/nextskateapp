import { usePostContext } from "@/contexts/PostContext"
import { useHiveUser } from "@/contexts/UserContext"
import { SWR_POSTS_TAG } from "@/hooks/usePosts"
import { vote } from "@/lib/hive/functions"
import { Heart } from "lucide-react"
import { useState } from "react"
import { useSWRConfig } from "swr"
import PostIcon from "./Icon"

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
      <PostIcon
        onClick={handleVoteClick}
        active={isVoted}
        colorAccent="#ff4655"
        fill={true}
        icon={Heart}
        label="Upvote"
        size={6}
      />
    )
  )
}
