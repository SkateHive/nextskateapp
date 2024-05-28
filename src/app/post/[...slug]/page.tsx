import CommentsComponent from "@/app/dao/components/comments"
import { MarkdownRenderers } from "@/app/upload/utils/MarkdownRenderers"
import HiveClient from "@/lib/hive/hiveclient"
import { transform3SpeakContent, transformIPFSContent } from "@/lib/utils"
import { Avatar, Badge, Box, Center, Container, Divider, HStack, Heading, Table, Tbody, Td, Text, Th, Thead, Tr, VStack } from "@chakra-ui/react"
import { Metadata } from "next"
import ReactMarkdown from "react-markdown"
import rehypeRaw from "rehype-raw"
import remarkGfm from "remark-gfm"
import AuthorAvatar from "@/components/AuthorAvatar"
import { FaCross, FaTimesCircle } from "react-icons/fa"
// Revalidate requests in 10 minutes
export const revalidate = 600

const hiveClient = HiveClient

 async function generateMetadata({
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

export default  function Page({ post, isOpen, onClose }) {
  

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
    <>
    {
      isOpen ? (

        <Box zIndex={1000}>
        <Box position='absolute' zIndex={100} borderRadius={20} background={'rgb(50, 50, 50, 0.7)'} backdropFilter='blur(15px)' left='calc( 50% - 25vw )' top='calc( 50% - 45vh )' width={{md: '90vw', xl: '50vw'}} height={'90vh'} >
        <FaTimesCircle size={20} onClick={onClose} style={{position: 'absolute', cursor: 'pointer', right: 10, top: 10}} />
          <Box width='inherit' padding={4} height='inherit' display={'grid'} gridAutoRows="15% 5% 80%" >
   
            <Container gridRow={'1/4'} height='100%' overflowY={'scroll'} p={4}>
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
  
            <Center gridColumn={'2/3'}>
              <VStack width={"90%"}>
  
                <Badge border={"1px solid grey"} width={"100%"} m={"10px"} fontSize={'38px'} bg="#201d21" color="white">
                  <Center>
  
                    <Text> {getTotalPayout(post).toFixed(2)} USD</Text>
                  </Center>
                </Badge>
                {post.beneficiaries.length > 0 &&
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
            <Center gridColumn={'2/3'}>
              <Text mt={5} fontSize={"18px"}>Comments</Text>
            </Center>
  
            {/* <CommentsComponent  author={user.substring(3)} permlink={postId} /> */}
          </Box>
  
          <Box width={{ base: "100%", md: "40%" }} mt={5}>
  
          </Box>
        </Box>
      </Box >
      ) : ('')
    }
    </>
  )
  
}
