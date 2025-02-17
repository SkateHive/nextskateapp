'use client';
import CommentsComponent from "@/app/dao/components/comments";
import AuthorAvatar from "@/components/AuthorAvatar";
import { usePostContext } from "@/contexts/PostContext";
import { useComments } from "@/hooks/comments";
import {
    Box,
    Center,
    Container,
    Divider,
    HStack,
    Heading,
    Table,
    Tbody,
    Td,
    Text,
    Th,
    Thead,
    Tr,
    useToast
} from "@chakra-ui/react";
import { FaDollarSign } from "react-icons/fa";
import ClientMarkdownRenderer from "../ClientMarkdownRenderer";
import VotingButton from "@/components/ButtonVoteComponent/VotingButton";
import { useHiveUser } from "@/contexts/UserContext";
import PostModel from "@/lib/models/post";

function PostContent({ user, postId }: { user: string, postId: string }) {
    const { post } = usePostContext();
    const { comments, updateComments } = useComments(user.substring(3), postId);
    const toast = useToast();
    const connectedUser = useHiveUser();

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
        <Box width={{ base: "95%", lg: "75%" }} color="white" display="flex" flexDirection={{ base: 'column', lg: 'row' }} gap={6}>
            <Box flex={{ base: '1', md: '1.3' }} width="100%" maxWidth="100%" mx="auto">
                <Heading mt={4} size="md" border="1px solid grey" borderRadius={5}>
                    <Box bg="#201d21" borderRadius={5}>
                        <HStack>
                            <Box minW="20%">
                                <Center p={2}>
                                    <AuthorAvatar username={post.author} />
                                </Center>
                            </Box>
                            <Text fontSize={['16px', '18px', '20px', '24px']}>{post.title}</Text>
                            <Text fontSize="15px" fontWeight="bold" color="white" display="flex" alignItems="center" gap={2}>
                                <FaDollarSign />
                                {getTotalPayout(post).toFixed(2)} USD
                            </Text>
                        </HStack>
                    </Box>
                </Heading>
                <Box letterSpacing="0.5px" bg="transparent" color="white" fontSize={['16px', '18px', '20px', '24px']}>
                    <ClientMarkdownRenderer content={post.body} />
                </Box>
                <Container p={4}>
                    <Divider mt={5} />
                    <Center>
                        <Text color={"white"} fontSize="12px">{transformDate(post.created)}</Text>
                    </Center>
                    {post.metadata()?.beneficiaries?.length > 0 && (
                        <Table border="1px solid grey" width="100%" borderRadius="10px">
                            <Thead borderRadius="10px">
                                <Tr borderRadius="10px">
                                    <Th>Beneficiaries</Th>
                                    <Th>Weight</Th>
                                </Tr>
                            </Thead>
                            <Tbody maxW="85%" borderRadius="10px">
                                {post.metadata().beneficiaries.map((beneficiary: any) => (
                                    <Tr key={beneficiary.account}>
                                        <Td>{beneficiary.account}</Td>
                                        <Td>{beneficiary.weight / 100}%</Td>
                                    </Tr>
                                ))}
                            </Tbody>
                        </Table>
                    )}
                </Container>
            </Box>
            <Box flex={{ base: '2', lg: '1' }} width={{ base: '100%', lg: '50%' }} mt={{ base: 15, lg: 6 }} pt={{ base: 1, lg: 4 }} mx="auto" borderRadius="md" shadow="md">
                {connectedUser?.hiveUser && <VotingButton comment={post} username={String(connectedUser.hiveUser.name)} />}
                <Center>
                    <Text mt={5} fontSize="18px">Comments</Text>
                </Center>
                <Box width="100%" overflow="hidden" padding="0">
                    <CommentsComponent author={user.substring(3)} permlink={postId} onCommentPosted={handleCommentPosted} />
                </Box>
            </Box>
        </Box>
    );
}

export default PostContent;
