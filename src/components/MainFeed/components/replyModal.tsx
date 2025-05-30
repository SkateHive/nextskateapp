import AuthorAvatar from "@/components/AuthorAvatar";
import UserAvatar from "@/components/UserAvatar";
import { useUserData } from "@/contexts/UserContext";
import { commentWithPrivateKey } from "@/lib/hive/server-functions";
import {
  Box,
  Button,
  Flex,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  Textarea,
  VStack,
} from "@chakra-ui/react";
import * as dhive from "@hiveio/dhive";
import React, {
  useState,
  useRef,
  useMemo,
  useCallback,
  useEffect,
} from "react";
import CarrouselRenderer from "../utils/CarrouselRenderer";
import ClientMarkdownRenderer from "@/app/post/ClientMarkdownRenderer";
import VideoRenderer from "@/app/upload/utils/VideoRenderer"; // Import VideoRenderer

// Assuming MediaItem is defined in your project
type MediaItem = {
  type: "video" | "image";
  url: string;
};

interface ReplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  comment: dhive.Discussion;
  onNewComment: (comment: any) => void;
  mediaItems: MediaItem[];
}

// Adjusted CommentContent component
const CommentContent = React.memo(
  ({
    comment,
    mediaItems,
    carrousel,
  }: {
    comment: dhive.Discussion;
    mediaItems: MediaItem[];
    carrousel: React.ReactNode;
  }) => {
    return (
      <Flex align="start" w="100%" direction="column" gap={4}>
        <Flex align="center" gap={2}>
          <AuthorAvatar username={comment.author} borderRadius={100} />
          <Text fontWeight="bold" fontSize="lg" color="white">
            {`Reply to @${comment.author}`}
          </Text>
        </Flex>

        {/* Media container - updated for better video display */}
        {mediaItems.length > 0 && (
          <Box
            width="100%"
            minHeight={mediaItems[0].type === "video" ? "300px" : "250px"}
            bg="black"
            borderRadius="md"
            padding={mediaItems[0].type === "video" ? "0 0 40px 0" : "0"}
            overflow="visible"
            position="relative"
          >
            {mediaItems[0].type === "video" ? (
              <Box
                position="relative"
                width="100%"
                height="100%"
                paddingBottom="20px"
              >
                <VideoRenderer
                  src={mediaItems[0].url}
                  loop={false}
                  width="100%"
                  autoPlay={false} // Prevent autoplay in modal
                  muted={false} // Allow sound
                  style={{
                    width: "100%",
                    margin: "0 auto",
                  }}
                />
              </Box>
            ) : (
              <Box
                as="img"
                src={mediaItems[0].url}
                alt="Media content"
                maxWidth="100%"
                maxHeight="250px"
                objectFit="contain"
                margin="0 auto"
              />
            )}
          </Box>
        )}

        {/* Render carousel if there are multiple media items */}
        {carrousel && (
          <Box width="100%" overflow="hidden">
            {carrousel}
          </Box>
        )}
      </Flex>
    );
  }
);

// Separate component for the textarea (will re-render when typing)
const ReplyInput = React.memo(
  ({
    value,
    onChange,
    error,
    username,
  }: {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    error: string | null;
    username: string;
  }) => {
    return (
      <>
        <Textarea
          value={value}
          onChange={onChange}
          placeholder="What is your fucking opinion about this?"
          size="lg"
          bg="gray.800"
          color="white"
          _placeholder={{ color: "gray.500" }}
          resize="none"
          borderRadius="lg"
          p={4}
          w="full"
          h="200px"
        />
        {error && (
          <Text color="red.500" mt={2}>
            {error}
          </Text>
        )}
      </>
    );
  }
);

const ReplyModal = React.memo(
  ({ isOpen, onClose, comment, onNewComment, mediaItems }: ReplyModalProps) => {
    console.log("ReplyModal rendering for:", comment.author); // Debug re-renders

    const user = useUserData();
    const [replyBody, setReplyBody] = useState("");
    const [error, setError] = useState<string | null>(null);
    const loginMethod = localStorage.getItem("LoginMethod");
    const initialRef = useRef(null);

    // Memoize CarrouselRenderer to avoid unnecessary reloads
    const carrousel = useMemo(() => {
      console.log("Creating carrousel");
      if (mediaItems.length > 1) {
        return <CarrouselRenderer mediaItems={mediaItems} />;
      }
      return null;
    }, [mediaItems]);

    // Memoize the handleReply function to avoid recreating it on every render
    const handleReplyCallback = useCallback(async () => {
      const loginMethod = localStorage.getItem("LoginMethod");
      const username = user?.name;

      if (!loginMethod || !username) {
        setError("You must be logged in to respond.");
        return;
      }
      const newPermLink = `${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;

      try {
        if (loginMethod === "keychain") {
          if (!window.hive_keychain) {
            throw new Error("Hive Keychain extension not found!");
          }
          const username = user?.name;
          if (!username) {
            throw new Error("Username is missing");
          }

          const postData = {
            parent_author: comment.author,
            parent_permlink: comment.permlink,
            author: username,
            permlink: newPermLink,
            title: `Reply to ${comment.author}`,
            body: replyBody,
            json_metadata: JSON.stringify({
              tags: ["skateboard"],
              app: "skatehive",
            }),
          };
          const operations = [["comment", postData]];

          window.hive_keychain.requestBroadcast(
            username,
            operations,
            "posting",
            (response: any) => {
              if (response.success) {
                onNewComment({
                  ...postData,
                  id: newPermLink,
                });
                setReplyBody("");
                onClose();
              } else {
                throw new Error("Error posting comment: " + response.message);
              }
            }
          );
        } else if (loginMethod === "privateKey") {
          const commentOptions: dhive.CommentOptionsOperation = [
            "comment_options",
            {
              author: String(user?.name),
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

          const postOperation: dhive.CommentOperation = [
            "comment",
            {
              parent_author: comment.author,
              parent_permlink: comment.permlink,
              author: String(user?.name),
              permlink: newPermLink,
              title: `Reply to ${comment.author}`,
              body: replyBody,
              json_metadata: JSON.stringify({
                tags: ["skateboard"],
                app: "Skatehive App",
                image: "/SKATE_HIVE_VECTOR_FIN.svg",
              }),
            },
          ];

          await commentWithPrivateKey(
            localStorage.getItem("EncPrivateKey")!,
            postOperation,
            commentOptions
          );
          onNewComment({
            ...postOperation[1],
            id: newPermLink,
          });
          setReplyBody("");
          onClose();
        }
      } catch (error: any) {
        setError(error.message);
      }
    }, [user, replyBody, comment, onNewComment, onClose]);

    const handleTextChange = useCallback(
      (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setReplyBody(e.target.value);
      },
      []
    );

    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="lg"
        isCentered
        initialFocusRef={initialRef}
      >
        <ModalOverlay />
        <ModalContent
          color="white"
          bg="black"
          border="0.6px solid grey"
          borderRadius="10px"
          mx={4}
          p={4} // Add padding for better spacing
        >
          <ModalHeader>
            <ModalCloseButton ref={initialRef} />
          </ModalHeader>
          <ModalBody>
            {loginMethod ? (
              <VStack align="start" spacing={6}>
                {/* Updated CommentContent */}
                <CommentContent
                  comment={comment}
                  mediaItems={mediaItems}
                  carrousel={carrousel}
                />
                <Flex
                  align="start"
                  w="full"
                  direction={{ base: "column", md: "row" }}
                  gap={4}
                >
                  {user && (
                    <UserAvatar
                      hiveAccount={user}
                      borderRadius={100}
                      boxSize={12}
                    />
                  )}
                  <VStack align="start" w="full">
                    {user && (
                      <ReplyInput
                        value={replyBody}
                        onChange={handleTextChange}
                        error={error}
                        username={comment.author}
                      />
                    )}
                  </VStack>
                </Flex>
              </VStack>
            ) : (
              <Text
                fontFamily="Creepster"
                fontSize="42px"
                color="#A5D6A7"
                textAlign="center"
              >
                Please login to your Hive account!
              </Text>
            )}
          </ModalBody>
          <ModalFooter borderTop="1px solid" borderColor="gray.700">
            {loginMethod ? (
              <Button
                onClick={handleReplyCallback}
                variant="outline"
                colorScheme="green"
              >
                Reply
              </Button>
            ) : (
              <Text
                fontSize="18px"
                color="gray.500"
                textAlign="center"
                width="full"
              >
                Please login to enable replying to comments.
              </Text>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
  }
);

export default ReplyModal;
