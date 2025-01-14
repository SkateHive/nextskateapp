import ReplyModal from "@/app/mainFeed/components/replyModal";
import { MarkdownRenderers } from "@/app/upload/utils/MarkdownRenderers";
import { changeFollow, checkFollow } from "@/lib/hive/client-functions";
import { calculateTimeAgo } from "@/lib/utils";
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
  useColorModeValue,
} from "@chakra-ui/react";
import { Comment } from "@hiveio/dhive";
import { ExternalLink } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import { getPostDetails } from "../lib/getPostDetails";
import { Notification } from "../page";

interface NotificationContentProps {
  notification: Notification;
  username: string;
}

interface JsonMetadata {
  image?: string[];
  [key: string]: any;
}

// Cache posts in memory
const postCache: Record<string, Comment | null> = {};

const extractPermlink = (url: string) => url.split("/").pop(); // Extract the permlink from the URL

export function NotificationContent({
  notification,
  username,
}: NotificationContentProps) {
  const [post, setPost] = useState<Comment | null>(null);
  const [parentPost, setParentPost] = useState<Comment | null>(null);
  const [isFollowing, setIsFollowing] = useState<boolean | null>(null);
  const [loadingFollow, setLoadingFollow] = useState(false);
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);

  // Function to get post details from cache or API
  const getCachedPostDetails = async (author: string, permlink: string) => {
    const cacheKey = `${author}/${permlink}`;
    if (postCache[cacheKey]) {
      return postCache[cacheKey];
    }
    const postDetails = await getPostDetails(author, permlink);
    postCache[cacheKey] = postDetails;
    return postDetails;
  };

  // Load post details for reply notifications
  useEffect(() => {
    if (notification.type === "reply" || notification.type === "reply_comment") {
      const fetchPostDetails = async () => {
        const permlink = extractPermlink(notification.url) || "";
        try {
          const postDetails = await getCachedPostDetails(
            String(notification.user),
            permlink
          );
          setPost(postDetails);

          const parentPostDetails = await getCachedPostDetails(
            postDetails.parent_author,
            postDetails.parent_permlink
          );
          setParentPost(parentPostDetails);
        } catch (error) {
          console.error("Error fetching post details", error);
        }
      };
      fetchPostDetails();
    }
  }, [notification.type, notification.url, notification.user]);

  // Check follow status for "follow" notifications
  useEffect(() => {
    if (notification.type === "follow") {
      const fetchFollowStatus = async () => {
        const status = await checkFollow(username, String(notification.user));
        setIsFollowing(status);
      };
      fetchFollowStatus();
    }
  }, [notification.type, notification.user, username]);

  const handleFollowToggle = async () => {
    setLoadingFollow(true);
    await changeFollow(username, String(notification.user));
    const updatedStatus = await checkFollow(username, String(notification.user));
    setIsFollowing(updatedStatus);
    setLoadingFollow(false);
  };

  const parentMetadata: JsonMetadata | null = useMemo(() => {
    if (!parentPost?.json_metadata) return null;
    try {
      return JSON.parse(parentPost.json_metadata as string) as JsonMetadata;
    } catch (error) {
      console.error("Error parsing json_metadata", error);
      return null;
    }
  }, [parentPost?.json_metadata]);

  const bgColor = useColorModeValue("gray.100", "gray.800");
  const textColor = useColorModeValue("gray.700", "gray.300");

  return (
    <Flex
      align="center"
      px={4}
      py={3}
      bg={bgColor}
      borderRadius="md"
      boxShadow="sm"
      _hover={{ boxShadow: "lg" }}
      gap={4}
    >
      {isReplyModalOpen && (
        <ReplyModal
          isOpen={isReplyModalOpen}
          onClose={() => setIsReplyModalOpen(false)}
          comment={post}
          onNewComment={() => { }}
        />
      )}


      <Avatar
        boxSize="50px"
        name={notification.user}
        src={`https://images.ecency.com/webp/u/${notification.user}/avatar/small`}
        borderRadius="full"
      />

      <Stack flex={1} spacing={2}>
        <HStack justify="space-between">
          <Box>
            <Text fontWeight="bold" fontSize="lg" color="yellow.500">
              <Link href={`/skater/${notification.user}`}>
                @{notification.user}
              </Link>
            </Text>
            <Text fontSize="sm" color={textColor}>
              {notification.msg}
            </Text>
            <Text fontSize="xs" color="gray.500">
              {calculateTimeAgo(notification.date)} ago
            </Text>
          </Box>
          {parentMetadata?.image && (
            <Box w={"50px"} h={"50px"}>
              <Image
                src={parentMetadata.image[0]}
                alt="Thumbnail"
                boxSize="50px"
                borderRadius="md"
                objectFit="cover"
              />
            </Box>
          )}
        </HStack>

        {post && (notification.type === "reply" || notification.type === "reply_comment") && (
          <Box
            mt={2}
            border="1px solid"
            borderColor="gray.600"
            borderRadius="md"
            p={4}
            maxW="container.md"
            maxH="400px"
            overflowY="auto"

            boxShadow="md"
          >
            <ReactMarkdown
              components={MarkdownRenderers}
              rehypePlugins={[rehypeRaw]} // Render HTML in Markdown
            >
              {post.body}
            </ReactMarkdown>

            <Button
              size="sm"
              mt={4}
              colorScheme="teal"
              onClick={() => setIsReplyModalOpen(true)}
            >
              Reply
            </Button>
          </Box>
        )}


      </Stack>

      {notification.type === "follow" ? (
        <Button
          size="sm"
          colorScheme={isFollowing ? "red" : "blue"}
          onClick={handleFollowToggle}
          isLoading={loadingFollow}
        >
          {isFollowing ? "Unfollow" : "Follow back"}
        </Button>
      ) : (
        <Tooltip label="View post">
          <IconButton
            size="sm"
            aria-label="View post"
            icon={<ExternalLink />}
            as={Link}
            href={notification.url}
            target="_blank"
            rel="noopener noreferrer"
          />
        </Tooltip>
      )}
    </Flex>
  );
}
