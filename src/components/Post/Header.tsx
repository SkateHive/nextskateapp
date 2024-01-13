import { usePostContext } from "@/contexts/PostContext"
import UserModel from "@/lib/models/user"
import { CardHeader, Flex, Text, Tooltip } from "@chakra-ui/react"
import { PiggyBank } from "lucide-react"
import moment from "moment-timezone"
import Link from "next/link"
import { useEffect, useState } from "react"
import PostAvatar from "./Avatar"

export default function Header() {
  const { post } = usePostContext()
  const [authorData, setAuthorData] = useState<UserModel>({} as UserModel)
  const postAvatar = authorData.metadata?.profile.profile_image

  useEffect(() => {
    const fetchAuthor = async () => {
      const author = await UserModel.getNewFromUsername(post.author)
      setAuthorData(author)
    }
    fetchAuthor()
  }, [])

  return (
    <CardHeader pb={0}>
      <Flex gap="4" align={"end"}>
        <Flex flex="1" gap="2" alignItems="center">
          <Link href={post.getFullAuthorUrl()}>
            <PostAvatar
              name={post.author}
              src={
                postAvatar ??
                `https://images.ecency.com/webp/u/${post.author}/avatar/small`
              }
            />
          </Link>
          <Flex flexDir="column" gap={0}>
            <Flex gap={1} alignItems="center">
              <Text fontSize="14px" as="b">
                {post.author}
              </Text>
              <Text fontSize="14px" color="darkgray">
                ·
              </Text>
              <Text fontSize="12px" color="darkgray" fontWeight="300">
                {moment.utc(post.created).fromNow()}
              </Text>
            </Flex>
            <Text fontSize="14px" noOfLines={1}>
              {post.title}
            </Text>
          </Flex>
        </Flex>
        <Tooltip label="Earnings">
          <Flex gap={1} align={"center"}>
            <PiggyBank strokeWidth={"1.5"} color="darkgray" size={"20px"} />
            <Text color={"darkgray"} fontSize={"13px"} fontWeight={"400"}>
              ${post.getEarnings().toFixed(2)}
            </Text>
          </Flex>
        </Tooltip>
      </Flex>
    </CardHeader>
  )
}
