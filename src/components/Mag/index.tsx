"use client"
import AuthorSearchBar from "@/app/upload/components/searchBar"
import { useHiveUser } from "@/contexts/UserContext"
import usePosts from "@/hooks/usePosts"
import PostModel from "@/lib/models/post"
import { Box, Button, ButtonGroup, Flex, Grid, HStack, Tooltip } from "@chakra-ui/react"
import { useEffect, useState } from "react"
import InfiniteScroll from "react-infinite-scroll-component"
import { BeatLoader } from "react-spinners"
import LoginModal from "../Hive/Login/LoginModal"
import Post from "../PostCard"
import PostSkeleton from "../PostCard/Skeleton"
import AvatarModal from "./AvatarModal"



export default function MagColumn() {
  const SKATEHIVE_TAG = [{ tag: "hive-173115", limit: 100 }]
  const [tag, setTag] = useState(SKATEHIVE_TAG)
  const [query, setQuery] = useState("created")
  const { posts, error, isLoading, setQueryCategory, setDiscussionQuery } = usePosts(query, tag)
  const [visiblePosts, setVisiblePosts] = useState(20)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [userHasProfileImage, setUserHasProfileImage] = useState(false)
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false)

  const hiveUser = useHiveUser()

  useEffect(() => {
    console.log("Dados do usuário:", hiveUser.hiveUser?.metadata?.profile?.profile_image || "");
    if (hiveUser.hiveUser && hiveUser.hiveUser.metadata) {
      let metadata = null;
      try {
        metadata = JSON.parse(hiveUser.hiveUser.json_metadata);
        console.log("Parsed metadata:", metadata);
        const profileImage = metadata.profile?.profile_image || "";
        setUserHasProfileImage(!!profileImage);
      } catch (error) {
        console.error("Erro ao fazer parse do JSON metadata:", error);
      }
    }
  }, [hiveUser]);
  
  

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

      <Grid
        p={1}
        templateColumns={{
          base: "repeat(1, 1fr)",
        }}
        gap={0}
        minHeight="100vh"
        width={"100%"}
      >
        {Array.from({ length: visiblePosts }).map((_, i) => (
          <PostSkeleton key={i} />
        ))}
      </Grid>
    )
  }

  const handleCreateClick = () => {
    if (!hiveUser.hiveUser) {
      setIsLoginModalOpen(true)
    } else {
      window.location.href = "/upload"
    }
  }

  const handleAuthorSearch = (author: string) => {
    updateFeed("blog", [{ tag: author, limit: 10 }])
  }
  const handleOpenAvatarModal = () => {
    setIsAvatarModalOpen(true)
  }


  return (
    <Box
      height={"100vh"}
      overflow={"auto"}
      sx={{
        "&::-webkit-scrollbar": {
          display: "none",
        },
      }}
    >
      <Box m={1.5}>
        <AuthorSearchBar onSearch={handleAuthorSearch} />
      </Box>

      <HStack justifyContent="center" marginBottom={"12px"}>
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
      {isLoginModalOpen && (
        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
        />
      )}
      {hiveUser.hiveUser && !userHasProfileImage && (
        <HStack justifyContent="center" marginBottom={"12px"}>
          <Tooltip label="No profile photo? Click here!" bg={"black"} color={"#A5D6A7"} border={"1px dashed #A5D6A7"}>
            <Button
              size={"sm"}
              colorScheme="green"
              variant={"outline"}
              onClick={handleOpenAvatarModal}
            >
              Update Profile
            </Button>
          </Tooltip>
          {isAvatarModalOpen && (
            <AvatarModal
              isOpen={isAvatarModalOpen}
              onClose={() => setIsAvatarModalOpen(false)}
              user={hiveUser.hiveUser}
            />
          )}
        </HStack>
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
