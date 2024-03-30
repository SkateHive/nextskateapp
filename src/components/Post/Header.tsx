import { usePostContext } from "@/contexts/PostContext"
import UserModel from "@/lib/models/user"
import {
  CardHeader,
  Flex,
  HStack,
  Icon,
  Text,
  Tooltip,
  useDisclosure,
} from "@chakra-ui/react"
import { Eye } from "lucide-react"
import moment from "moment-timezone"
import Link from "next/link"
import { useEffect, useState } from "react"
import PostModal from "../PostModal"
import PostAvatar from "./Avatar"

type Variant = "preview" | "open"
interface HeaderInterface {
  variant?: Variant
}

export default function Header({ variant = "preview" }: HeaderInterface) {
  const { post } = usePostContext()
  const [authorData, setAuthorData] = useState<UserModel>({} as UserModel)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const postAvatar = authorData.metadata?.profile?.profile_image

  useEffect(() => {
    const fetchAuthor = async () => {
      const author = await UserModel.getNewFromUsername(post.author)
      setAuthorData(author)
    }
    fetchAuthor()
  }, [post.author])

  return (
    <CardHeader p={2} pb={0}>
      <PostModal isOpen={isOpen} onClose={onClose} />
      <Flex gap="4" align={"start"}>
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
          <Flex flexDir="column" gap={0} w={"100%"}>
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
            <HStack justify={"space-between"} display={"flex"}>
              <Text fontSize="16px" noOfLines={1}>
                {post.title}
              </Text>
            </HStack>
          </Flex>
        </Flex>
        {variant === "preview" ? (
          <Tooltip label="Open post">
            <Icon
              onClick={onOpen}
              mt={1}
              cursor={"pointer"}
              as={Eye}
              h={7}
              w={7}
              color="limegreen"
            />
          </Tooltip>
        ) : null}
      </Flex>
    </CardHeader>
  )
}
