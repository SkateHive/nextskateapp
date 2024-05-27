import React, { useState } from "react";
import {
    Box,
    Button,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Flex,
    Textarea,
    VStack,
    Center,
    Text,
} from "@chakra-ui/react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import { MarkdownRenderers } from "@/app/upload/utils/MarkdownRenderers";
import { transformIPFSContent } from "@/lib/utils";
import AuthorAvatar from "@/components/AuthorAvatar";
import UserAvatar from "@/components/UserAvatar";
import { useHiveUser } from "@/contexts/UserContext";
import { commentWithPrivateKey } from "@/lib/hive/server-functions";
import * as dhive from "@hiveio/dhive";

interface ReplyModalProps {
    isOpen: boolean;
    onClose: () => void;
    comment: any;
}

const ReplyModal = ({ isOpen, onClose, comment }: ReplyModalProps) => {
    const user = useHiveUser();
    const [replyBody, setReplyBody] = useState("");

    const handleReply = async () => {
        const loginMethod = localStorage.getItem("LoginMethod");
        const newPermLink = `${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;

        if (loginMethod === "keychain") {
            alert("KeyChain Login");
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
                        image: "/skatehive_square_green.png",
                    }),
                },
            ];

            try {
                await commentWithPrivateKey(localStorage.getItem("EncPrivateKey")!, postOperation, commentOptions);
                setReplyBody("");
            } catch (error: any) {
                console.error("Error posting comment:", error.message);
            }
        }
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
            <ModalOverlay style={{ backdropFilter: "blur(5px)" }} />
            <ModalContent w={{ base: "100%", md: "75%" }} bg="black" border="0.6px solid grey" borderRadius="md" mx={4}>
                <ModalHeader>
                    <ModalCloseButton />
                </ModalHeader>
                <ModalBody>
                    <VStack align="start" spacing={4} position="relative">
                        <Flex align="start" w="full">
                            <AuthorAvatar username={comment.author} borderRadius={100} />
                            <VStack>
                                <Center>
                                    <Box ml={3}>
                                        <ReactMarkdown components={MarkdownRenderers} rehypePlugins={[rehypeRaw]} remarkPlugins={[remarkGfm]}>
                                            {transformIPFSContent(comment.body)}
                                        </ReactMarkdown>
                                    </Box>
                                </Center>
                            </VStack>
                        </Flex>
                        <Box position="absolute" left="24px" top="60px" bottom="120px" width="2px" bg="gray.600" />
                        <Flex align="start" w="full" direction={{ base: "column", md: "row" }}>
                            {user.hiveUser && <UserAvatar hiveAccount={user.hiveUser} borderRadius={100} boxSize={12} />}
                            <VStack align="start" w="full">
                                <Text ml={5} color="gray.400">
                                    replying to @{comment.author}
                                </Text>
                                <Textarea
                                    value={replyBody}
                                    onChange={(e) => setReplyBody(e.target.value)}
                                    placeholder="Vomit your thoughts here"
                                    bg="transparent"
                                    _focus={{ border: "limegreen", boxShadow: "none" }}
                                    resize="none"
                                    minHeight="100px"
                                    borderRadius="xl"
                                    border="1px solid grey"
                                />
                            </VStack>
                        </Flex>
                    </VStack>
                </ModalBody>
                <ModalFooter borderTop="1px solid" borderColor="gray.700">
                    <Button onClick={handleReply} variant="outline" colorScheme="green">
                        Reply
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default ReplyModal;
