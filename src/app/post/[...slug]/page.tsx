import CommentsComponent from '@/app/dao/components/comments';
import AuthorAvatar from '@/components/AuthorAvatar';
import HiveClient from '@/lib/hive/hiveclient';
import { transform3SpeakContent, transformIPFSContent } from '@/lib/utils';
import {
  Badge,
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
} from '@chakra-ui/react';
import { Metadata } from 'next';
import ClientMarkdownRenderer from '../ClientMarkdownRenderer';

export const revalidate = 600;

const hiveClient = HiveClient;

export async function generateMetadata({
  params,
}: {
  params: { slug: [tag: string, user: string, postId: string] };
}): Promise<Metadata> {
  let [tag, user, postId] = params.slug;

  const post = await getData(user, postId);
  const banner = JSON.parse(post.json_metadata).image;

  return {
    title: post.title,
    description: `${String(post.body).slice(0, 128)}...`,
    authors: post.author,
    applicationName: 'SkateHive',
    openGraph: {
      images: banner,
    },
  };
}

async function getData(user: string, postId: string) {
  const postContent = await hiveClient.database.call('get_content', [
    user.substring(3),
    postId,
  ]);
  if (!postContent) throw new Error('Failed to fetch post content');

  return postContent;
}

export default async function Page({ params }: { params: { slug: string } }) {
  if (!Array.isArray(params.slug)) return <Text>404 - Invalid URL</Text>;
  let [tag, user, postId] = params.slug;

  const post = await getData(user, postId);
  if (!post) return <Text>404 - Post not found</Text>;

  const transformDate = (date: string) => {
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString();
  };

  const getTotalPayout = (post: any) => {
    if (post.total_payout_value === undefined) return 0;
    if (post.pending_payout_value === undefined) return 0;
    if (post.curator_payout_value === undefined) return 0;
    const payout = parseFloat(post.total_payout_value.split(' ')[0]);
    const pendingPayout = parseFloat(post.pending_payout_value.split(' ')[0]);
    const curatorPayout = parseFloat(post.curator_payout_value.split(' ')[0]);
    return payout + pendingPayout + curatorPayout;
  };

  return (
    <Box width={{ base: '100%', md: '60%' }} color="white" display="flex" flexDir={{ base: 'column', lg: 'row' }} minH="60vh" gap={6}>
      <Box width={{ base: '100%', md: '60%' }}>
        <Heading mt={8} size="md" border="1px solid grey" borderRadius={5}>
          <Box bg="#201d21" borderRadius={5}>
            <HStack>
              <Box minW="20%">
                <Center p={2}>
                  <AuthorAvatar username={post?.author} />
                </Center>
              </Box>
              <Text fontSize="18px">{post?.title}</Text>
            </HStack>
          </Box>
        </Heading>

        <Container p={4}>
          <ClientMarkdownRenderer content={transformIPFSContent(transform3SpeakContent(post.body))} />
          <Divider mt={5} />
          <Center>
            <Text fontSize="12px">{transformDate(post?.created)}</Text>
          </Center>
        </Container>
      </Box>

      <Box width={{ base: '100%', md: '40%' }} mt={5}>
        <Center>
          <VStack width="90%">
            <Badge
              border="1px solid grey"
              width="100%"
              m="10px"
              fontSize="38px"
              bg="#201d21"
              color="white"
            >
              <Center>
                <Text>{getTotalPayout(post).toFixed(2)} USD</Text>
              </Center>
            </Badge>
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
          </VStack>
        </Center>
        <Center>
          <Text mt={5} fontSize="18px">
            Comments
          </Text>
        </Center>

        <CommentsComponent author={user.substring(3)} permlink={postId} />
      </Box>
    </Box>
  );
}
