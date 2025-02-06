import {
    Box, Modal, ModalOverlay, ModalContent, ModalCloseButton,
    ModalBody, Flex, Image, Text, Textarea, Button, useBreakpointValue,
    HStack
} from "@chakra-ui/react";
import { MediaItem } from "@/lib/utils";
import VideoRenderer from "@/app/upload/utils/VideoRenderer";
import { useComments } from "@/hooks/comments";
import { Discussion } from "@hiveio/dhive";
import AuthorAvatar from "../AuthorAvatar";
import { useState, useEffect } from "react";
import { HiveAccount } from "@/lib/useHiveAuth";
import { commentWithPrivateKey } from "@/lib/hive/server-functions";
import * as dhive from "@hiveio/dhive";

// Define extended media type with attached comment.
type ExtendedMediaItem = MediaItem & { comment: Discussion };

interface MediaModalProps {
    media: ExtendedMediaItem;
    isOpen: boolean;
    onClose: () => void;
    onNewComment: (comment: any) => void;
    user: HiveAccount;
}

const MediaModal = ({ media, isOpen, onClose, user, onNewComment }: MediaModalProps) => {
    const modalSize = useBreakpointValue({ base: "full", md: "5xl" });
    const isMobile = useBreakpointValue({ base: true, md: false });
    const [replyBody, setReplyBody] = useState(""); // Added state for reply input
    const [error, setError] = useState<string | null>(null); // Moved error state to component level
    const { comments: replyComments, isLoading: repliesLoading, error: repliesError } =
        useComments(media.comment.author, media.comment.permlink, false);

    // New state to hold optimistic replies
    const [localReplies, setLocalReplies] = useState<any[]>(replyComments);

    // Update localReplies when hook replies change
    useEffect(() => {
        setLocalReplies(replyComments);
    }, [replyComments]);

    const loginMethod = localStorage.getItem("LoginMethod");

    const handleReply = async () => {
        const loginMethod = localStorage.getItem("LoginMethod");
        const username = user.name;

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
                const username = user.name;
                if (!username) {
                    throw new Error("Username is missing");
                }

                const postData = {
                    parent_author: media.comment.author,
                    parent_permlink: media.comment.permlink,
                    author: username,
                    permlink: newPermLink,
                    title: `Reply to ${media.comment.author}`,
                    body: replyBody, // Completed body using replyBody state
                    json_metadata: JSON.stringify({
                        tags: ["skateboard"],
                        app: "skatehive",
                    }),
                };
                const operations = [
                    [
                        "comment",
                        postData,
                    ],
                ];

                window.hive_keychain.requestBroadcast(
                    username,
                    operations,
                    "posting",
                    (response: any) => {
                        if (response.success) {
                            const newComment = {
                                ...postData,
                                id: newPermLink,
                            };
                            onNewComment(newComment);
                            setLocalReplies(prev => [newComment, ...prev]);
                            setReplyBody("");
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
                        parent_author: media.comment.author,
                        parent_permlink: media.comment.permlink,
                        author: String(user?.name),
                        permlink: newPermLink,
                        title: `Reply to ${media.comment.author}`,
                        body: replyBody, // Completed body using replyBody state
                        json_metadata: JSON.stringify({
                            tags: ["skateboard"],
                            app: "Skatehive App",
                            image: "/SKATE_HIVE_VECTOR_FIN.svg",
                        }),
                    },
                ];

                await commentWithPrivateKey(localStorage.getItem("EncPrivateKey")!, postOperation, commentOptions);
                const newComment = {
                    ...postOperation[1],
                    id: newPermLink,
                };
                onNewComment(newComment);
                setLocalReplies(prev => [newComment, ...prev]);
                setReplyBody("");
            }
        } catch (error: any) {
            setError(error.message);
        }
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
                <ModalBody p={0} display="flex" flexDirection={{ base: "column", md: "row" }}>
                    {/* Media Section */}
                    <Box
                        flex="1"
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                        bg="black"
                        h={{ base: "60vh", md: "auto" }}
                    >
                        {media.type === "image" ? (
                            <Image
                                src={media.url}
                                alt="Selected media"
                                maxW="100%"
                                maxH="100%"
                                objectFit="contain"
                            />
                        ) : (

                            <VideoRenderer
                                src={media.url}
                            />

                        )}
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
                            <AuthorAvatar username={media.comment.author} boxSize={10} quality="small" borderRadius={100} />
                            <Text fontWeight="bold">{media.comment.author}</Text>
                        </Flex>

                        <Text mb={4}>{media.subtitle}</Text>

                        <Textarea
                            mt={2}
                            placeholder="Write a reply..."
                            resize="vertical"
                            bg="gray.800"
                            value={replyBody}                         // Bind value
                            onChange={(e) => setReplyBody(e.target.value)} // Update on change
                        />

                        <Flex justify="flex-end" mt={2}>
                            <Button colorScheme="blue" onClick={handleReply}>Reply</Button>
                        </Flex>

                        <Text fontWeight="bold" mt={4} mb={2}>Comments</Text>

                        {repliesLoading ? (
                            <Text>Loading replies...</Text>
                        ) : repliesError ? (
                            <Text>Error loading replies.</Text>
                        ) : (
                            localReplies.map((reply: any, index: number) => (
                                <Box key={index} p={2}>
                                    <HStack spacing={2} mb={1}>
                                        <AuthorAvatar username={reply.author} boxSize={6} quality="small" borderRadius={100} />
                                        <Text fontSize="sm" color="gray.400">{reply.author}</Text>
                                    </HStack>
                                    <Text>{reply.body}</Text>
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
