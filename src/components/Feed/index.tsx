"use client"

import { usePosts } from "@/hooks/usePosts"
import PostModel from "@/lib/models/post"
import { Link } from "@chakra-ui/next-js"
import { Box, Button, ButtonGroup, Flex, Grid, HStack } from "@chakra-ui/react"
import { useEffect, useState } from "react"
import InfiniteScroll from "react-infinite-scroll-component"
import { BeatLoader } from "react-spinners"
import Post from "../PostCard"
import PostSkeleton from "../PostCard/Skeleton"
import { useHiveUser } from "@/contexts/UserContext"
const postTypeName = {
  created: "🆕 Latest",
  trending: "🔥 Trending",
}

export default function Feed() {
  const { posts, error, isLoading, postType, setPostType } = usePosts()
  const [visiblePosts, setVisiblePosts] = useState(20)
  const hiveUser = useHiveUser()
  if (error) return "Error"

  if (isLoading || !posts)
    return (
      <Grid
        p={1}
        templateColumns={{
          base: "repeat(1, 1fr)",
          md: "repeat(2, 1fr)",
          lg: "repeat(3, 1fr)",
          xl: "repeat(4, 1fr)",
        }}
        gap={0}
        minHeight="100vh"
        width={"100%"}
      >
        {/* Render skeletons to match the initial visiblePosts count or any fixed number that fills the screen */}
        {Array.from({ length: visiblePosts }).map((_, i) => (
          <PostSkeleton key={i} /> // Add key prop to the PostSkeleton component
        ))}
      </Grid>
    )

  return (
    <Box>
      <HStack justifyContent="center" marginBottom={"12px"}>
        <ButtonGroup size="sm" isAttached variant="outline" colorScheme="green">
          <Button
            onClick={() => setPostType("trending")}
            isActive={postType === "trending"}
          >
            Trending
          </Button>
          <Button
            onClick={() => setPostType("created")}
            isActive={postType === "created"}
          >
            Most Recent
          </Button>
          {/* Following Section */}
          {hiveUser.hiveUser !== null && (

            <Button
              onClick={() => setPostType("created")}
              isActive={postType === "created"}
            >
              My Crew
            </Button>
          )}


        </ButtonGroup>

        <Button
          size={"sm"}
          as={Link}
          href={"/upload"}
          colorScheme="green"
          variant={"outline"}
        >
          + Upload 🛹
        </Button>
      </HStack>
      <InfiniteScroll
        dataLength={visiblePosts}
        next={() => setVisiblePosts((visiblePosts) => visiblePosts + 3)}
        hasMore={visiblePosts < posts.length}
        loader={
          <Flex justify="center">
            <BeatLoader size={8} color="darkgrey" />
          </Flex>
        }
        style={{ overflow: "hidden" }}
      >
        <Grid
          templateColumns={{
            base: "repeat(1, 1fr)",
            md: "repeat(2, 1fr)",
            lg: "repeat(3, 1fr)",
            xl: "repeat(4, 1fr)",
          }}
          gap={0}
        >
          {posts.length > 0 &&
            posts.slice(0, visiblePosts).map((post, i) => {
              return (
                <Post
                  key={`${postType}-${post.url}`}
                  postData={PostModel.newFromDiscussion(post)}
                />
              )
            })}
        </Grid>
      </InfiniteScroll>
    </Box>
  )
}
