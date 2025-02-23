import AuthorAvatar from "@/components/AuthorAvatar";
import UserAvatar from "@/components/UserAvatar";
import { useHiveUser } from "@/contexts/UserContext";
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
    VStack
} from "@chakra-ui/react";
import * as dhive from "@hiveio/dhive";
import { useState, useRef, useEffect } from "react";
import CarrouselRenderer from "../utils/CarrouselRenderer";
import ClientMarkdownRenderer from "@/app/post/ClientMarkdownRenderer";

// Assuming MediaItem is defined in your project
type MediaItem = {
    type: 'video' | 'image';
    url: string;
};

interface ReplyModalProps {
    isOpen: boolean;
    onClose: () => void;
    comment: dhive.Discussion;
    onNewComment: (comment: any) => void;
    mediaItems: MediaItem[];  // Add mediaItems prop
}

const ReplyModal = ({ isOpen, onClose, comment, onNewComment, mediaItems }: ReplyModalProps) => {
    const user = useHiveUser();
    const [replyBody, setReplyBody] = useState("");
    const [error, setError] = useState<string | null>(null);
    const loginMethod = localStorage.getItem("LoginMethod");
    const initialRef = useRef(null);  // add an initial focus ref

    // Track media items for re-rendering
    const [modalMediaItems, setModalMediaItems] = useState<MediaItem[]>([]);

    useEffect(() => {
        if (isOpen) {
            console.log("Modal opened, setting media items:", mediaItems);
            setModalMediaItems(mediaItems);
        }
    }, [isOpen, mediaItems]);

    const handleReply = async () => {
        const loginMethod = localStorage.getItem("LoginMethod");
        const username = user.hiveUser?.name;

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
                const username = user.hiveUser?.name;
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
                        author: String(user.hiveUser?.name),
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
                        author: String(user.hiveUser?.name),
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

                await commentWithPrivateKey(localStorage.getItem("EncPrivateKey")!, postOperation, commentOptions);
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
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size="lg"
            isCentered
            initialFocusRef={initialRef}  // ensure focus is set to a known element
        >
            <ModalOverlay />
            <ModalContent
                color={"white"}
                bg="black"
                border="0.6px solid grey"
                borderRadius="20px"
                mx={8}
            >
                <ModalHeader>
                    <ModalCloseButton ref={initialRef} />
                </ModalHeader>
                <ModalBody>
                    {loginMethod ? (
                        <VStack align="start" spacing={4} position="relative">
                            <Flex align="start" w="100%" zIndex={666}>
                                <AuthorAvatar username={comment.author} borderRadius={100} />
                                {modalMediaItems.length > 1 ? (
                                    <CarrouselRenderer key={modalMediaItems.length} mediaItems={modalMediaItems} />
                                ) : (
                                    modalMediaItems.length === 1 ? (
                                        modalMediaItems.map((_media, index) => (
                                            <ClientMarkdownRenderer key={index} content={comment.body} />
                                        ))
                                    ) : (
                                        <ClientMarkdownRenderer content={comment.body} />
                                    )
                                )}
                            </Flex>
                            <Box
                                position="absolute"
                                left="48px" // Adjust alignment to better match avatars
                                top="72px" // Start slightly lower than the author avatar
                                bottom="24px" // Ensure it doesn't extend too far
                                width="2px"
                                bgGradient="linear(to-b, gray.600, gray.500)" // Subtle gradient for better integration
                                opacity={0.8} // Slight transparency for a softer look
                                zIndex={-1} // Ensure it stays behind avatars & text

                            />
                            <Flex align="start" w="full" direction={{ base: "column", md: "row" }}>
                                {user.hiveUser && <UserAvatar hiveAccount={user.hiveUser} borderRadius={100} boxSize={12} />}
                                <VStack align="start" w="full">
                                    <>
                                        <Text ml={5} color="gray.400">
                                            replying to @{comment.author}
                                        </Text>
                                        {user.hiveUser && (
                                            <Textarea
                                                value={replyBody}
                                                onChange={(e) => setReplyBody(e.target.value)}
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
                                        )}
                                        {error && (
                                            <Text color="red.500" mt={2}>
                                                {error}
                                            </Text>
                                        )}
                                    </>
                                </VStack>
                            </Flex>
                        </VStack>
                    ) : (
                        <Text fontFamily="Creepster" fontSize="42px" color={"#A5D6A7"} textAlign="center">
                            Please login to your Hive account!
                        </Text>
                    )}
                </ModalBody>
                <ModalFooter borderTop="1px solid" borderColor="gray.700">
                    {loginMethod ? (
                        <Button onClick={handleReply} variant="outline" colorScheme="green">
                            Reply
                        </Button>
                    ) : (
                        <Text fontSize="18px" color="gray.500" textAlign="center" width="full">
                            Please login to enable replying to comments.
                        </Text>
                    )}
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};
export default ReplyModal;
