import HiveClient from "@/lib/hive/hiveclient"
import { Table, Thead, Tr, Th, Tbody, Td, Center, Container, Flex, HStack, Heading, Text, Box, Modal, ModalBody, Avatar, Badge, VStack, Divider } from "@chakra-ui/react"
import type { Metadata } from "next"
import React from "react"
import { MarkdownRenderers } from "@/app/upload/utils/MarkdownRenderers"
import ReactMarkdown from "react-markdown"
import rehypeRaw from "rehype-raw"
import remarkGfm from "remark-gfm"
import { transform3SpeakContent } from "@/lib/utils"
import CommentsComponent from "@/app/dao/components/comments"

// Revalidate requests in 10 minutes
export const revalidate = 600

const hiveClient = HiveClient

export async function generateMetadata({
  params,
}: {
  params: { slug: [tag: string, user: string, postId: string] }
}): Promise<Metadata> {
  let [tag, user, postId] = params.slug
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
  try {
    // Decode and clean user ID
    const decodedUser = decodeURIComponent(user);
    const normalizedUser = decodedUser.replace(/^@/, '');  // Ensure no '@' is present
    const decodedPostId = decodeURIComponent(postId);  // Ensure postId is correctly decoded

    console.log("Fetching post with normalized user:", normalizedUser, "and post ID:", decodedPostId);

    const postContent = await hiveClient.database.call("get_content", [normalizedUser, decodedPostId]);
    if (!postContent || Object.keys(postContent).length === 0) {
      console.error("No content or invalid response for user:", normalizedUser, "and post ID:", decodedPostId);
      throw new Error("Failed to fetch post content or invalid response.");
    }

    return postContent;
  } catch (error: any) {
    console.error("API call failed:", error);
    throw new Error("Error in getData function: " + error.message);
  }
}


export default async function Page({ params }: { params: { slug: string[] } }) {
  console.log("Full Params Received:", params);
  console.log("PAGE:", params.slug);
  if (params.slug.includes('manifest.json')) {
    console.log("Ignoring request for manifest.json");
    return null;  // Or render something minimal, or even redirect
  }
  if (!Array.isArray(params.slug) || params.slug.length < 3) {
    console.error("Invalid slug format or incomplete data:", params.slug);
    return <Text>Error: Invalid URL format or missing data.</Text>;
  }

  let [tag, user, postId] = params.slug.map(decodeURIComponent);
  console.log("Extracted parameters - Tag:", tag, "User:", user, "Post ID:", postId);

  try {
    const post = await getData(user, postId);
    if (!post) {
      console.error("Post not found for:", user, postId);
      return <Text>404 - Post not found</Text>;
    }

    const transformDate = (date: string) => {
      const dateObj = new Date(date);
      return dateObj.toLocaleDateString();
    }

    return (
      <Box>
        <Box display="flex" flexDir={{ base: "column", lg: "row" }} minH="60vh" gap={6} >
          <Box width={{ base: "100%", md: "60%" }}>
            <Heading m={6} size="md" border={"1px solid grey"} borderRadius={5}>
              <Box bg="#201d21" borderRadius={5}>
                <HStack >
                  <Box minW={"20%"}>
                    <Center>
                      <Avatar
                        name={user}
                        src={`https://images.ecency.com/webp/u/${user}/avatar/small`}
                        height="40px"
                        width="40px"
                        bg="transparent"
                        loading="lazy"
                        borderRadius={5}
                        m={2}
                      />
                      <Text m={1}>{post?.author}</Text>
                      :
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
                {transform3SpeakContent(post.body)}
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

                <Badge border={"1px solid grey"} width={"100%"} m={"10px"} fontSize={'48px'} color="#f0f0f0">
                  <Center>

                    <Text> $4.20</Text>
                  </Center>
                </Badge>
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
  } catch (error: any) {
    console.error("Error rendering page for user:", user, "post ID:", postId, "Error:", error);
    return <Text>Error: {error.message}</Text>;
  }
}

