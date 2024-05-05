'use client'
import Post, { PostComponentProps } from "@/components/PostCard"
import ProfileHeader from "@/components/ProfileHeader"
import HiveClient from "@/lib/hive/hiveclient"
import PostModel from "@/lib/models/post"
// import { getUserFromUsername } from "@/lib/services/userService"
import { Box, Grid, Flex } from "@chakra-ui/react" // Import Grid and Box for layout
import ProfileTabs from "./profileTabs"
import useHiveAccount from "@/hooks/useHiveAccount"
import usePosts from "@/hooks/usePosts"
import { HiveAccount } from "@/lib/models/user"
import { useState } from "react"
import InfiniteScroll from "react-infinite-scroll-component"
import { BeatLoader } from "react-spinners"
import { useMemo } from "react"
const hiveClient = HiveClient

/*
async function getBlogFromUsername(
  username: string
): Promise<PostComponentProps[]> {
  const response = await hiveClient.database.getDiscussions("blog", {
    limit: 20,
    tag: username,
  })
  if (Array.isArray(response) && response.length > 0)
    return await Promise.all(
      response.map(async (postData) => {
        const post = PostModel.newFromDiscussion(postData)
        //@ts-ignore
        const user = await post.authorDetails()
        return { postData: post.simplify(), userData: user.simplify() }
      })
    )
  return [{} as PostComponentProps]
}
*/
interface ProfilePageProps {
  params: {
    username: string
  }
}

export default function ProfilePage({ params }: ProfilePageProps) {
  const username = useMemo(() => params.username, [params.username]);

  const [visiblePosts, setVisiblePosts] = useState(20)
  const { hiveAccount } = useHiveAccount(params.username)
  const { posts, error, isLoading } = usePosts("blog", { tag: params.username, limit: 100 })
  if (!hiveAccount || !posts) return <div>Loading...</div>
  return (
    <Box width="100%" minHeight="100vh">
      <ProfileHeader user={hiveAccount} />
      <ProfileTabs params={params} />
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
                  key={`${post.url}`}
                  postData={PostModel.newFromDiscussion(post)}
                />
              )
            })}
        </Grid>
      </InfiniteScroll>
    </Box>
  )
}
