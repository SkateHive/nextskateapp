import { usePostContext } from "@/contexts/PostContext"
import { useComments } from "@/hooks/comments"
import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Stack,
  StackDivider,
  Text,
  useDisclosure,
} from "@chakra-ui/react"
import { MessageCircle } from "lucide-react"
import PostComment from "./Comment"
import PostIcon from "./Icon"

export default function CommentIcon() {
  const { post } = usePostContext()
  const { isOpen, onOpen, onClose } = useDisclosure()

  return (
    <>
      <PostIcon
        onClick={onOpen}
        icon={MessageCircle}
        label="Comments"
        size={6}
      />
      <PostCommentsModal isOpen={isOpen} onClose={onClose} />
    </>
  )
}

function PostCommentsModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
}) {
  const { post } = usePostContext()
  const { comments, isLoading, error } = useComments(post.author, post.permlink)

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      isCentered
      scrollBehavior="inside"
      size={{ base: "full", md: "md" }}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Comments</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {isLoading || !comments ? (
            <Text>Loading</Text>
          ) : (
            <Stack divider={<StackDivider />} mb={4}>
              {comments.length > 1 ? (
                comments
                  .toReversed()
                  .map((comment, i) => (
                    <PostComment key={comment.id} comment={comment} />
                  ))
              ) : (
                <Text w={"100%"} align={"center"}>
                  Nothing yet
                </Text>
              )}
            </Stack>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
