import { usePostContext } from "@/contexts/PostContext"
import {
  CardFooter,
  Flex,
  Stack,
  useClipboard,
  useDisclosure,
} from "@chakra-ui/react"
import { KeychainSDK, Vote } from "keychain-sdk"
import { Check, Heart, MessageCircle, Send } from "lucide-react"
import { useState } from "react"
import PostIcon from "./Icon"
import PostVoters from "./Voters"

export default function Footer() {
  const { post } = usePostContext()
  const { onCopy, hasCopied } = useClipboard(post.getFullUrl())

  const loggedUserData =
    typeof window !== "undefined" ? localStorage.getItem("hiveuser") : null
  const loggedUser = loggedUserData ? JSON.parse(loggedUserData) : null

  const [isVoted, setIsVoted] = useState(
    !!(loggedUser && loggedUser.name && post.userHasVoted(loggedUser.name))
  )

  const handleVoteClick = async () => {
    if (loggedUser) {
      const voteWeight = isVoted ? 0 : 10000
      const keychain = new KeychainSDK(window)
      await keychain.vote({
        username: loggedUser.name,
        permlink: post.permlink,
        author: post.author,
        weight: voteWeight,
      } as Vote)
      setIsVoted((isVoted) => !isVoted)
    }
  }

  const {
    isOpen: isVotersOpen,
    onOpen: onVotersOpen,
    onClose: onVotersClose,
  } = useDisclosure()
  const handleCommentClick = () => {
    console.log("Comments")
  }

  return (
    <CardFooter pt={0} flexDirection={"column"} gap={2}>
      <Flex w={"100%"} justify={"space-between"} align={"center"}>
        <PostVoters
          activeVoters={post.active_votes}
          modalIsOpen={isVotersOpen}
          modalOnOpen={onVotersOpen}
          modalOnClose={onVotersClose}
        />
        <Stack direction={"row"} gap={1}>
          <PostIcon
            onClick={onCopy}
            icon={hasCopied ? Check : Send}
            label={hasCopied ? "Copied!" : "Copy link"}
            size={6}
          />
          <PostIcon
            onClick={handleCommentClick}
            icon={MessageCircle}
            label="Comments"
            size={6}
          />
          {loggedUser && (
            <PostIcon
              onClick={handleVoteClick}
              active={isVoted}
              colorAccent="#ff4655"
              fill={true}
              icon={Heart}
              label="Upvote"
              size={6}
            />
          )}
        </Stack>
      </Flex>
    </CardFooter>
  )
}
