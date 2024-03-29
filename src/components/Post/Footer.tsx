import { usePostContext } from "@/contexts/PostContext"
import { useHiveUser } from "@/contexts/UserContext"
import { CardFooter, Flex, useDisclosure } from "@chakra-ui/react"
import Vote from "./Vote"
import PostVoters from "./Voters"

export default function Footer() {
  const { post } = usePostContext()
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
        {/* <Stack direction={"row"} gap={1}>
        </Stack> */}
        <Vote />
      </Flex>
    </CardFooter>
  )
}
