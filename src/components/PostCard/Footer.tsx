import { usePostContext } from "@/contexts/PostContext"
import { useHiveUser } from "@/contexts/UserContext"
import { CardFooter, Flex, useDisclosure } from "@chakra-ui/react"
import TipButton from "./TipButton"
import Vote from "./Vote"




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
        {/* <PostVoters
          activeVoters={post.active_votes}
          modalIsOpen={isVotersOpen}
          modalOnOpen={onVotersOpen}
          modalOnClose={onVotersClose}
        /> */}
        <TipButton author={post.author} />
        <Vote />

      </Flex>
    </CardFooter>
  )
}
