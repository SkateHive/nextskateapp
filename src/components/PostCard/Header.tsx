import { usePostContext } from "@/contexts/PostContext"
import UserModel from "@/lib/models/user"
import { getWebsiteURL } from "@/lib/utils"
import {
  Button,
  CardHeader,
  Flex,
  HStack,
  Icon,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Text,
  Tooltip,
  useDisclosure,
  useMediaQuery,
} from "@chakra-ui/react"
import { ChevronDownIcon, Copy, ExternalLink, Eye, Twitter } from "lucide-react"
import moment from "moment-timezone"
import Link from "next/link"
import { useEffect, useState } from "react"
import { FaDiscord } from "react-icons/fa"
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

  const [isSmallerThan400] = useMediaQuery("(max-width: 400px)")

  const postFullUrl = `${getWebsiteURL()}/post${post.url}`
  const postSummary = `Check out this awesome post on SkateHive by @${post.author} \n\n`

  const handleCopyPostLink = () => {
    try {
      const postPageUrl = postFullUrl
      navigator.clipboard.writeText(postPageUrl)
    } catch (error) {
      console.error("Failed to copy the link:", error)
    }
  }

  const handleOpenPostLink = () => {
    try {
      window.open(postFullUrl, "_blank")
    } catch (error) {
      console.error("Failed to open the link:", error)
    }
  }

  const handleOpenPostLinkPeakd = () => {
    try {
      window.open(`https://peakd.com${post.url}`, "_blank")
    } catch (error) {
      console.error("Failed to open the link:", error)
    }
  }

  const handleShareWarpCast = async () => {
    try {
      const warptext = `${postSummary} ${postFullUrl}`
      const postPageUrl = encodeURI(warptext)
      window.open(
        `https://warpcast.com/~/compose?text=${postPageUrl}`,
        "_blank"
      )
    } catch (error) {
      console.error("Failed to share in WarpCast:", error)
    }
  }

  const handleShareTwitter = async () => {
    try {
      const tweetText = `${postSummary} ${postFullUrl}`
      const postPageUrl = encodeURI(tweetText)
      window.open(
        `https://twitter.com/intent/tweet?text=${postPageUrl}`,
        "_blank"
      )
    } catch (error) {
      console.error("Failed to share in Twitter:", error)
    }
  }

  const handleShareDiscord = async () => {
    try {
      const postPageUrl = encodeURI(postFullUrl)
      const discordText = `${postSummary} ${postPageUrl}`
      navigator.clipboard.writeText(discordText)
      window.open(
        "https://discord.com/channels/631777256234156033/631778823716864011",
        "_blank"
      )
    } catch (error) {
      console.error("Failed to share in Discord:", error)
    }
  }

  useEffect(() => {
    const fetchAuthor = async () => {
      const author = await UserModel.getNewFromUsername(post.author)
      setAuthorData(author)
    }
    fetchAuthor()
  }, [post.author])

  return (
    <CardHeader p={2} pb={0}>
      {isOpen && <PostModal isOpen={isOpen} onClose={onClose} />}
      <Flex
        gap="4"
        align={"start"}
        flexDir={variant == "open" && isSmallerThan400 ? "column" : "row"}
      >
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
              <Text color="green" fontSize="14px" as="b">
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
              <Text color={"limegreen"} fontSize="16px" noOfLines={1}>
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
        ) : (
          <Menu
            placement={
              variant == "open" && isSmallerThan400 ? "bottom" : "bottom-end"
            }
          >
            <MenuButton
              colorScheme="green"
              as={Button}
              rightIcon={<ChevronDownIcon />}
              variant={"outline"}
              width={variant == "open" && isSmallerThan400 ? "100%" : "auto"}
            >
              Share
            </MenuButton>
            <MenuList fontSize={"sm"}>
              <MenuItem onClick={handleCopyPostLink} icon={<Copy size={18} />}>
                Copy link
              </MenuItem>
              <MenuItem
                onClick={handleShareWarpCast}
                icon={<ExternalLink size={18} />}
              >
                WarpCast
              </MenuItem>
              <MenuItem
                onClick={handleShareTwitter}
                icon={<Twitter size={18} />}
              >
                Twitter
              </MenuItem>
              <MenuItem
                onClick={handleShareDiscord}
                icon={<FaDiscord size={18} />}
              >
                Discord
              </MenuItem>
              <MenuDivider />
              <MenuItem
                onClick={handleOpenPostLink}
                icon={<ExternalLink size={18} />}
              >
                Post page
              </MenuItem>
              <MenuItem
                onClick={handleOpenPostLinkPeakd}
                icon={<ExternalLink size={18} />}
              >
                PeakD
              </MenuItem>
            </MenuList>
          </Menu>
        )}
      </Flex>
    </CardHeader>
  )
}
