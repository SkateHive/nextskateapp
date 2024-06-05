import { MarkdownRenderers } from "@/app/upload/utils/MarkdownRenderers";
import AuthorAvatar from "@/components/AuthorAvatar";
import UserAvatar from "@/components/UserAvatar";
import { useHiveUser } from "@/contexts/UserContext";
import { commentWithPrivateKey } from "@/lib/hive/server-functions";
import { transformIPFSContent } from "@/lib/utils";
import {
    Box,
    Button,
    Center,
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
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";

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
            if (!window.hive_keychain) {
                console.error("Hive Keychain extension not found!")
                return
            }
            const username = user.hiveUser?.name
            if (!username) {
                console.error("Username is missing")
                return
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
            }
            const operations = [
                [
                    "comment",
                    postData,
                ],
            ]
            console.log(operations)

            window.hive_keychain.requestBroadcast(
                username,
                operations,
                "posting",
                async (response: any) => {
                    if (response.success) {
                        onClose()
                        console.log("Comment posted successfully")
                    } else {
                        console.error("Error posting comment:", response.message)
                    }
                }
            )

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
                                    placeholder="Write your reply here"
                                    bg="transparent"
                                    _focus={{ border: "#A5D6A7", boxShadow: "none" }}
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
