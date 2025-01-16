import AuthorAvatar from "@/components/AuthorAvatar";
import UserAvatar from "@/components/UserAvatar";
import { useHiveUser } from "@/contexts/UserContext";
import { commentWithPrivateKey } from "@/lib/hive/server-functions";
import {
    Box,
    Button,
    Flex,
    HStack,
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
import { useState } from "react";
import CarrouselRenderer from "../utils/CarrouselRenderer";

interface ReplyModalProps {
    isOpen: boolean;
    onClose: () => void;
    comment: any;
    onNewComment: (comment: any) => void;
}

type MediaItem = {
    type: 'image' | 'video';
    url: string;
};

const extractMediaItems = (markdown: string): MediaItem[] => {
    const imageRegex = /!\[.*?\]\((.*?)\)/g;
    const iframeRegex = /<iframe[^>]+src="([^"]+)"[^>]*>/g;
    const mediaItems: MediaItem[] = [];

    let match;
    while ((match = imageRegex.exec(markdown))) {
        mediaItems.push({ type: 'image', url: match[1] });
    }
    while ((match = iframeRegex.exec(markdown))) {
        mediaItems.push({ type: 'video', url: match[1] });
    }
    return mediaItems;
};

const ReplyModal = ({ isOpen, onClose, comment, onNewComment }: ReplyModalProps) => {
    const user = useHiveUser();
    const [replyBody, setReplyBody] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [editedCommentBody, setEditedCommentBody] = useState(comment.body);

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
                    title: "reply",
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
    const loginMethod = localStorage.getItem("LoginMethod");
    return (
        <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
            <ModalOverlay style={{ backdropFilter: "blur(5px)" }} />
            <ModalContent color={"white"} w={{ base: "100%", md: "75%" }} bg="black" border="0.6px solid grey" borderRadius="20px" mx={8}>
                <ModalHeader>
                    <ModalCloseButton />
                </ModalHeader>
                <ModalBody>
                    {loginMethod ? (
                        <VStack align="start" spacing={4} position="relative">
                            <Flex align="start" w="100%">
                                <AuthorAvatar username={comment.author} borderRadius={100} />
                                <HStack justify={"space-between"} width={"full"}>
                                    <CarrouselRenderer mediaItems={extractMediaItems(comment.body)} />
                                </HStack>
                            </Flex>
                            <Box position="absolute" left="24px" top="60px" bottom="120px" width="2px" bg="gray.600" />
                            <Flex align="start" w="full" direction={{ base: "column", md: "row" }}>
                                {user.hiveUser && <UserAvatar hiveAccount={user.hiveUser} borderRadius={100} boxSize={12} />}
                                <VStack align="start" w="full">
                                    <>
                                        <Text ml={5} color="gray.400">
                                            replying to @{comment.author}
                                        </Text>
                                        <Textarea
                                            value={replyBody}
                                            onChange={(e) => setReplyBody(e.target.value)}
                                            placeholder="Write your reply here"
                                            bg="transparent"
                                            _focus={{ border: "#A5D6A7", boxShadow: "none" }}
                                            resize="none"
                                            minHeight="100px"
                                            borderRadius="xl"
                                            border="1px solid grey"
                                        />
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
