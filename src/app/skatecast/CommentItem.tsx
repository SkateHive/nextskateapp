"use client"
import {
    Avatar,
    Box,
    Button,
    Flex,
    HStack,
    Text,
    Badge,
    Divider,
  } from "@chakra-ui/react"
  import { FaRegComment, FaRegHeart, FaDollarSign } from "react-icons/fa"
  import ReactMarkdown from "react-markdown"
  import rehypeRaw from "rehype-raw"
  import remarkGfm from "remark-gfm"
  import { MarkdownRenderers } from "@/app/upload/utils/MarkdownRenderers"
  import TipButton from "@/components/PostCard/TipButton"
  import { transformIPFSContent, transformShortYoutubeLinksinIframes, formatDate } from "@/lib/utils"
  
  interface CommentItemProps {
    comment: any
    username: string
    handleCommentIconClick: (comment: any) => void
    handleVote: (author: string, permlink: string) => void
    getTotalPayout: (comment: any) => number
  }
  
  const CommentItem = ({
    comment,
    username,
    handleCommentIconClick,
    handleVote,
    getTotalPayout,
  }: CommentItemProps) => {
    return (
      <Box key={comment.id} p={4} width="100%" bg="black" color="white">
        <Flex>
          <Avatar
            borderRadius={10}
            boxSize={12}
            src={`https://images.ecency.com/webp/u/${comment.author}/avatar/small`}
          />
          <HStack ml={4}>
            <Text fontWeight="bold">{comment.author}</Text>
            <Text ml={2} color="gray.400">
              {formatDate(String(comment.created))}
            </Text>
            <Badge
              variant="ghost"
              color={"green.400"}
            >
              <HStack>
                <FaDollarSign />
                <Text>
                  {getTotalPayout(comment)} USD
                </Text>
              </HStack>
            </Badge>
          </HStack>
        </Flex>
        <Box ml={"64px"} mt={4}>
          <ReactMarkdown
            components={MarkdownRenderers}
            rehypePlugins={[rehypeRaw]}
            remarkPlugins={[remarkGfm]}
          >
            {transformIPFSContent(
              transformShortYoutubeLinksinIframes(comment.body)
            )}
          </ReactMarkdown>
        </Box>
        <Flex ml={12} justifyContent={"space-between"} mt={4}>
          <Button
            colorScheme="green"
            variant="ghost"
            leftIcon={<FaRegComment />}
            onClick={() => handleCommentIconClick(comment)}
          >
            {comment.children}
          </Button>
          <Button
            onClick={() => handleVote(comment.author, comment.permlink)}
            colorScheme="green"
            variant="ghost"
            leftIcon={<FaRegHeart />}
          >
            {comment.active_votes?.length}
          </Button>
          <TipButton author={comment.author} />
        </Flex>
        <Divider mt={4} />
      </Box>
    )
  }
  
  export default CommentItem
  