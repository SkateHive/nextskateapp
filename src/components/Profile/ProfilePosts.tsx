'use client'
import Post from "@/components/PostCard"
import useHiveAccount from "@/hooks/useHiveAccount"
import usePosts from "@/hooks/usePosts"
import PostModel from "@/lib/models/post"
import { HiveAccount } from "@/lib/models/user"
import { Box, Flex, Grid } from "@chakra-ui/react"
import { useState } from "react"
import InfiniteScroll from "react-infinite-scroll-component"
import { BeatLoader } from "react-spinners"


interface ProfilePageProps {
    user: HiveAccount
}

export default function ProfilePosts({ user }: ProfilePageProps) {
    const startDate = new Date()
    const [visiblePosts, setVisiblePosts] = useState(20)
    const { hiveAccount } = useHiveAccount(user.name)
    const { posts, error, isLoading, queryCategory, setQueryCategory, setDiscussionQuery } = usePosts("author_before_date", [user.name, "", startDate.toISOString(), 100])
    if (!hiveAccount || !posts) return <div>Loading...</div>

    return (
    <Box width="100%" minHeight="100vh">
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
                  key={`${queryCategory}-${post.url}`}
                  postData={PostModel.newFromDiscussion(post)}
                />
              )
            })}
        </Grid>
      </InfiniteScroll>
    </Box>
    )
}