"use client";
import UserAvatar from "@/components/UserAvatar";
import { useHiveUser } from "@/contexts/UserContext";
import { useComments } from "@/hooks/comments";
import { vote } from "@/lib/hive/client-functions";
import { commentWithPrivateKey } from "@/lib/hive/server-functions";
import { getTotalPayout } from "@/lib/utils";
import {
  Box,
  Button,
  Divider,
  Flex,
  HStack,
  IconButton,
  Image,
  Input,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
  Textarea,
  VStack,
} from "@chakra-ui/react";
import * as dhive from "@hiveio/dhive";
import { useMemo, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import { FaHistory, FaImage, FaMoneyBill, FaTimes } from "react-icons/fa";
import { FaArrowRightArrowLeft } from "react-icons/fa6";
import { IoFilter } from "react-icons/io5";
import { uploadFileToIPFS } from "../upload/utils/uploadToIPFS";
import AvatarList from "./components/AvatarList";
import CommentList from "./components/CommentsList";
import LoadingComponent from "./components/loadingComponent";
import AvatarMediaModal from "./components/mediaModal";
import ImageUploader from "@/components/Hive/PostCreation/ImageUpload";
import MediaDisplay from "@/components/Hive/PostCreation/MediaDisplay";
import CastArea from "@/components/Feed/CastArea";

const parent_author = process.env.NEXT_PUBLIC_MAINFEED_AUTHOR || "skatehacker";
const parent_permlink =
  process.env.NEXT_PUBLIC_MAINFEED_PERMLINK || "test-advance-mode-post";

export interface Comment {
  id: number;
  author: string;
  permlink: string;
  created: string;
  body: string;
  total_payout_value?: string;
  pending_payout_value?: string;
  curator_payout_value?: string;
}

const SkateCast = () => {
  const { comments, addComment, isLoading } = useComments(
    parent_author,
    parent_permlink
  );
  const [visiblePosts, setVisiblePosts] = useState<number>(2);
  const user = useHiveUser();
  const username = user?.hiveUser?.name;
  const [mediaModalOpen, setMediaModalOpen] = useState<boolean>(false);
  const [media, setMedia] = useState<string[]>([]);
  const [sortMethod, setSortMethod] = useState<string>("chronological");

  const sortedComments = useMemo(() => {
    if (sortMethod === "chronological") {
      return comments?.slice().reverse();
    } else if (sortMethod === "engagement") {
      return comments?.slice().sort((a, b) => {
        return (b?.children ?? 0) - (a?.children ?? 0);
      });
    } else {
      return comments?.slice().sort((a, b) => {
        return getTotalPayout(b as Comment) - getTotalPayout(a as Comment);
      });
    }
  }, [comments, sortMethod]);

  const handleVote = async (author: string, permlink: string) => {
    if (!username) {
      console.error("Username is missing");
      return;
    }
    vote({
      username: username,
      permlink: permlink,
      author: author,
      weight: 10000,
    });
  };

  const handleSortChange = (method: string) => {
    setSortMethod(method);
  };

  return isLoading ? (
    <LoadingComponent />
  ) : (
    <VStack
      id="scrollableDiv"
      overflowY="auto"
      css={{
        "&::-webkit-scrollbar": { display: "none" },
        scrollbarWidth: "none", // For Firefox
      }}
      maxW={"740px"}
      width={"100%"}
      borderInline={"1px solid rgb(255,255,255,0.2)"}
      height={"101vh"}
      overflowX="hidden"
    >
      <AvatarMediaModal
        isOpen={mediaModalOpen}
        onClose={() => setMediaModalOpen(false)}
        media={media}
      />
      <AvatarList sortedComments={sortedComments} />

      <CastArea />
      <Divider />

      <HStack width="full" justifyContent="flex-end" m={-2} mr={4}>
        <Menu>
          <MenuButton>
            <IoFilter color="#9AE6B4" />
          </MenuButton>
          <MenuList color={"white"} bg={"black"} border={"1px solid #A5D6A7"}>
            <MenuItem
              bg={"black"}
              onClick={() => handleSortChange("chronological")}
            >
              <FaHistory /> <Text ml={2}> Latest</Text>
            </MenuItem>
            <MenuItem bg={"black"} onClick={() => handleSortChange("payout")}>
              <FaMoneyBill /> <Text ml={2}>Payout</Text>{" "}
            </MenuItem>
            <MenuItem
              bg={"black"}
              onClick={() => handleSortChange("engagement")}
            >
              <FaArrowRightArrowLeft /> <Text ml={2}>Engagement</Text>{" "}
            </MenuItem>
          </MenuList>
        </Menu>
      </HStack>
      <CommentList
        comments={sortedComments}
        visiblePosts={visiblePosts}
        setVisiblePosts={setVisiblePosts}
        username={username}
        handleVote={handleVote}
      />
    </VStack>
  );
};

export default SkateCast;
