import {
  Box,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalCloseButton,
  ModalBody,
  Flex,
  Image,
  Text,
  Textarea,
  Button,
  useBreakpointValue,
  HStack,
} from "@chakra-ui/react";
import { FaDownload } from "react-icons/fa";
import { MediaItem } from "@/lib/utils";
import VideoRenderer from "@/app/upload/utils/VideoRenderer";
import { useComments } from "@/hooks/comments";
import AuthorAvatar from "../AuthorAvatar";
import { useState, useEffect, useMemo } from "react";
import { HiveAccount } from "@/lib/useHiveAuth";
import { commentWithPrivateKey } from "@/lib/hive/server-functions";
import * as dhive from "@hiveio/dhive";
import Markdown from "react-markdown";

type ExtendedMediaItem = MediaItem & { comment: dhive.Discussion };

interface MediaModalProps {
  media: ExtendedMediaItem;
  isOpen: boolean;
  onClose: () => void;
  onNewComment: (comment: any) => void;
  user: HiveAccount;
  postDate: string;
}

const MediaModal = ({
  media,
  isOpen,
  onClose,
  user,
  onNewComment,
  postDate,
}: MediaModalProps) => {
  const modalSize = useBreakpointValue({ base: "full", md: "5xl" });
  const [replyBody, setReplyBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const {
    comments,
    isLoading,
    error: repliesError,
  } = useComments(media.comment.author, media.comment.permlink, false);
  const [localReplies, setLocalReplies] = useState<any[]>([]);

  const connectedUser = useMemo(() => {
    const user = localStorage.getItem("hiveuser");
    return user ? JSON.parse(user) : null;
  }, []);

  const connectedUsername = connectedUser?.name || "";

  useEffect(() => {
    setLocalReplies(comments);
  }, [comments]);

  const handleReply = async () => {
    if (!localStorage.getItem("LoginMethod")) {
      setError("You must be logged in to respond.");
      return;
    }

    const newPermLink = `${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
    const postData = {
      parent_author: media.comment.author,
      parent_permlink: media.comment.permlink,
      author: connectedUsername || user?.name,
      permlink: newPermLink,
      title: `Reply to ${media.comment.author}`,
      body: replyBody,
      json_metadata: JSON.stringify({
        tags: ["skateboard"],
        app: "skatehive",
      }),
    };

    try {
      if (localStorage.getItem("LoginMethod") === "keychain") {
        if (!window.hive_keychain)
          throw new Error("Hive Keychain extension not found!");

        window.hive_keychain.requestBroadcast(
          postData.author,
          [["comment", postData]],
          "posting",
          (response: any) => {
            if (response.success) {
              addNewComment(postData, newPermLink);
            } else {
              throw new Error("Error posting comment: " + response.message);
            }
          }
        );
      } else {
        const commentOptions: dhive.CommentOptionsOperation = [
          "comment_options",
          {
            author: postData.author,
            permlink: newPermLink,
            max_accepted_payout: "10000.000 HBD",
            percent_hbd: 10000,
            allow_votes: true,
            allow_curation_rewards: true,
            extensions: [
              [
                0,
                {
                  beneficiaries: [{ account: "skatehacker", weight: 1000 }],
                },
              ],
            ],
          },
        ];

        await commentWithPrivateKey(
          localStorage.getItem("EncPrivateKey")!,
          ["comment", postData],
          commentOptions
        );
        addNewComment(postData, newPermLink);
      }
    } catch (error: any) {
      setError(error.message);
    }
  };

  const addNewComment = (postData: any, newPermLink: string) => {
    const newComment = { ...postData, id: newPermLink };
    onNewComment(newComment);
    setLocalReplies((prev) => [newComment, ...prev]);
    setReplyBody("");
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={modalSize} isCentered>
      <ModalOverlay />
      <ModalContent
        bg="rgb(24, 24, 24)"
        color="white"
        h={{ base: "100vh", md: "85vh" }}
        borderRadius={{ base: 0, md: "lg" }}
      >
        <ModalCloseButton />
        <ModalBody
          p={0}
          display="flex"
          flexDirection={{ base: "column", md: "row" }}
        >
          {/* Media Section */}
          <Box
            flex="1"
            display="flex"
            justifyContent="center"
            alignItems="center"
            bg="black"
            h={{ base: "60vh", md: "85vh" }} // Match modal height
            position="relative"
            overflow="hidden" // Prevent content from overflowing
            _hover={{ "& button": { opacity: 1 } }}
          >
            {media.type === "image" ? (
              <Image
                src={media.url}
                alt="Selected media"
                maxW="100%" // Ensure it doesn't exceed the modal width
                maxH="85vh" // Limit height to the modal's height
                objectFit="contain" // Contain the image within the box
              />
            ) : (
              <VideoRenderer src={media.url} />
            )}

            {/* Download Button */}
            <a
              href={media.url}
              download={media.url.split("/").pop() || "media"}
              style={{ position: "absolute", bottom: "16px", right: "16px" }}
            >
              <Button
                colorScheme="green"
                size="sm"
                leftIcon={<FaDownload />}
                opacity={0}
                transition="opacity 0.2s"
              >
                Download
              </Button>
            </a>
          </Box>

          {/* Comments & Details Section */}
          <Box
            flex="1"
            overflowY="auto"
            p={4}
            maxW={{ base: "100%", md: "40%" }}
            display="flex"
            flexDirection="column"
            h={{ base: "40vh", md: "auto" }}
          >
            <Flex align="center" gap={3} mb={2}>
              <AuthorAvatar
                username={media.comment.author}
                boxSize={10}
                quality="small"
                borderRadius={100}
              />
              <Text fontWeight="bold">{media.comment.author}</Text>
            </Flex>

            <Text mb={4}>{media.subtitle}</Text>

            <Box mt={2} fontSize="sm" color="gray.500">
              Posted on: {new Date(postDate).toLocaleDateString()}
            </Box>

            {connectedUser && (
              <>
                <Textarea
                  mt={2}
                  placeholder="Write a reply..."
                  resize="vertical"
                  bg="gray.800"
                  value={replyBody}
                  onChange={(e) => setReplyBody(e.target.value)}
                />

                <Flex justify="flex-end" mt={2}>
                  <Button colorScheme="blue" onClick={handleReply}>
                    Reply
                  </Button>
                </Flex>
              </>
            )}

            <Text fontWeight="bold" mt={4} mb={2}>
              Comments
            </Text>

            {isLoading ? (
              <Text>Loading replies...</Text>
            ) : repliesError ? (
              <Text>Error loading replies.</Text>
            ) : (
              localReplies.map((reply: any, index: number) => (
                <Box key={index} p={2}>
                  <HStack spacing={2} mb={1}>
                    <AuthorAvatar
                      username={reply.author}
                      boxSize={6}
                      quality="small"
                      borderRadius={100}
                    />
                    <Text fontSize="sm" color="gray.400">
                      {reply.author}
                    </Text>
                  </HStack>
                  <Markdown>{reply.body}</Markdown>
                </Box>
              ))
            )}
          </Box>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default MediaModal;
