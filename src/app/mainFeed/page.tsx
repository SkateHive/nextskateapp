"use client";
import UserAvatar from "@/components/UserAvatar";
import { useHiveUser } from "@/contexts/UserContext";
import { useComments } from "@/hooks/comments";
import { getTotalPayout } from "@/lib/utils";
import { exceedsDownvoteThreshold } from "@/lib/voteUtils";
import {
  Box,
  Divider,
  Flex,
  HStack,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
  useToast,
  VStack,
} from "@chakra-ui/react";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import { FaHistory, FaMoneyBill } from "react-icons/fa";
import { FaArrowRightArrowLeft } from "react-icons/fa6";
import { IoFilter } from "react-icons/io5";
import MainInput from "@/components/MainFeed/MainInput";
import CommentList from "./components/CommentsList";
import TopMenu from "./components/TopMenu";
import { Discussion } from "@hiveio/dhive";

const LoadingComponent = dynamic(
  () => import("./components/loadingComponent"),
  { ssr: false }
);

const parent_author = process.env.NEXT_PUBLIC_MAINFEED_AUTHOR || "skatehacker";
const parent_permlink =
  process.env.NEXT_PUBLIC_MAINFEED_PERMLINK || "test-advance-mode-post";

const MainFeed = () => {
  const { comments, addComment, isLoading } = useComments(
    parent_author,
    parent_permlink
  ) || { comments: [], addComment: () => {}, isLoading: true };
  const [visiblePosts, setVisiblePosts] = useState<number>(6);
  const postBodyRef = useRef<HTMLTextAreaElement>(null);
  const user = useHiveUser();
  const username = user?.hiveUser?.name;
  const [sortMethod, setSortMethod] = useState<string>("chronological");
  const toast = useToast();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);



  const handleCommentSubmit = (newComment: Discussion) => {
    console.debug("DEBUG user object on comment submit:", user);
    addComment(newComment);
    toast({
      title: "Success",
      description: "Your post has been published!",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  const sortedComments = useMemo(() => {
    if (!comments?.length) return [];

    const filteredComments = comments.filter(
      (comment) => !exceedsDownvoteThreshold(comment.active_votes, 2)
    );

    switch (sortMethod) {
      case "engagement":
        return filteredComments.sort(
          (a, b) => (b?.children ?? 0) - (a?.children ?? 0)
        );
      case "payout":
        return filteredComments.sort(
          (a, b) =>
            getTotalPayout(b as Discussion) - getTotalPayout(a as Discussion)
        );
      default: // "chronological"
        return filteredComments.reverse();
    }
  }, [comments, sortMethod]);

  const handleSortChange = (method: string) => setSortMethod(method);

  useEffect(() => {
    const scrollDiv = document.getElementById("scrollableDiv");
    const handleScroll = () => {
      if (
        scrollDiv &&
        scrollDiv.scrollTop + scrollDiv.clientHeight >=
          scrollDiv.scrollHeight - 100
      ) {
        setVisiblePosts((prev) => prev + 6);
      }
    };
    scrollDiv?.addEventListener("scroll", handleScroll);
    return () => scrollDiv?.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <VStack
      id="scrollableDiv"
      overflowY="auto"
      css={{
        "&::-webkit-scrollbar": { display: "none" },
        scrollbarWidth: "none",
      }}
      maxW={"540px"}
      width={"100%"}
      borderInline={"1px solid rgb(255,255,255,0.2)"}
      height={"101vh"}
      overflowX="hidden"
      position="relative"
    >
      <TopMenu sortedComments={sortedComments} />
      {isLoading && (
        <Box
          position="absolute"
          top={0}
          left={0}
          width="100%"
          height="100%"
          bg="black"
          zIndex={10}
        >
          <LoadingComponent />
        </Box>
      )}
      {user.hiveUser && (
        <>
          <Flex width="full" p={2}>
            <UserAvatar
              hiveAccount={user.hiveUser || {}}
              boxSize={12}
              borderRadius={5}
            />
            <MainInput
              username={user.hiveUser.name}
              ref={postBodyRef}
              isLoading={isLoading}
              onCommentSubmit={handleCommentSubmit}
            />
          </Flex>
          <Divider />
        </>
      )}
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
              <FaMoneyBill /> <Text ml={2}>Payout</Text>
            </MenuItem>
            <MenuItem
              bg={"black"}
              onClick={() => handleSortChange("engagement")}
            >
              <FaArrowRightArrowLeft /> <Text ml={2}>Engagement</Text>
            </MenuItem>
          </MenuList>
        </Menu>
      </HStack>
      <CommentList
        comments={sortedComments}
        visiblePosts={visiblePosts}
        setVisiblePosts={setVisiblePosts}
        username={username}
      />
      {isLoading && (
        <Box
          position="absolute"
          top={0}
          left={0}
          width="100%"
          height="100%"
          bg="black"
          zIndex={10}
        >
          <LoadingComponent />
        </Box>
      )}
    </VStack>
  );
};

export default MainFeed;
