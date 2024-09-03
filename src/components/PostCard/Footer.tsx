import { usePostContext } from "@/contexts/PostContext"
import { useHiveUser } from "@/contexts/UserContext"
import { CardFooter, Flex } from "@chakra-ui/react"
import TipButton from "./TipButton"
import Vote from "./Vote"

export default function Footer() {
  const { post } = usePostContext()
  const { hiveUser } = useHiveUser()

  return (
    <CardFooter pt={0} flexDirection={"column"} gap={2} key={hiveUser?.name}>
      {/* <Flex w={"100%"} justify={"space-between"} align={"center"}> */}
      {/* <TipButton author={post.author} /> */}
      <Vote />

      {/* </Flex> */}
    </CardFooter>
  )
}
