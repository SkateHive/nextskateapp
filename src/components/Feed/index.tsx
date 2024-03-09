"use client"
import { usePosts } from "@/hooks/usePosts";
import PostModel from "@/lib/models/post";
import { Box, Flex, Grid } from "@chakra-ui/react";
import { useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { BeatLoader } from "react-spinners";
import Post from "../Post";
import PostSkeleton from "../Post/Skeleton";

export default function Feed() {
  const { posts, error, isLoading } = usePosts();
  const [visiblePosts, setVisiblePosts] = useState(20);

  if (error) return "Error";

  if (isLoading || !posts)
    return (
      <Grid
        p={1}
        templateColumns={{ base: "repeat(1, 1fr)", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }}
        gap={6}
        minHeight="100vh"
      >
        {/* Render skeletons to match the initial visiblePosts count or any fixed number that fills the screen */}
        {Array.from({ length: visiblePosts }).map((_, i) => (
          <Grid
            templateColumns={{ base: "repeat(1, 1fr)", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }}
            gap={6}
          >
            <PostSkeleton key={i} />
          </Grid>

        ))}
      </Grid>
    );

  return (
    <Box>
      <InfiniteScroll
        dataLength={visiblePosts}
        next={() => setVisiblePosts((visiblePosts) => visiblePosts + 3)}
        hasMore={visiblePosts < posts.length}
        loader={
          <Flex justify="center">
            <BeatLoader size={8} color="darkgrey" />
          </Flex>
        }
        style={{ overflow: 'hidden' }}
      >
        <Grid
          templateColumns={{ base: "repeat(1, 1fr)", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }}
          gap={6}
        >
          {posts.length > 0 &&
            posts
              .slice(0, visiblePosts)
              .map((post, i) => (
                <Post key={i} postData={PostModel.newFromDiscussion(post)} />
              ))}
        </Grid>
      </InfiniteScroll>
    </Box>
  );
}
