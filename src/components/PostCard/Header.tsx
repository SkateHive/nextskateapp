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

import moment from "moment-timezone";
import Link from "next/link";
import { useState, ReactNode } from "react";
import { FaCopy, FaDiscord, FaEye, FaLink, FaTwitter } from "react-icons/fa";
import AuthorAvatar from "../AuthorAvatar";
import PostModal from "../PostModal";
import { EditModal } from "../PostModal/editMagPostModal";
import { useRouter } from "next/navigation";
import { IoIosArrowDown } from "react-icons/io";

type Variant = "preview" | "open";
interface HeaderInterface {
  variant?: Variant;
}

interface CustomMenuItemProps {
  onClick: () => void;
  icon: React.ReactElement;
  children: ReactNode;
}

const CustomMenuItem = ({ onClick, icon, children }: CustomMenuItemProps) => (
  <MenuItem
    bg={"black"}
    icon={icon}
    onClick={onClick}
    _hover={{ bg: "gray.700" }}
  >
    {children}
  </MenuItem>
);

export default function Header({ variant = "preview" }: HeaderInterface) {
  const { post } = usePostContext();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isSmallerThan400] = useMediaQuery("(max-width: 400px)");
  const router = useRouter();
  const postFullUrl = `${window.location.origin}/post${post.url}`;

  const user = useHiveUser();
  const [isEditing, setIsEditing] = useState(false);

  const handleCopyPostLink = () => {
    try {
      navigator.clipboard.writeText(postFullUrl);
    } catch (error) {
      console.error("Failed to copy the link:", error);
    }
  };

  const handleOpenLink = (url: string) => {
    try {
      router.push(url);
    } catch (error) {
      console.error("Failed to open the link:", error);
    }
  };

  const handleShare = async (platform: string) => {
    try {
      const postSummary = await getSummary(post.body);
      const text = `${postSummary} ${postFullUrl}`;
      const encodedText = encodeURI(text);
      let url = "";

      switch (platform) {
        case "WarpCast":
          url = `https://warpcast.com/~/compose?text=${encodedText}`;
          break;
        case "Twitter":
          url = `https://twitter.com/intent/tweet?text=${encodedText}`;
          break;
        case "Discord":
          navigator.clipboard.writeText(text);
          url = "https://discord.com/channels/631777256234156033/631778823716864011";
          break;
        default:
          break;
      }

      if (url) handleOpenLink(url);
    } catch (error) {
      console.error(`Failed to share on ${platform}:`, error);
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
        <Flex gap="4" align={"center"}>
          <Flex flex="1" gap="2" alignItems="center">
            <Link href={`/skater/${post.author}`}>
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
              <IoIosArrowDown />
            </MenuButton>
            <MenuList bg={"black"} fontSize={"sm"} color={"white"}>
              {user.hiveUser?.name === post.author && (
                <CustomMenuItem
                  icon={<FaEye size={18} />}
                  onClick={() => setIsEditing(true)}
                >
                  Edit
                </CustomMenuItem>
              )}
              <CustomMenuItem
                icon={<FaCopy size={18} />}
                onClick={handleCopyPostLink}
              >
                Copy link
              </CustomMenuItem>
              <CustomMenuItem
                icon={<FaLink size={18} />}
                onClick={() => handleShare("WarpCast")}
              >
                WarpCast
              </CustomMenuItem>
              <CustomMenuItem
                icon={<FaTwitter size={18} />}
                onClick={() => handleShare("Twitter")}
              >
                Twitter
              </CustomMenuItem>
              <CustomMenuItem
                icon={<FaDiscord size={18} />}
                onClick={() => handleShare("Discord")}
              >
                Discord
              </CustomMenuItem>
              <MenuDivider />
              <CustomMenuItem
                icon={<FaLink size={18} />}
                onClick={() => handleOpenLink(postFullUrl)}
              >
                Post page
              </CustomMenuItem>
              <CustomMenuItem
                icon={<FaLink size={18} />}
                onClick={() => handleOpenLink(`https://peakd.com${post.url}`)}
              >
                PeakD
              </CustomMenuItem>
            </MenuList>
          </Menu>
        </Flex>
      </CardHeader>
    </>
  );
}
