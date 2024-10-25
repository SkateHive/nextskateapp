import AuthorSearchBar from "@/app/upload/components/searchBar";
import { useHiveUser } from "@/contexts/UserContext";
import usePosts from "@/hooks/usePosts";
import PostModel from "@/lib/models/post";
import { border, Box, Button, ButtonGroup, color, filter, Flex, Grid, useMediaQuery, VStack } from "@chakra-ui/react";
import Image from "next/image";
import { useCallback, useMemo, useState } from "react";
import { FaBook, FaBookOpen } from "react-icons/fa";
import InfiniteScroll from "react-infinite-scroll-component";
import { BeatLoader } from "react-spinners";
import '../../styles/fonts.css';
import LoginModal from "../Hive/Login/LoginModal";
import Post from "../PostCard";
import PostSkeleton from "../PostCard/Skeleton";
import { blockedUsers } from "@/lib/constants";
import { includes, map, size, slice } from "lodash";
import { url } from "inspector";
import next from "next";
import style from "styled-jsx/style";
const SKATEHIVE_TAG = [{ tag: "hive-173115", limit: 30 }];

interface PostFeedProps {
  posts: any[]; // Use a more specific type based on your application
  visiblePosts: number;
  setVisiblePosts: (count: number) => void;
  query: string;
}

const PostFeed: React.FC<PostFeedProps> = ({ posts, visiblePosts, setVisiblePosts, query }) => {
  const filteredPosts = posts ? posts.filter(post => !blockedUsers.includes(post.author)) : [];
  return (
    <Box overflow={"auto"}>
      <InfiniteScroll
        dataLength={visiblePosts}
        next={() => {
          setVisiblePosts(visiblePosts + 2);
        }}
        hasMore={visiblePosts < filteredPosts.length}
        loader={<Flex justify="center"><BeatLoader size={8} color="darkgrey" /></Flex>}
        style={{ overflow: "hidden" }}
      >
        <Grid templateColumns="repeat(1, 1fr)" gap={0}>
          {filteredPosts.length > 0 &&
            filteredPosts.slice(0, visiblePosts).map((post, i) => (
              <Post key={`${query}-${post.url}`} postData={PostModel.newFromDiscussion(post)} />
            ))}
        </Grid>
      </InfiniteScroll>
    </Box>
  );
};

interface NavigationButtonsProps {
  updateFeed: (query: string, tagParams: any[]) => void;
  feedConfig: { query: string; tag: any[] };
  hiveUser: any;
}

const NavigationButtons: React.FC<NavigationButtonsProps> = ({ updateFeed, feedConfig, hiveUser }) => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const handleCreateClick = () => {
    if (!hiveUser.hiveUser) {
      setIsLoginModalOpen(true);
    } else {
      window.location.href = "/upload";
    }
  };

  const buttonStyle = {
    "&:hover": {
      boxShadow: "4px 4px 6px rgba(167, 255, 0, 0.8)",
    },
    "&:active": {
      transform: "translate(2px, 2px)",
      boxShadow: "2px 2px 3px rgba(167, 255, 0, 0.8)",
    },
  };

  const createButtonStyle = {
    "&:hover": {
      boxShadow: "5px 5px 10px rgba(167, 255, 0, 0.8)",
      backgroundColor: "green",
      color: "black",
      border: "2px solid black",
    },
    "&:active": {
      transform: "translate(2px, 2px)",
      boxShadow: "2px 2px 10px rgba(167, 255, 0, 0.8)",
    },
  };
  const [openBook, setOpenBook] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)")[0];
  return (
    <>
      {isLoginModalOpen && <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />}
      <VStack justifyContent="center" margin="12px" spacing={4}>
        <Box display="flex" justifyContent="center">
          <Button
            size={"lg"}
            onClick={handleCreateClick}
            colorScheme="green"
            variant={"outline"}
            fontFamily="Joystix"
            sx={createButtonStyle}
          >
            <Box marginRight={3} >
              <Image src="/treboard.gif" alt="tre flip Skateboard icon" width={42} height={42} />
            </Box>
            + Create
          </Button>
        </Box>
        <ButtonGroup size="sm" isAttached variant="outline" colorScheme="green">
          <Button
            onClick={() => updateFeed("trending", SKATEHIVE_TAG)}
            isActive={feedConfig.query === "trending"}
            sx={buttonStyle}
          >
            <Box marginRight={3}>
              <Image src="/flyingMoney11.png" alt="Flying Money Icon" width={18} height={18} />
            </Box>
            Hot
            <Box marginLeft={3}>
              <Image src="/flyingMoney22.png" alt="Flying Money Icon" width={18} height={18} />
            </Box>
          </Button>
          <Button
            onClick={() => updateFeed("created", SKATEHIVE_TAG)}
            isActive={feedConfig.query === "created"}
            sx={buttonStyle}
          >
            Fresh
          </Button>
          {hiveUser.hiveUser && (
            <Button
              onClick={() => updateFeed("feed", [{ tag: hiveUser.hiveUser.name, limit: 100 }])}
              isActive={feedConfig.query === "feed"}
              sx={buttonStyle}
            >
              Following
            </Button>
          )}
          {!isMobile && (
            <Button
              sx={buttonStyle}
              onClick={() => {
                console.log("Open Mag View");
                if (window) {
                  window.location.href = "/communityMag";
                }
                setOpenBook(!openBook);
              }}
            >
              {openBook ? <FaBookOpen /> : <FaBook />}

            </Button>
          )}
        </ButtonGroup>

      </VStack>
    </>
  );
};

export default function MagColumn() {
  const SKATEHIVE_TAG = useMemo(() => [{ tag: "hive-173115", limit: 30 }], []);
  const [feedConfig, setFeedConfig] = useState({ tag: SKATEHIVE_TAG, query: "created" });
  const { posts, error, isLoading, setQueryCategory, setDiscussionQuery } = usePosts(feedConfig.query, feedConfig.tag);
  const [visiblePosts, setVisiblePosts] = useState(5);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const hiveUser = useHiveUser();

  const updateFeed = useCallback((query: string, tagParams: { tag: string; limit: number }[]) => {
    setFeedConfig({ query, tag: tagParams });
    setQueryCategory(query);
    setDiscussionQuery(tagParams);
  }, [setQueryCategory, setDiscussionQuery]);

  if (error) return <p>Error loading posts. Please try again later.</p>;
  if (isLoading || !posts) {
    return (
      <>
        <NavigationButtons updateFeed={updateFeed} feedConfig={feedConfig} hiveUser={hiveUser} />
        <Box display="flex" justifyContent="center">
          <Box width="300px">
            <AuthorSearchBar onSearch={(author) => updateFeed("blog", [{ tag: author, limit: 10 }])} />
          </Box>
        </Box>
        <Grid p={1} templateColumns="repeat(1, 1fr)" gap={0} minHeight="100vh" width="100%">
          {Array.from({ length: visiblePosts }).map((_, i) => (
            <PostSkeleton key={i} />
          ))}
        </Grid>
      </>
    );
  }

  return (
    <Box overflow="auto" sx={{ "&::-webkit-scrollbar": { display: "none" } }}>
      <NavigationButtons updateFeed={updateFeed} feedConfig={feedConfig} hiveUser={hiveUser} />
      <Box display="flex" justifyContent="center">
        <Box width="300px">
          <AuthorSearchBar onSearch={(author) => updateFeed("blog", [{ tag: author, limit: 10 }])} />
        </Box>
      </Box>
      <PostFeed posts={posts} visiblePosts={visiblePosts} setVisiblePosts={setVisiblePosts} query={feedConfig.query} />
      {isLoginModalOpen && <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />}
    </Box>
  );
}
