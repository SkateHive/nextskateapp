"use client";
import { useHiveUser } from "@/contexts/UserContext";
import { useComments } from "@/hooks/comments";
import { useMainFeed } from "@/hooks/useMainFeed";
import { getMainFeedConfig } from "../../utils/feedUtils";
import { VStack } from "@chakra-ui/react";
import TopMenu from "@/components/MainFeed/components/TopMenu";
import SortMenu from "../../components/SortMenu";
import LoadingOverlay from "../../components/LoadingOverlay";
import UserInputSection from "../../components/UserInputSection";
import CommentsList from "@/components/MainFeed/components/CommentsList";

const { parentAuthor, parentPermlink } = getMainFeedConfig();

const MainFeed = () => {
  const { comments, addComment, isLoading } = useComments(
    parentAuthor,
    parentPermlink
  ) || { comments: [], addComment: () => {}, isLoading: true };
  
  const user = useHiveUser();
  const username = user?.hiveUser?.name;

  const {
    sortedComments,
    visiblePosts,
    handleCommentSubmit,
    handleSortChange,
    setVisiblePosts,
  } = useMainFeed({ comments, isLoading, addComment });

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
      
      <LoadingOverlay isLoading={isLoading} />
      
      <UserInputSection
        user={user}
        isLoading={isLoading}
        onCommentSubmit={handleCommentSubmit}
      />
      
      <SortMenu onSortChange={handleSortChange} />
      
      <CommentsList
        comments={sortedComments}
        visiblePosts={visiblePosts}
        setVisiblePosts={setVisiblePosts}
        username={username}
      />
    </VStack>
  );
};

export default MainFeed;
