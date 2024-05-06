import { MarkdownRenderers } from "@/app/upload/utils/MarkdownRenderers";
import { usePostContext } from "@/contexts/PostContext";
import { useComments } from "@/hooks/comments";
import HiveClient from "@/lib/hive/hiveclient";
import { transform3SpeakContent, transformIPFSContent, transformEcencyImages } from "@/lib/utils";
import {
  Box,
  Center,
  Modal, ModalBody, ModalCloseButton, ModalContent,
  ModalFooter, ModalHeader, ModalOverlay, Text
} from "@chakra-ui/react";
import { useEffect } from 'react'; // Corrected imports
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import Header from "../PostCard/Header";
import CommandPrompt from "./commentPrompt";
import CommentsSection from "./commentSection";

interface PostModalInterface {
  isOpen: boolean;
  onClose(): void;
}

export function PostModal({ isOpen, onClose }: PostModalInterface) {
  const { post } = usePostContext();
  const { comments, addComment } = useComments(post.author, post.permlink);
  const postBody = transform3SpeakContent(post.body);
  const transformedPostBody = transformEcencyImages(postBody);
  useEffect(() => {
    const fetchPosts = async (username: string) => {
      try {
        const query = { tag: username, limit: 3 };
        const response = await HiveClient.database.getDiscussions("blog", query);
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };
    fetchPosts(post.author);
  }, [post.author]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={{ base: "lg", md: "2xl", lg: "6xl" }}>
      <ModalOverlay style={{ backdropFilter: "blur(5px)" }} />
      <ModalContent bg="black" border="1.4px solid limegreen" borderRadius={0} p={4} w="100%">
        <ModalHeader><Header variant="open" /></ModalHeader>
        <ModalCloseButton mr={4} mt={2} color="red" />
        <ModalBody display="flex" flexDir={{ base: "column", lg: "row" }} minH="60vh" gap={6}>
          <Box bg="black" flex={0} p={0} border="0px solid limegreen" borderRadius={0} minW="50%">
            <ReactMarkdown components={MarkdownRenderers} rehypePlugins={[rehypeRaw]} remarkPlugins={[remarkGfm]}>
              {transformIPFSContent(transformedPostBody)}
            </ReactMarkdown>
          </Box>
          <Box minW="50%">
            <CommandPrompt addComment={addComment} />
            <Center><Text fontSize="2xl">Comments</Text></Center>
            <CommentsSection comments={comments} />
          </Box>
        </ModalBody>
        <ModalFooter></ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default PostModal;
