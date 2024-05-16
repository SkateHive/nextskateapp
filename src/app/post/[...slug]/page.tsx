import CommentsComponent from "@/app/dao/components/comments"
import { MarkdownRenderers } from "@/app/upload/utils/MarkdownRenderers"
import HiveClient from "@/lib/hive/hiveclient"
import { transform3SpeakContent } from "@/lib/utils"
import { Avatar, Badge, Box, Center, Container, Divider, HStack, Heading, Table, Tbody, Td, Text, Th, Thead, Tr, VStack } from "@chakra-ui/react"
import { Metadata } from "next"
import ReactMarkdown from "react-markdown"
import rehypeRaw from "rehype-raw"
import remarkGfm from "remark-gfm"
import { transformIPFSContent } from "@/lib/utils"
import CommandPrompt from "@/components/PostModal/commentPrompt"
import { useHiveUser } from "@/contexts/UserContext"
import { useComments } from "@/hooks/comments"

// Revalidate requests in 10 minutes
export const revalidate = 600

const hiveClient = HiveClient

export async function generateMetadata({
  params,
}: {
  params: { slug: [tag: string, user: string, postId: string] }
}): Promise<Metadata> {
  console.log("Received User:", params.slug[1]);
  let [tag, user, postId] = params.slug
  console.log("Received User:", user);

  const post = await getData(user, postId)
  const banner = JSON.parse(post.json_metadata).image

  return {
    title: post.title,
    description: `${String(post.body).slice(0, 128)}...`,
    authors: post.author,
    applicationName: "UnderHive",
    openGraph: {
      images: banner,
    },
  }
}

async function getData(user: string, postId: string) {
  const postContent = await hiveClient.database.call("get_content", [
    user.substring(3),
    postId,
  ])
  if (!postContent) throw new Error("Failed to fetch post content")

  return postContent
}

export default async function Page({ params }: { params: { slug: string } }) {
  if (!Array.isArray(params.slug)) return
  let [tag, user, postId] = params.slug

  const post = await getData(user, postId)
  if (!post) return <Text>404 - Post not found</Text>
  // lets format user to be a normal string without unicode 

  const transformDate = (date: string) => {
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString();
  }

  const getTotalPayout = (post: any) => {
    console.log("comment", post)
    console.log(typeof post.total_payout_value)
    // undefined 
    if (post.total_payout_value === undefined) {
      return 0
    }
    if (post.pending_payout_value === undefined) {
      return 0
    }
    if (post.curator_payout_value === undefined) {
      return 0
    }
    const payout = parseFloat(post.total_payout_value.split(" ")[0])
    const pendingPayout = parseFloat(post.pending_payout_value.split(" ")[0])
    const curatorPayout = parseFloat(post.curator_payout_value.split(" ")[0])
    return payout + pendingPayout + curatorPayout
  };


  return (
    <Box>
      <Box display="flex" flexDir={{ base: "column", lg: "row" }} minH="60vh" gap={6} >
        <Box width={{ base: "100%", md: "60%" }}>
          <Heading mt={8} size="md" border={"1px solid grey"} borderRadius={5}>
            <Box bg="#201d21" borderRadius={5}>
              <HStack >
                <Box minW={"20%"}>
                  <Center>
                    <Avatar
                      name={user}
                      src={`https://images.ecency.com/webp/u/${user.substring(3)}/avatar/small`}
                      height="40px"
                      width="40px"
                      bg="transparent"
                      loading="lazy"
                      borderRadius={5}
                      m={2}
                    />
                  </Center>
                </Box>
                <Text fontSize={"18px"}>{post?.title}</Text>

              </HStack>

            </Box>

          </Heading>

          <Container p={4}>
            <ReactMarkdown
              components={MarkdownRenderers}
              rehypePlugins={[rehypeRaw]}
              remarkPlugins={[remarkGfm]}
            >
              {transformIPFSContent(transform3SpeakContent(post.body))}
            </ReactMarkdown>
            <Divider mt={5} />
            <Center>
              <Text fontSize={"12px"}>{transformDate(post?.created)}</Text>
            </Center>
          </Container>
        </Box>

        <Box width={{ base: "100%", md: "40%" }} mt={5}>
          <Center>
            <VStack width={"90%"}>

              <Badge border={"1px solid grey"} width={"100%"} m={"10px"} fontSize={'38px'} bg="#201d21" color="white">
                <Center>

                  <Text> {getTotalPayout(post).toFixed(2)} USD</Text>
                </Center>
              </Badge>
              {

                post.beneficiaries.length > 0 &&
                <Table border={"1px solid grey"} width={"100%"} borderRadius={"10px"}>
                  <Thead borderRadius={"10px"}>
                    <Tr borderRadius={"10px"}>
                      <Th>Beneficiaries</Th>
                      <Th>Weight</Th>
                    </Tr>
                  </Thead>
                  <Tbody maxW={"85%"} borderRadius={"10px"}>
                    {post.beneficiaries.map((beneficiary: any) => (
                      <Tr key={beneficiary.account}>
                        <Td>{beneficiary.account}</Td>
                        <Td>{beneficiary.weight / 100}%</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>

              }
            </VStack>

          </Center>
          <Center>
            <Text mt={5} fontSize={"18px"}>Comments</Text>
          </Center>

          <CommentsComponent author={user} permlink={postId} />
        </Box>
      </Box>
    </Box >
  )
}
