"use client"

import {
  Card,
  CardFooter,
  CardHeader,
  Flex,
  Stack,
  Text,
  Tooltip,
  useClipboard,
} from "@chakra-ui/react"
import { Discussion } from "@hiveio/dhive"
import { Check, Heart, MessageCircle, PiggyBank, Send } from "lucide-react"
import { useRouter } from "next/navigation"
import { ReactElement } from "react"
import PostAvatar from "./PostAvatar"
import PostImage from "./PostImage"

interface PostProprieties {
  post?: Discussion
}

export default function Post({ post }: PostProprieties): ReactElement {
  const postMetadata = post ? JSON.parse(post.json_metadata) : {}
  const postAuthor = post?.author || ""
  const router = useRouter()
  const votes = post?.active_votes.sort((a, b) => b.reputation - a.reputation)

  const fullPostUrl = post ? `${document.location.origin}/post${post.url}` : "#"
  const { onCopy, value, setValue, hasCopied } = useClipboard(fullPostUrl)

  return (
    <Card
      size="sm"
      boxShadow="none"
      borderRadius="lg"
      _hover={{
        outline: "1px solid",
        outlineColor: "gray.100",
      }}
    >
      <CardHeader mt={2} pb={0}>
        <Flex gap="4" align={"end"}>
          <Flex flex="1" gap="2" alignItems="center">
            <PostAvatar
              name={postAuthor}
              src={`https://images.ecency.com/webp/u/${postAuthor}/avatar/small`}
            />
            <Flex flexDir="column" gap={0}>
              <Flex gap={1} alignItems="center">
                <Text fontSize="14px" as="b">
                  {post?.author}
                </Text>
                <Text fontSize="14px" color="darkgray">
                  ·
                </Text>
                <Text fontSize="12px" color="darkgray" fontWeight="300">
                  {post && formatTimeSince(post?.created)}
                </Text>
              </Flex>
              <Text fontSize="14px" noOfLines={1}>
                {post?.title}
              </Text>
            </Flex>
          </Flex>
          <Tooltip label="Earnings">
            <Flex gap={1} align={"center"}>
              <PiggyBank strokeWidth={"1.5"} color="darkgray" size={"20px"} />
              <Text color={"darkgray"} fontSize={"13px"} fontWeight={"400"}>
                ${post && getEarnings(post).toFixed(2)}
              </Text>
            </Flex>
          </Tooltip>
        </Flex>
      </CardHeader>
      <PostImage
        src={(postMetadata?.image && postMetadata.image[0]) || ""}
        alt={post?.title || ""}
        linkUrl={post ? "post" + post.url : "#"}
      />
      <CardFooter pt={0} flexDirection={"column"} gap={2}>
        <Flex w={"100%"} justify={"space-between"}>
          {post && getVoters(post)}
          <Stack direction={"row"}>
            <Tooltip label={hasCopied ? "Copied!" : "Share"}>
              {hasCopied ? (
                <Check strokeWidth={"1.5"} color="darkgray" size={"20px"} />
              ) : (
                <Send
                  onClick={onCopy}
                  cursor={"pointer"}
                  strokeWidth={"1.5"}
                  color="darkgray"
                  size={"20px"}
                />
              )}
            </Tooltip>
            <Tooltip label="Comments">
              <MessageCircle
                cursor={"pointer"}
                strokeWidth={"1.5"}
                color="darkgray"
                size={"20px"}
              />
            </Tooltip>
            <Tooltip label="Upvote">
              <Heart
                cursor={"pointer"}
                strokeWidth={"1.5"}
                color="darkgray"
                size={"20px"}
              />
            </Tooltip>
          </Stack>
        </Flex>
      </CardFooter>
    </Card>
  )
}

function formatTimeSince(dateString: string): string {
  const postDate = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - postDate.getTime()

  const minutes = Math.floor(diffMs / 60000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (minutes < 60) {
    return `${minutes}m`
  } else if (hours < 24) {
    return `${hours}h`
  } else {
    const day = postDate.getDate()
    const monthNames: string[] = [
      "Jan",
      "Fev",
      "Mar",
      "Abr",
      "Mai",
      "Jun",
      "Jul",
      "Ago",
      "Set",
      "Out",
      "Nov",
      "Dez",
    ]
    const month = monthNames[postDate.getMonth()]
    return `${day} ${month}`
  }
}

function getEarnings(post: Discussion): number {
  const totalPayout = parseFloat(
    post.total_payout_value.toString().split(" ")[0]
  )
  const curatorPayout = parseFloat(
    post.curator_payout_value.toString().split(" ")[0]
  )
  const pendingPayout = parseFloat(
    post.pending_payout_value.toString().split(" ")[0]
  )
  const totalEarnings = totalPayout + curatorPayout + pendingPayout
  return totalEarnings
}

function getVoters(post: Discussion) {
  if (!post.active_votes || !post.active_votes.length)
    return <Text fontSize={"sm"}>No votes</Text>

  const votes = post.active_votes.sort((a, b) => b.reputation - a.reputation)
  const bestReputationVoter: string = votes[0].voter
  const qtdVotes = votes.length - 1

  if (qtdVotes > 1)
    return (
      <Text fontSize={"sm"}>
        Voted by <b>{bestReputationVoter}</b> and <b>{qtdVotes}</b> other
        {qtdVotes > 1 && "s"}
      </Text>
    )

  return (
    <Text fontSize={"sm"}>
      Voted by <Text as="b">{bestReputationVoter}</Text>
    </Text>
  )
}
