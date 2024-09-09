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
import { FaEye } from "react-icons/fa"
import { Notification } from "../page"
import { getPostDetails } from "../lib/getPostDetails"
import { checkFollow, changeFollow } from "@/lib/hive/client-functions"
import { Comment } from "@hiveio/dhive"
import { MarkdownRenderers } from "@/app/upload/utils/MarkdownRenderers"
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm'

interface NotificationContentProps {
  notification: Notification
}

function getTypeColor(type: string) {
  switch (type) {
    case "mention":
      return "yellow"
    case "vote":
      return "green"
    case "reply":
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
}: NotificationContentProps) {
  const [isPreview, setIsPreview] = useState(false)
  const [post, setPost] = useState<Comment | null>(null)
  const [isFollowing, setIsFollowing] = useState<boolean | null>(null) // To track follow status
  const [loadingFollow, setLoadingFollow] = useState(false) // To disable the button while processing follow/unfollow

  // Load post details only when clicked
  const loadPostDetails = async () => {
    const permlink = extractPermlink(notification.url)
    try {
      const postDetails = await getPostDetails(String(notification.user), permlink)
      setPost(postDetails)
      setIsPreview(true)
    } catch (error) {
      console.error("Error fetching post details", error)
    }
  }

  // Check follow status if the notification is a follow type
  useEffect(() => {
    if (notification.type === "follow") {
      const fetchFollowStatus = async () => {
        const status = await checkFollow("currentUser", String(notification.user)) // Replace "currentUser" with the current logged-in user
        setIsFollowing(status)
      }
      fetchFollowStatus()
    }
  }, [notification.type, notification.user])

  // Handle follow/unfollow action
  const handleFollowToggle = async () => {
    setLoadingFollow(true)
    await changeFollow("currentUser", String(notification.user)) // Replace "currentUser" with the current logged-in user
    const updatedStatus = await checkFollow("currentUser", String(notification.user))
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
          <Badge colorScheme={getTypeColor(notification.type)} fontSize="1.2em">
            {notification.type.replace("_", " ")}
          </Badge>
          <Text fontSize="14px" color="darkgray">
            ·
          </Text>
          <Text fontSize="18px" color="darkgray" fontWeight="400">
            {calculateTimeAgo(notification.date)}
          </Text>
          {/* Render follow/unfollow button if it's a follow notification */}

        </HStack>
        <Text fontSize={"22px"}>
          <Link fontWeight={"bold"} href={`/skater/${notification.user}`}>
            @{notification.user}
          </Link>{" "}
          {notification.msg}
        </Text>

        {/* Conditionally show post content for replies after loading */}
        {isPreview && post && (
          <ReactMarkdown
            components={MarkdownRenderers}
            rehypePlugins={[rehypeRaw]}
            remarkPlugins={[remarkGfm]}
          >
            {post.body}
          </ReactMarkdown>
        )}
      </Stack>
      {notification.type === "follow" ? (
        <Button
          size="sm"
          colorScheme={isFollowing ? "red" : "green"} // Red for unfollow, green for follow
          onClick={handleFollowToggle}
          isLoading={loadingFollow}
        >
          {isFollowing ? "Unfollow" : "Follow Back"}
        </Button>
      ) : (
        <Tooltip label={isPreview ? "Hide preview" : "View preview"}>
          <IconButton
            size={"md"}
            aria-label="Toggle preview"
            icon={<FaEye color={"gray"} />}
            variant={"ghost"}
            onClick={isPreview ? () => setIsPreview(false) : loadPostDetails} // Load post on click
          />
        </Tooltip>
      )}

      <Tooltip label="View post">
        <IconButton
          size={"md"}
          aria-label="View post"
          icon={<ExternalLink color={"gray"} />}
          variant={"ghost"}
          as={Link}
          href={notification.type === "follow" ? `/skater/${notification.user}` : notification.url}
          target="_blank"
          rel="noopener noreferrer"
        />
      </Tooltip>
    </Flex>
  )
}
