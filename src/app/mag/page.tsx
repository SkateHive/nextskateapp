"use client"
import LoginModal from "@/components/Hive/Login/LoginModal"
import Post from "@/components/PostCard"
import PostSkeleton from "@/components/PostCard/Skeleton"
import { useHiveUser } from "@/contexts/UserContext"
import usePosts from "@/hooks/usePosts"
import PostModel from "@/lib/models/post"
import { Box, Button, ButtonGroup, Center, Flex, Grid, HStack } from "@chakra-ui/react"
import { useState } from "react"
import InfiniteScroll from "react-infinite-scroll-component"
import { BeatLoader } from "react-spinners"
import AuthorSearchBar from "../upload/components/searchBar"


export default function Mag() {
  const SKATEHIVE_TAG = [{ tag: "hive-173115", limit: 60 }]
  const [tag, setTag] = useState(SKATEHIVE_TAG)
  const [query, setQuery] = useState("trending")
  const { posts, error, isLoading, setQueryCategory, setDiscussionQuery } =
    usePosts(query, tag)
  const [visiblePosts, setVisiblePosts] = useState(20)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const hiveUser = useHiveUser()

  function updateFeed(query: string, tagParams: any[]) {
    setQuery(query)
    setQueryCategory(query)
    setDiscussionQuery(tagParams)
  }
  if (error) {
    console.log("here")

    return "Error"
  }
  if (isLoading || !posts) {
    return (
      <Box
        w={"100%"}
        height={"101vh"}
        overflow={"auto"}
        sx={{
          "::-webkit-scrollbar": {
            display: "none",
          },
        }}
      >
        <Center>
          <ButtonGroup size="sm" isAttached variant="outline" colorScheme="green">
            <Button
              onClick={() => updateFeed("trending", SKATEHIVE_TAG)}
              isActive={query === "trending"}
            >
              Trending
            </Button>
            <Button
              onClick={() => updateFeed("created", SKATEHIVE_TAG)}
              isActive={query === "created"}
            >
              Most Recent
            </Button>
            {hiveUser.hiveUser && (
              <Button
                onClick={() =>
                  updateFeed("feed", [
                    { tag: hiveUser?.hiveUser?.name, limit: 100 },
                  ])
                }
                isActive={query === "feed"}
              >
                My Crew
              </Button>
            )}
          </ButtonGroup>
        </Center>

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
          {Array.from({ length: visiblePosts }).map((_, i) => (
            <PostSkeleton key={i} />
          ))}
        </Grid>
      </Box>
    )
  }

  const handleCreateClick = () => {
    if (!hiveUser.hiveUser) {
      setIsLoginModalOpen(true)
    } else {
      window.location.href = "/upload"
    }
  }

  return (
    <Box
      height={"101vh"}
      w={"100%"}
      overflow={"auto"}
      sx={{
        "::-webkit-scrollbar": {
          display: "none",
        },
      }}
    >

      <Flex flexDirection={{ base: 'column', md: 'row' }} justifyContent={'space-between'} >
        <AuthorSearchBar onSearch={(author) => updateFeed("blog", [{ tag: author, limit: 10 }])} />
        <HStack justifyContent={'center'}>
          <ButtonGroup size="sm" isAttached variant="outline" colorScheme="green">
            <Button
              onClick={() => updateFeed("trending", SKATEHIVE_TAG)}
              isActive={query === "trending"}
            >
              Trending
            </Button>
            <Button
              onClick={() => updateFeed("created", SKATEHIVE_TAG)}
              isActive={query === "created"}
            >
              Most Recent
            </Button>
            {hiveUser.hiveUser && (
              <Button
                onClick={() =>
                  updateFeed("feed", [
                    { tag: hiveUser?.hiveUser?.name, limit: 100 },
                  ])
                }
                isActive={query === "feed"}
              >
                My Crew
              </Button>
            )}
          </ButtonGroup>
          <Button
            size={"sm"}
            onClick={handleCreateClick}
            colorScheme="green"
            variant={"outline"}
          >
            + Create 🛹
          </Button>
        </HStack>
      </Flex>
      {isLoginModalOpen && (
        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
        />
      )}
      <InfiniteScroll
        dataLength={visiblePosts}
        next={() => setVisiblePosts(visiblePosts + 3)}
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
            posts
              .slice(0, visiblePosts)
              .map((post, i) => (
                <Post
                  key={`${query}-${post.url}`}
                  postData={PostModel.newFromDiscussion(post)}
                />
              ))}
        </Grid>
      </InfiniteScroll>
    </Box>
  )
}
