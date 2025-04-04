'use client';
import CommentsComponent from "@/app/dao/components/comments";
import AuthorAvatar from "@/components/AuthorAvatar";
import { usePostContext } from "@/contexts/PostContext";
import { useComments } from "@/hooks/comments";
import {
    Box,
    Center,
    Divider,
    HStack,
    Heading,
    Text,
    useToast,
    VStack,
    useDisclosure,
    Button,
    useBreakpointValue,
    Container
} from "@chakra-ui/react";
import { FaDollarSign, FaCommentAlt, FaShare, FaShareAlt } from "react-icons/fa";
import ClientMarkdownRenderer from "../ClientMarkdownRenderer";
import VotingButton from "@/components/ButtonVoteComponent/VotingButton";
import { useHiveUser } from "@/contexts/UserContext";
import PostModel from "@/lib/models/post";
import {
    Drawer,
    DrawerBody,
    DrawerFooter,
    DrawerHeader,
    DrawerOverlay,
    DrawerContent,
    DrawerCloseButton,
} from "@chakra-ui/react";
import { useState } from "react";
import SocialModal from "@/app/upload/components/socialsModal";

function PostContent({ user, postId }: { user: string, postId: string }) {
    const { post } = usePostContext();
    const { comments, updateComments } = useComments(user.substring(3), postId);
    const toast = useToast();
    const connectedUser = useHiveUser();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const drawerPlacement = useBreakpointValue<"bottom" | "right">({ base: 'bottom', lg: 'right' });
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [shareUrl, setShareUrl] = useState<string | null>(null);


    if (!post) {
        return <Text>404 - Post not found</Text>;
    }

    const transformDate = (date: string) => new Date(date).toLocaleDateString();

    const getTotalPayout = (post: PostModel) => {
        const parsePayoutValue = (value: string) => parseFloat(value.split(" ")[0]) || 0;
        const payoutKeys: (keyof PostModel)[] = ['total_payout_value', 'pending_payout_value', 'curator_payout_value'];
        return payoutKeys
            .map(key => parsePayoutValue(post[key]?.toString() || '0'))
            .reduce((acc, val) => acc + val, 0);
    };

    const handleCommentPosted = () => {
        updateComments();
        toast({
            title: "Comment added!",
            status: "success",
            duration: 2000,
            isClosable: true,
        });
    };

    return (
        <>
            {isShareModalOpen && (
                <SocialModal
                    isOpen={isShareModalOpen}
                    onClose={() => setIsShareModalOpen(false)}
                    postUrl={shareUrl || ""}
                    content={post.body}
                    aiSummary={post.title}
                />
            )}
            <Box
                mt={{ base: "0px", lg: "30px" }}
                overflow="hidden"
                boxShadow="0px 4px 12px rgba(0, 0, 0, 0.2)"
                bg="linear-gradient(to bottom,rgb(5, 37, 4),rgb(29, 33, 31))"
                border="1px solid #3a3639"
            >
                <Box p={{ base: 3, md: 4 }}>
                    <VStack spacing={{ base: 3, md: 4 }} align="stretch">
                        <HStack
                            spacing={{ base: 3, md: 4 }}
                            alignItems="center"
                            flexDir={"row"}
                        >
                            <Box
                                borderRadius="full"
                                borderWidth="2px"
                                borderColor="green.400"
                                p="2px"
                            >
                                <AuthorAvatar username={post.author} boxSize={70} borderRadius={999} />
                            </Box>
                            <VStack align={{ base: "center", sm: "start" }} spacing={1} flex="1">
                                <Text
                                    fontSize={{ base: "sm", md: "md" }}
                                    color="green.300"
                                    fontWeight="bold"
                                >
                                    @{post.author}
                                </Text>
                                <Heading
                                    fontSize={{ base: "xl", md: "2xl" }}
                                    fontWeight="bold"
                                    textAlign={{ base: "center", sm: "left" }}
                                    lineHeight="1.2"
                                    color="white"
                                    fontFamily="Joystix"
                                >
                                    {post.title}
                                </Heading>
                                <Text fontSize="xs" color="gray.400">{transformDate(post.created)}</Text>
                            </VStack>
                        </HStack>

                        <Divider borderColor="gray.600" />

                        <HStack
                            justifyContent="space-between"
                            width="100%"
                            spacing={0}
                        >
                            <Box display="flex" alignItems="center" gap={3}>
                                {connectedUser?.hiveUser && (
                                    <VotingButton
                                        comment={post}
                                        username={String(connectedUser.hiveUser.name)}
                                        onVoteSuccess={function (voteType: string, voteValue: number): void {
                                            throw new Error("Function not implemented.");
                                        }}
                                    />
                                )}

                                <Button
                                    aria-label="Open Comments"
                                    leftIcon={<FaCommentAlt />}
                                    onClick={onOpen}
                                    colorScheme="green"
                                    variant="ghost"
                                    size={{ base: "sm", md: "md" }}
                                    borderRadius="full"
                                >
                                    <Text fontWeight="bold">{comments.length}</Text>
                                </Button>
                                <Button
                                    aria-label="Open Share Modal"
                                    leftIcon={<FaShareAlt />}
                                    onClick={() => {
                                        setIsShareModalOpen(true);
                                        setShareUrl(`https://www.skatehive.app/@${post.author}/${post.permlink}`);
                                    }
                                    }
                                    colorScheme="green"
                                    variant="ghost"
                                    size={{ base: "sm", md: "md" }}
                                    borderRadius="full"
                                >
                                    Share
                                </Button>

                            </Box>

                            <Box>
                                <Box
                                    bg="rgba(0, 150, 0, 0.2)"
                                    px={3}
                                    py={1}
                                    borderRadius="full"
                                >
                                    <Text
                                        fontSize={{ base: "sm", md: "md" }}
                                        fontWeight="bold"
                                        color="green.200"
                                        display="flex"
                                        alignItems="center"
                                        gap={1}
                                    >
                                        <FaDollarSign /> {getTotalPayout(post).toFixed(2)} USD
                                    </Text>
                                </Box>
                            </Box>
                        </HStack>
                    </VStack>
                </Box>
            </Box>
            <Container maxW="container.md" color="white" mt={2} p={0} bg="black">

                <Box bg="transparent" color="white" maxH={`calc(100vh - 200px)`} overflow="auto" borderRadius="md">
                    <ClientMarkdownRenderer content={post.body} />
                </Box>
                <Center>
                    <Text color={"white"} fontSize="12px">{transformDate(post.created)}</Text>
                </Center>
                <Drawer isOpen={isOpen} placement={drawerPlacement} onClose={onClose} size={{ base: "sm", lg: "sm" }}>
                    <DrawerOverlay />
                    <DrawerContent bg="black">
                        <DrawerCloseButton />
                        <DrawerHeader>Comments</DrawerHeader>
                        <DrawerBody maxH={{ base: `calc(100vh - 40vh)`, lg: "100%" }} overflow="auto">
                            <CommentsComponent author={user.substring(3)} permlink={postId} onCommentPosted={handleCommentPosted} />
                        </DrawerBody>
                        <DrawerFooter>
                            <Button variant="outline" mr={3} onClick={onClose}>
                                Close
                            </Button>
                        </DrawerFooter>
                    </DrawerContent>
                </Drawer>
            </Container>
        </>
    );
}

export default PostContent;
