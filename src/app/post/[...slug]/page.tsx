"use client"
import CommentsComponent from "@/app/dao/components/comments";
import AuthorAvatar from "@/components/AuthorAvatar";
import VoteButton from "@/components/ButtonVoteComponent/VoteButtonModal";
import HiveClient from "@/lib/hive/hiveclient";
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
  VStack,
  useToast
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { FaDollarSign } from "react-icons/fa";
import ClientMarkdownRenderer from "../ClientMarkdownRenderer";

interface Post {
  author: string;
  title: string;
  body: string;
  permlink: string;
  created: string;
  beneficiaries: Array<{ account: string; weight: number }>;
  total_payout_value: string;
  pending_payout_value: string;
  curator_payout_value: string;
  json_metadata: string;
}

async function getData(user: string, postId: string): Promise<Post> {
  const postContent = await HiveClient.database.call("get_content", [
    user.substring(3),
    postId,
  ]);
  if (!postContent) throw new Error("Failed to fetch post content");

  return postContent;
}

async function getComments(user: string, postId: string) {
  const comments = await HiveClient.database.call("get_comments", [
    user.substring(3),
    postId,
  ]);
  return comments || [];
}

export default function Page({ params }: { params: { slug: string[] } }) {
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsUpdated, setCommentsUpdated] = useState(false);
  const toast = useToast();

  const [tag, user, postId] = params.slug;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const postData = await getData(user, postId);
        setPost(postData);

        const postComments = await getComments(user, postId);
        setComments(postComments);
      } catch (error) {
        console.error("Error fetching data", error);
      }
    };

    fetchData();
  }, [user, postId]);

  if (!post) {
    return <Text>404 - Post not found</Text>;
  }

  const transformDate = (date: string) => {
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString();
  };

  const getTotalPayout = (post: Post) => {
    const parsePayoutValue = (value: string) => {
      const payout = parseFloat(value.split(" ")[0]);
      return isNaN(payout) ? 0 : payout;
    };

    const totalPayout = parsePayoutValue(post.total_payout_value);
    const pendingPayout = parsePayoutValue(post.pending_payout_value);
    const curatorPayout = parsePayoutValue(post.curator_payout_value);

    return totalPayout + pendingPayout + curatorPayout;
  };

  const handleCommentPosted = () => {
    setCommentsUpdated((prev) => !prev);
    toast({
      title: "Comment added!",
      status: "success",
      duration: 2000,
      isClosable: true,
    });
  };

  return (
    <Box
      width={{ base: "95%", lg: "75%" }}
      color="white"
      display="flex"
      flexDirection={{ base: 'column', lg: 'row' }}
      gap={6}
    >
      <Box
        flex={{ base: '1', md: '1.3' }}
        width="100%"
        maxWidth="100%"
        mx="auto"
      >
        <Heading mt={4} size="md" border="1px solid grey" borderRadius={5}>
          <Box bg="#201d21" borderRadius={5}>
            <HStack>
              <Box minW="20%">
                <Center p={2}>
                  <AuthorAvatar username={post?.author} />
                </Center>
              </Box>
              <Text fontSize={['16px', '18px', '20px', '24px']}>
                {post?.title}

              </Text>

              <Text
                fontSize="15px"
                fontWeight="bold"
                color="white"
                display="flex"
                alignItems="center"
                gap={2}
              >
                <FaDollarSign />
                {getTotalPayout(post).toFixed(2)} USD
              </Text>

            </HStack>

          </Box>
        </Heading>
        <Box
          letterSpacing="0.5px"
          bg="transparent"
          color="white"
          fontSize={['16px', '18px', '20px', '24px']}
        >
          <ClientMarkdownRenderer content={(post.body)} />
        </Box>
        <Container p={4}>

          <Divider mt={5} />
          <Center>
            <Text color={"white"} fontSize="12px">
              {transformDate(post?.created)}
            </Text>
          </Center>
          {post.beneficiaries.length > 0 && (
            <Table border="1px solid grey" width="100%" borderRadius="10px">
              <Thead borderRadius="10px">
                <Tr borderRadius="10px">
                  <Th>Beneficiaries</Th>
                  <Th>Weight</Th>
                </Tr>
              </Thead>
              <Tbody maxW="85%" borderRadius="10px">
                {post.beneficiaries.map((beneficiary: any) => (
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
      <Box
        flex={{ base: '2', lg: '1' }}
        width={{ base: '100%', lg: '50%' }}
        mt={{ base: 15, lg: 6 }}
        pt={{ base: 1, lg: 4 }}
        mx="auto"

        borderRadius="md"
        shadow="md"
      >
        <Center>
          <VStack width={{ base: "90%", lg: "80%" }}
          >
            <VoteButton
              author={post.author}
              permlink={post.permlink}
              comment={post}
              isModal={false}
              onClose={() => { }}
            />
          </VStack>
        </Center>

        <Center>
          <Text mt={5} fontSize="18px">
            Comments
          </Text>
        </Center>

        <Box width="100%" overflow="hidden" padding="0">
          <CommentsComponent
            author={user.substring(3)}
            permlink={postId}
            commentsUpdated={commentsUpdated}
            onCommentPosted={handleCommentPosted}
          />
        </Box>
      </Box>

    </Box>
  );
}
