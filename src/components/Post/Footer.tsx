import { usePostContext } from "@/contexts/PostContext"
import { useHiveUser } from "@/contexts/UserContext"
import {
  CardFooter,
  Flex,
  Stack,
  useClipboard,
  useDisclosure,
} from "@chakra-ui/react"
import { Check, Send } from "lucide-react"
import { useSWRConfig } from "swr"
import CommentIcon from "./CommentIcon"
import PostIcon from "./Icon"
import Vote from "./Vote"
import PostVoters from "./Voters"

export default function Footer() {
  const { post } = usePostContext()
  const { mutate } = useSWRConfig()
  const { onCopy, hasCopied } = useClipboard(post.getFullUrl())

  const { hiveUser } = useHiveUser()

  const {
    isOpen: isVotersOpen,
    onOpen: onVotersOpen,
    onClose: onVotersClose,
  } = useDisclosure()

  return (
    <CardFooter pt={0} flexDirection={"column"} gap={2} key={hiveUser?.name}>
      <Flex w={"100%"} justify={"space-between"} align={"center"}>
        <PostVoters
          activeVoters={post.active_votes}
          modalIsOpen={isVotersOpen}
          modalOnOpen={onVotersOpen}
          modalOnClose={onVotersClose}
        />
        <Stack direction={"row"} gap={1}>
          <PostIcon
            onClick={onCopy}
            icon={hasCopied ? Check : Send}
            label={hasCopied ? "Copied!" : "Copy link"}
            size={6}
          />
          <CommentIcon />
          <Vote />
        </Stack>
      </Flex>
    </CardFooter>
  )
}
