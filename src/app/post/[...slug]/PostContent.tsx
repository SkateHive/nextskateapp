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
} from "@chakra-ui/react";
import { FaDollarSign, FaComment } from "react-icons/fa";
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
import { useEffect } from "react";

function PostContent({ user, postId }: { user: string, postId: string }) {
    const { post } = usePostContext();
    const { comments, updateComments } = useComments(user.substring(3), postId);
    const toast = useToast();
    const connectedUser = useHiveUser();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const drawerPlacement = useBreakpointValue<"bottom" | "right">({ base: 'bottom', lg: 'right' });

    useEffect(() => {
        onOpen();
    }, []);

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
            <Heading mt={{ base: "0px", lg: "20px" }} size="md" border="1px solid grey" borderRadius={5}>
                <Box bg="#201d21" borderRadius={5} p={4}>
                    <VStack spacing={4} align="stretch">
                        <HStack spacing={4} justifyContent={"space-between"}>
                            <AuthorAvatar username={post.author} />
                            <Center flex="1">
                                <Text fontSize="1.2em" fontWeight="bold">{post.title}</Text>
                            </Center>
                        </HStack>
                        <Divider />
                        <HStack justifyContent="space-between" alignItems="center">
                            <Text fontSize="15px" fontWeight="bold" color="white" display="flex" alignItems="center" gap={2}>
                                <FaDollarSign /> {getTotalPayout(post).toFixed(2)} USD
                            </Text>
                            {connectedUser?.hiveUser && (
                                <HStack spacing={4} alignItems="center">
                                    <VotingButton comment={post} username={String(connectedUser.hiveUser.name)} />
                                    <Button
                                        aria-label="Open Comments"
                                        leftIcon={<FaComment />}
                                        onClick={onOpen}
                                        colorScheme="green"
                                        variant="ghost"
                                    >
                                        <Text color={"green.200"} fontWeight={"bold"}                                        >{comments.length}</Text>
                                    </Button>
                                </HStack>
                            )}
                        </HStack>
                    </VStack>
                </Box>
            </Heading>
            <Box bg="transparent" color="white" m={2} maxH={`calc(100vh - 200px)`} overflow="auto" borderRadius="md">
                <ClientMarkdownRenderer content={post.body} />
            </Box>
            <Center>
                <Text color={"white"} fontSize="12px">{transformDate(post.created)}</Text>
            </Center>
            <Drawer isOpen={isOpen} placement={drawerPlacement} onClose={onClose}>
                <DrawerOverlay />
                <DrawerContent bg="black">
                    <DrawerCloseButton />
                    <DrawerHeader>Comments</DrawerHeader>
                    <DrawerBody>
                        <CommentsComponent author={user.substring(3)} permlink={postId} onCommentPosted={handleCommentPosted} />
                    </DrawerBody>
                    <DrawerFooter>
                        <Button variant="outline" mr={3} onClick={onClose}>
                            Close
                        </Button>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
        </>
    );
}

export default PostContent;
