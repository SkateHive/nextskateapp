"use client";

import { Box, useMediaQuery, VStack, HStack, Center } from "@chakra-ui/react";
import SkateCast from "./mainFeed/page";
import MagLayout from "./magLayout";
import PostSkeleton from "@/components/PostCard/Skeleton";
import { NavigationButtons } from "@/components/MagColumn";
import AuthorSearchBar from "@/app/upload/components/searchBar";
import { useState, useCallback } from "react";

// Minimal placeholder data and logic to allow NavigationButtons and AuthorSearchBar to function
const SKATEHIVE_TAG = [{ tag: "hive-173115", limit: 30 }];
const initialFeedConfig = { tag: SKATEHIVE_TAG, query: "created" };

const MagColumnSkeleton = () => {
  // Dummy placeholders for hiveUser and updateFeed logic
  const hiveUser = { hiveUser: { name: "dummyUser" } };
  const [feedConfig, setFeedConfig] = useState(initialFeedConfig);

  const updateFeed = useCallback(
    (query: string, tagParams: { tag: string; limit: number }[]) => {
      setFeedConfig({ query, tag: tagParams });
      // Normally you'd call setQueryCategory(query) and setDiscussionQuery(tagParams) here
      // but this is a placeholder.
    },
    []
  );

  return (
    <Box
      width="400px"
      minWidth="400px"
      height="101vh"
      overflow="auto"
      bg="black"
      color="white"
      display={{ base: "none", md: "block" }} // hide on mobile
      p={4}
    >
      {/* Real Navigation Buttons instead of skeleton */}
      <NavigationButtons updateFeed={updateFeed} feedConfig={feedConfig} hiveUser={hiveUser} />

      {/* Real search bar instead of skeleton */}
      <Box display="flex" justifyContent="center" mb={4}>
        <Box width="300px">
          <AuthorSearchBar onSearch={(author) => updateFeed("blog", [{ tag: author, limit: 10 }])} />
        </Box>
      </Box>

      {/* Post skeletons remain for posts */}
      <PostSkeleton />
      <PostSkeleton />
      <PostSkeleton />
      <PostSkeleton />
    </Box>
  );
};

export default function Home() {
  const [isDesktop] = useMediaQuery("(min-width: 700px)", {
    ssr: true,
    fallback: false,
  });

  return (
    <>
      <SkateCast />
      {/* If isDesktop is true, show MagLayout. Otherwise, show the "MagColumnSkeleton" now with real nav and search bar. */}
      {isDesktop ? <MagLayout /> : <MagColumnSkeleton />}
    </>
  );
}
