'use client';
import { usePostContext } from "@/contexts/PostContext";
import { useHiveUser } from "@/contexts/UserContext";
import getSummary from "@/lib/getSummaryAI";
import {
  Button,
  CardHeader,
  Flex,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Spacer,
  Text,
  useDisclosure,
  useMediaQuery
} from "@chakra-ui/react";
import {
  ChevronDownIcon,
  Copy,
  ExternalLink,
  Eye,
  Twitter
} from "lucide-react";
import moment from "moment-timezone";
import Link from "next/link";
import { useState } from "react";
import { FaDiscord } from "react-icons/fa";
import AuthorAvatar from "../AuthorAvatar";
import PostModal from "../PostModal";
import { EditModal } from "../PostModal/editMagPostModal";



type Variant = "preview" | "open";
interface HeaderInterface {
  variant?: Variant;
}

export default function Header({ variant = "preview" }: HeaderInterface) {
  const { post } = usePostContext();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isSmallerThan400] = useMediaQuery("(max-width: 400px)");
  const postFullUrl = `${window.location.origin}/post${post.url}`;

  const user = useHiveUser()
  const [isEditing, setIsEditing] = useState(false);

  const handleCopyPostLink = () => {
    try {
      const postPageUrl = postFullUrl;
      navigator.clipboard.writeText(postPageUrl);
    } catch (error) {
      console.error("Failed to copy the link:", error);
    }
  };

  const handleOpenPostLink = () => {
    try {
      window.open(postFullUrl, "_blank", "noreferrer noopener");
    } catch (error) {
      console.error("Failed to open the link:", error);
    }
  };

  const handleOpenPostLinkPeakd = () => {
    try {
      window.open(`https://peakd.com${post.url}`, "_blank", "noreferrer noopener");
    } catch (error) {
      console.error("Failed to open the link:", error);
    }
  };

  const handleShareWarpCast = async () => {
    try {
      const postSummary = await getSummary(post.body).then((summary) => summary);
      const warptext = `${postSummary} ${postFullUrl}`;
      const postPageUrl = encodeURI(warptext);
      window.open(
        `https://warpcast.com/~/compose?text=${postPageUrl}`,
        "_blank", "noreferrer noopener");
    } catch (error) {
      console.error("Failed to share in WarpCast:", error);
    }
  };

  const handleShareTwitter = async () => {
    try {
      const postSummary = await getSummary(post.body).then((summary) => summary);
      const tweetText = `${postSummary} ${postFullUrl}`;
      const postPageUrl = encodeURI(tweetText);
      window.open(
        `https://twitter.com/intent/tweet?text=${postPageUrl}`,
        "_blank", "noreferrer noopener");
    } catch (error) {
      console.error("Failed to share in Twitter:", error);
    }
  };

  const handleShareDiscord = async () => {
    try {
      const postSummary = getSummary(post.body).then((summary) => summary);
      const postPageUrl = encodeURI(postFullUrl);
      const discordText = `${postSummary} ${postPageUrl}`;
      navigator.clipboard.writeText(discordText);
      window.open(
        "https://discord.com/channels/631777256234156033/631778823716864011",
        "_blank", "noreferrer noopener"
      );
    } catch (error) {
      console.error("Failed to share in Discord:", error);
    }
  };



  return (
    <>
      {isEditing && (
        <EditModal
          isOpen={isEditing}
          onClose={() => setIsEditing(false)}
          post={post}
        />
      )}
      {isOpen && <PostModal isOpen={isOpen} onClose={onClose} />}
      <CardHeader p={2} pb={0}>
        <Flex
          gap="4"
          align={"center"}
        >
          <Flex flex="1" gap="2" alignItems="center">
            <Link href={`/skater/${post.author}`} >
              <AuthorAvatar username={post.author} boxSize={10} borderRadius={20} quality="small" />
            </Link>
            <Flex flexDir="column" gap={1}>
              <Flex gap={1} alignItems="center" cursor={"pointer"}>
                <Text color="limegreen" fontSize="14px" as="b" onClick={onOpen}>
                  {post.author}
                </Text>
                <Text fontSize="14px" color="darkgray" onClick={onOpen}>
                  ·
                </Text>
                <Text fontSize="12px" color="darkgray" fontWeight="300" onClick={onOpen}>
                  {moment
                    .utc(post.created)
                    .fromNow()
                    .replace("minutes", "m")
                    .replace("hours", "h")
                    .replace("days", "d")
                    .replace("months", "m")
                    .replace("month", "m")
                    .replace("ago", "")
                    .replace(" ", "")
                  }
                </Text>
                <Spacer />

              </Flex>
              <Text
                cursor={"pointer"}
                color={"#A5D6A7"}
                fontSize="16px"
                noOfLines={1}
                onClick={onOpen}
              >
                {post.title}
              </Text>
            </Flex>
          </Flex>

          <>


            <Menu
              placement={
                variant == "open" && isSmallerThan400 ? "bottom" : "bottom-end"
              }
              colorScheme="white"
            >

              <MenuButton
                colorScheme="green"
                as={Button}
                variant={"ghost"}
                width={variant == "open" && isSmallerThan400 ? "100%" : "auto"}
                minW={0}
                p={1}
                h={6}
              >
                <ChevronDownIcon />
              </MenuButton>
              <MenuList bg={"black"} fontSize={"sm"}>
                {user.hiveUser?.name === post.author && (
                  <MenuItem
                    bg={"black"}
                    icon={<Eye size={18} />}
                    onClick={() => setIsEditing(true)}
                  >
                    Edit
                  </MenuItem>
                )}
                <MenuItem bg={"black"}
                  onClick={handleCopyPostLink} icon={<Copy size={18} />}>
                  Copy link
                </MenuItem>
                <MenuItem bg={"black"}
                  onClick={handleShareWarpCast}
                  icon={<ExternalLink size={18} />}
                >
                  WarpCast
                </MenuItem>
                <MenuItem bg={"black"}
                  onClick={handleShareTwitter}
                  icon={<Twitter size={18} />}
                >
                  Twitter
                </MenuItem>
                <MenuItem bg={"black"}
                  onClick={handleShareDiscord}
                  icon={<FaDiscord size={18} />}
                >
                  Discord
                </MenuItem>
                <MenuDivider />
                <MenuItem bg={"black"}
                  onClick={handleOpenPostLink}
                  icon={<ExternalLink size={18} />}
                >
                  Post page
                </MenuItem>
                <MenuItem bg={"black"}
                  onClick={handleOpenPostLinkPeakd}
                  icon={<ExternalLink size={18} />}
                >
                  PeakD
                </MenuItem>
              </MenuList>
            </Menu>

          </>

        </Flex>
      </CardHeader>
    </>
  );
}
