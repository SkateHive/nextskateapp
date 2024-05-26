import React from "react";
import { Box, Button, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Flex, Textarea, HStack, VStack, Center, Text } from "@chakra-ui/react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import { MarkdownRenderers } from "@/app/upload/utils/MarkdownRenderers";
import { transformIPFSContent } from "@/lib/utils";
import AuthorAvatar from "@/components/AuthorAvatar";
import UserAvatar from "@/components/UserAvatar";
import { useHiveUser } from "@/contexts/UserContext";
interface ReplyModalProps {
    isOpen: boolean;
    onClose: () => void;
    comment: any;
}

const ReplyModal = ({ isOpen, onClose, comment }: ReplyModalProps) => {
    const user = useHiveUser();
    return (
        <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
            <ModalOverlay style={{ backdropFilter: "blur(5px)" }} />
            <ModalContent w={{ base: "100%", md: "75%" }} h={"auto"} border={"0.6px solid grey"} bg={"black"} borderRadius="md" mx={4}>
                <ModalHeader >

                </ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <VStack align="start" spacing={4} position="relative">
                        <Flex align="start" w="full">
                            <AuthorAvatar username={comment.author} borderRadius={100} />
                            <VStack>
                                <Center>

                                    <Box ml={3}>

                                        <ReactMarkdown
                                            components={MarkdownRenderers}
                                            rehypePlugins={[rehypeRaw]}
                                            remarkPlugins={[remarkGfm]}
                                        >
                                            {transformIPFSContent(comment.body)}
                                        </ReactMarkdown>
                                    </Box>

                                </Center>

                            </VStack>

                        </Flex>

                        <Box
                            position="absolute"
                            left="24px"
                            top="60px"
                            bottom="120px"
                            width="2px"
                            bg="gray.600"
                        />
                        <Flex align="start" w="full" direction={{ base: "column", md: "row" }}>
                            {user.hiveUser && (

                                <UserAvatar
                                    hiveAccount={user?.hiveUser}
                                    borderRadius={100}
                                    boxSize={12}
                                />

                            )}
                            <VStack align="start" w="full">
                                <Text ml={5} color="gray.400">
                                    replying to @{comment.author}
                                </Text>
                                <Textarea
                                    // ml={{ base: 0, md: 5 }}
                                    // mt={{ base: 4, md: 0 }}
                                    placeholder="Vomit your thoughts here"
                                    bg="transparent"
                                    _focus={{ border: "limegreen", boxShadow: "none" }}
                                    resize="none"
                                    flex={1}
                                    minHeight="100px"
                                    borderRadius="xl"
                                    border={"1px solid grey"}
                                />
                            </VStack>
                        </Flex>
                    </VStack>
                </ModalBody>
                <ModalFooter borderTop="1px solid" borderColor="gray.700">

                    <Button variant={"outline"} colorScheme="green">
                        Reply
                    </Button>
                </ModalFooter>
            </ModalContent >
        </Modal >
    )
}

export default ReplyModal;
