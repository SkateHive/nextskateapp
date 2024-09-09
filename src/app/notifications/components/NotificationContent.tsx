import React, { useState, useEffect } from "react"
import { calculateTimeAgo } from "@/lib/utils"
import {
  Avatar,
  Badge,
  Flex,
  HStack,
  IconButton,
  Link,
  Stack,
  Text,
  Tooltip,
  Button,
} from "@chakra-ui/react"
import { ExternalLink } from "lucide-react"
import { Notification } from "../page"
import { getPostDetails } from "../lib/getPostDetails"
import { checkFollow, changeFollow } from "@/lib/hive/client-functions"
import { Comment } from "@hiveio/dhive"
import ReactMarkdown from "react-markdown"
interface NotificationContentProps {
  notification: Notification
  username: string
}

function getTypeColor(type: string) {
  switch (type) {
    case "mention":
      return "yellow"
    case "vote":
      return "green"
    case "reply":
    case "reply_comment":
      return "blue"
    case "follow":
      return "purple"
    default:
      return "gray"
  }
}

// Helper function to extract permlink from notification URL
const extractPermlink = (url: string) => {
  const segments = url.split("/")
  return segments[segments.length - 1] // Get the last part of the URL
}

export function NotificationContent({
  notification,
  username,
}: NotificationContentProps) {
  const [post, setPost] = useState<Comment | null>(null)
  const [isFollowing, setIsFollowing] = useState<boolean | null>(null)
  const [loadingFollow, setLoadingFollow] = useState(false)

  // Load post details automatically for reply and reply_comment types
  useEffect(() => {
    const fetchPostDetails = async () => {
      if (notification.type === "reply" || notification.type === "reply_comment") {
        const permlink = extractPermlink(notification.url)
        try {
          const postDetails = await getPostDetails(String(notification.user), permlink)
          setPost(postDetails)
        } catch (error) {
          console.error("Error fetching post details", error)
        }
      } else {
        setPost(null) // Clear post when switching tabs to non-reply types
      }
    }
    fetchPostDetails()
  }, [notification.type, notification.url, notification.user])

  // Check follow status if the notification is a follow type
  useEffect(() => {
    if (notification.type === "follow") {
      const fetchFollowStatus = async () => {
        const status = await checkFollow(username, String(notification.user)) // Replace "currentUser" with the current logged-in user
        setIsFollowing(status)
      }
      fetchFollowStatus()
    }
  }, [notification.type, notification.user])

  // Handle follow/unfollow action
  const handleFollowToggle = async () => {
    setLoadingFollow(true)
    await changeFollow(username, String(notification.user)) // Replace "currentUser" with the current logged-in user
    const updatedStatus = await checkFollow(username, String(notification.user))
    setIsFollowing(updatedStatus)
    setLoadingFollow(false)
  }

  return (
    <Flex
      align={"center"}
      px={2}
      py={4}
      _hover={{ border: "1px solid", borderColor: "limegreen" }}
      gap={4}
      color={"white"}
    >
      <Link href={`/skater/${notification.user}`}>
        <Avatar
          boxSize={"70px"}
          name={notification.user}
          src={`https://images.ecency.com/webp/u/${notification.user}/avatar/small`}
          borderRadius={"100%"}
        />
      </Link>
      <Stack flexGrow={1} gap={1}>
        <HStack>

          <Text fontSize={"22px"}>
            <Link fontWeight={"bold"} href={`/skater/${notification.user}`}>
              @{notification.user}
            </Link>{" "}
            {notification.msg}
          </Text>
          <Text fontSize="18px" color="darkgray" fontWeight="400">
            {calculateTimeAgo(notification.date)} ago
          </Text>
        </HStack>

        {/* Only show post content for reply and reply_comment */}
        {post !== null && (notification.type === "reply" || notification.type === "reply_comment") && (
          <ReactMarkdown>{post.body}</ReactMarkdown>
        )}
      </Stack>

      {notification.type === "follow" ? (
        <Button
          size="sm"
          colorScheme={isFollowing ? "red" : "green"}
          onClick={handleFollowToggle}
          isLoading={loadingFollow}
        >
          {isFollowing ? "Unfollow" : "Follow Back"}
        </Button>
      ) : (
        <Tooltip label="View post">
          <IconButton
            size={"md"}
            aria-label="View post"
            icon={<ExternalLink color={"gray"} />}
            variant={"ghost"}
            as={Link}
            href={notification.url}
            target="_blank"
            rel="noopener noreferrer"
          />
        </Tooltip>
      )}
    </Flex>
  )
}