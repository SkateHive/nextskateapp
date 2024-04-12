import Post, { PostComponentProps } from "@/components/PostCard"
import ProfileHeader from "@/components/ProfileHeader"
import HiveClient from "@/lib/hiveclient"
import PostModel from "@/lib/models/post"
import { getUserFromUsername } from "@/lib/services/userService"
import { Box, Grid } from "@chakra-ui/react" // Import Grid and Box for layout
import ProfileTabs from "./profileTabs"
const hiveClient = HiveClient

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
        const user = await post.authorDetails()
        return { postData: post.simplify(), userData: user.simplify() }
      })
    )
  return [{} as PostComponentProps]
}

interface ProfilePageProps {
  params: {
    username: string
  }
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const user = await getUserFromUsername(params.username)
  const posts = await getBlogFromUsername(params.username)
  return (
    <Box width="100%" minHeight="100vh">
      <ProfileHeader userData={user} />
      <ProfileTabs params={params} />
      <Grid
        templateColumns={{
          base: "repeat(1, 1fr)",
          md: "repeat(2, 1fr)",
          lg: "repeat(3, 1fr)",
        }} // Responsive grid columns
        gap={0} // Adjust gap as needed
        p={2}
      >

        {posts &&
          posts.map(({ postData }, i) => <Post key={i} postData={postData} />)}
      </Grid>
    </Box>
  )
}
