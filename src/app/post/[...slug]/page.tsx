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
  console.log("Received User:", user);


  console.log("API Call User:", user);
  try {
    const postContent = await hiveClient.database.call("get_content", [user, postId]);
    return postContent;
  }
  catch (error: any) {
    console.error("Failed to fetch post content for User:", user, "Post ID:", postId);
    console.error(error)
    return null;
  }

}



export default async function Page({ params }: { params: { slug: string } }) {
  console.log(params.slug)
  if (!Array.isArray(params.slug)) return;
  let [tag, user, postId] = params.slug;
  const post = await getData(user, postId);
  if (!post) return <Text>404 - Post not found</Text>;

  // lets format user to be a normal string without unicode 

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
}
