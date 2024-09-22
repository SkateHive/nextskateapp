"use client";

import { useHiveUser } from "@/contexts/UserContext";
import { useComments } from "@/hooks/comments";
import { vote } from "@/lib/hive/client-functions";
import { getTotalPayout } from "@/lib/utils";
import {
  Divider,
  HStack,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useMemo, useState } from "react";
import { FaHistory, FaMoneyBill } from "react-icons/fa";
import { FaArrowRightArrowLeft } from "react-icons/fa6";
import { IoFilter } from "react-icons/io5";
import AvatarList from "./components/AvatarList";
import CommentList from "./components/CommentsList";
import LoadingComponent from "./components/loadingComponent";
import AvatarMediaModal from "./components/mediaModal";
import CastArea from "@/components/Feed/CastArea";
import { HIVE_PARENT_AUTHOR, HIVE_PARENT_PERMLINK } from "@/lib/constants";

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
    HIVE_PARENT_AUTHOR,
    HIVE_PARENT_PERMLINK
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

      <CastArea addComment={addComment} />
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
