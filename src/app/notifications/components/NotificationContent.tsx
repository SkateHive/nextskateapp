import ReplyModal from "@/app/mainFeed/components/replyModal"
import MarkdownRenderer from "@/components/ReactMarkdown/page"
import { changeFollow, checkFollow } from "@/lib/hive/client-functions"
import { calculateTimeAgo } from "@/lib/utils"
import {
  Avatar,
  Box,
  Button,
  Flex,
  HStack,
  IconButton,
  Image,
  Link,
  Stack,
  Text,
  Tooltip,
} from "@chakra-ui/react"
import { Comment } from "@hiveio/dhive"
import { ExternalLink } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { getPostDetails } from "../lib/getPostDetails"
import { Notification } from "../page"

interface NotificationContentProps {
  notification: Notification
  username: string
}

interface JsonMetadata {
  image?: string[];
  [key: string]: any;
}

// Create an in-memory cache
const postCache: Record<string, Comment | null> = {}
// Helper function to extract permlink from notification URL
const extractPermlink = (url: string) => {
  const segments = url.split("/")
  return segments[segments.length - 1] // Get the last part of the URL
}
export function NotificationContent({
  notification,
  username,
}: NotificationContentProps) {
  const [post, setPost] = useState<Comment | null>(null);
  const [parentPost, setParentPost] = useState<Comment | null>(null); // Store parent post details
  const [isFollowing, setIsFollowing] = useState<boolean | null>(null);
  const [loadingFollow, setLoadingFollow] = useState(false);
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);

  // Memoized function to get post from cache or fetch from API
  const getCachedPostDetails = async (author: string, permlink: string) => {
    const cacheKey = `${author}/${permlink}`;
    if (postCache[cacheKey]) {
      return postCache[cacheKey];
    } else {
      const postDetails = await getPostDetails(author, permlink);
      postCache[cacheKey] = postDetails;
      return postDetails;
    }
  }

  // Load post details automatically for reply and reply_comment types
  useEffect(() => {
    const fetchPostDetails = async () => {
      if (notification.type === "reply" || notification.type === "reply_comment") {
        const permlink = extractPermlink(notification.url)
        try {
          const postDetails = await getCachedPostDetails(String(notification.user), permlink)
          setPost(postDetails)

          // Fetch the parent post and cache it
          const parentPostDetails = await getCachedPostDetails(postDetails.parent_author, postDetails.parent_permlink)
          setParentPost(parentPostDetails) // Set the parent post
        } catch (error) {
          console.error("Error fetching post details", error)
        }
      } else {
        setPost(null); // Clear post when switching tabs to non-reply types
        setParentPost(null); // Clear parent post
      }
    }
    fetchPostDetails()
  }, [notification.type, notification.url, notification.user])

  // Check follow status if the notification is a follow type
  useEffect(() => {
    if (notification.type === "follow") {
      const fetchFollowStatus = async () => {
        const status = await checkFollow(username, String(notification.user))
        setIsFollowing(status)
      }
      fetchFollowStatus()
    }
  }, [notification.type, notification.user])

  // Handle follow/unfollow action
  const handleFollowToggle = async () => {
    setLoadingFollow(true)
    await changeFollow(username, String(notification.user))
    const updatedStatus = await checkFollow(username, String(notification.user))
    setIsFollowing(updatedStatus)
    setLoadingFollow(false)
  }

  // Safely parse the JSON metadata of the parent post
  const parentMetadata: JsonMetadata | null = useMemo(() => {
    if (!parentPost?.json_metadata) {
      return null;
    }

    if (typeof parentPost.json_metadata === "string") {
      try {
        return JSON.parse(parentPost.json_metadata) as JsonMetadata;
      } catch (error) {
        console.error("Error parsing parent post json_metadata", error);
        return null;
      }
    }

    return parentPost.json_metadata as JsonMetadata;
  }, [parentPost?.json_metadata]);

  return (
    <Flex
      align={"center"}
      px={4}
      py={3}
      _hover={{ border: "1px solid", borderColor: "gray.600" }}
      gap={4}
      color={"white"}
    >
      {isReplyModalOpen && (
        <ReplyModal
          isOpen={isReplyModalOpen}
          onClose={() => setIsReplyModalOpen(false)}
          comment={post}
          onNewComment={() => { }}
          content={post?.body || ""}
        />
      )}
      <Stack flexGrow={1} gap={1}>
        <HStack align={"center"} justify={"space-between"} w={"full"}>
          <Flex align={"center"} gap={2}>
            <Link href={`/skater/${notification.user}`}>
              <Avatar
                boxSize={"45px"}
                name={notification.user}
                src={`https://images.ecency.com/webp/u/${notification.user}/avatar/small` || '/pepenation.gif'}
                borderRadius={"full"}
              />
            </Link>
            <Box>
              <Text fontSize={"18px"} fontWeight={"bold"}>
                <Link color={"yellow.400"} href={`/skater/${notification.user}`}>
                  @{notification.user}
                </Link>{" "}
                {notification.msg}
              </Text>
              <Text fontSize="14px" color="gray.500" fontWeight="400">
                {calculateTimeAgo(notification.date)} ago
              </Text>
            </Box>
          </Flex>
          {/* Render the small thumbnail image */}
          {parentMetadata?.image && (
            <Box w={"50px"} h={"50px"}>
              <Image
                src={parentMetadata.image[0]}
                alt={parentPost?.title || "Post thumbnail"}
                borderRadius={"10px"}
                objectFit={"cover"}
                w={"full"}
                h={"full"}
              />
            </Box>
          )}
        </HStack>

        {/* Only show post content for reply and reply_comment */}
        {post !== null && (notification.type === "reply" || notification.type === "reply_comment") && (
          <Box mt={2}>
             <MarkdownRenderer content={post.body} />

            <Flex justifyContent={"flex-start"} mt={2}>
              <Button
                size="sm"
                colorScheme="green"
                onClick={() => setIsReplyModalOpen(true)}
                variant={"ghost"}
              >
                Reply
              </Button>
            </Flex>
          </Box>
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
