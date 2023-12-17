"use client"

import {
  Card,
  CardFooter,
  CardHeader,
  Flex,
  Stack,
  Text,
  Tooltip,
} from "@chakra-ui/react"
import { Discussion } from "@hiveio/dhive"
import { Heart, MessageCircle, PiggyBank, Send } from "lucide-react"
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

  console.log(post)

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
      <CardFooter pt={0}>
        <Flex w={"100%"} justify={"space-between"}>
          <Stack direction={"row"}>
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
          <Tooltip label="Share">
            <Send
              cursor={"pointer"}
              strokeWidth={"1.5"}
              color="darkgray"
              size={"20px"}
            />
          </Tooltip>
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
