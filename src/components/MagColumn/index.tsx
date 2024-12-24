import AuthorSearchBar from "@/app/upload/components/searchBar";
import { useHiveUser } from "@/contexts/UserContext";
import usePosts from "@/hooks/usePosts";
import { blockedUsers } from "@/lib/constants";
import PostModel from "@/lib/models/post";
import { Box, Button, ButtonGroup, Flex, Grid, Image, Text, useMediaQuery, VStack } from "@chakra-ui/react";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FaBook, FaBookOpen } from "react-icons/fa";
import { BeatLoader } from "react-spinners";
import "../../styles/fonts.css";
import LoginModal from "../Hive/Login/LoginModal";
import Post from "../PostCard";
import PostSkeleton from "../PostCard/Skeleton";

const SKATEHIVE_TAG = [{ tag: "hive-173115", limit: 30 }];

interface PostFeedProps {
  posts: any[];
  visiblePosts: number;
  setVisiblePosts: React.Dispatch<React.SetStateAction<number>>;
  query: string;
  loading: boolean;
}

const PostFeed: React.FC<PostFeedProps> = ({ posts, visiblePosts, setVisiblePosts, query, loading }) => {
  const observerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentRef = observerRef.current;
    if (!currentRef) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting) {
          setVisiblePosts((prev) => prev + 5);
        }
      },
      {
        root: null,
        rootMargin: "0px",
        threshold: 0.1,
      }
    );

    observer.observe(currentRef);

    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, [setVisiblePosts]);
  if (loading || !posts) {
    return (
      <Grid p={1} templateColumns="repeat(1, 1fr)" gap={0} width="100%">
        {Array.from({ length: 3 }).map((_, i) => (
          <PostSkeleton key={i} />
        ))}
      </Grid>
    );
  }

  const filteredPosts = posts
    ? posts.filter(
      (post) =>
        !blockedUsers.includes(post.author) && post.body && post.body.length >= 240
    )
    : [];

  return (
    <Box overflow={"auto"}>
      <Grid templateColumns="repeat(1, 1fr)" gap={0}>
        {filteredPosts.length > 0 &&
          filteredPosts.slice(0, visiblePosts).map((post, i) => (
            <Post key={`${query}-${post.url}`} postData={PostModel.newFromDiscussion(post)} />
          ))}

        {visiblePosts < filteredPosts.length && (
          <Flex justify="center" ref={observerRef} style={{ height: "50px" }}>
            <BeatLoader size={8} color="darkgrey" />
          </Flex>
        )}
      </Grid>

      {visiblePosts === 0 && filteredPosts.length === 0 && (
        <Flex justify="center">
          <BeatLoader size={8} color="darkgrey" />
        </Flex>
      )}
    </Box>
  );
};

interface NavigationButtonsProps {
  updateFeed: (query: string, tagParams: { tag: string; limit: number }[]) => void;
  feedConfig: { query: string; tag: any[] };
  hiveUser: any;
}

const NavigationButtons: React.FC<NavigationButtonsProps> = ({
  updateFeed,
  feedConfig,
  hiveUser,
}) => {
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
      {isLoginModalOpen && (
        <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
      )}
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
            <Box marginRight={3}>
              <Image
                src="/treboard.gif"
                alt="tre flip Skateboard icon"
                width={42}
                height={42}
                style={{ width: "auto", height: "auto" }}
              />
            </Box>
            + Add to Mag
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
  const { posts, error, isLoading, setQueryCategory, setDiscussionQuery } = usePosts(
    feedConfig.query,
    feedConfig.tag
  );
  const [visiblePosts, setVisiblePosts] = useState<number>(5);
  const hiveUser = useHiveUser();

  const updateFeed = useCallback(
    (query: string, tagParams: { tag: string; limit: number }[]) => {
      setFeedConfig({ query, tag: tagParams });
      setQueryCategory(query);
      setDiscussionQuery(tagParams);
    },
    [setQueryCategory, setDiscussionQuery]
  );

  if (error) return <p>Error loading posts. Please try again later.</p>;
  if (isLoading || !posts) {
    return (
      <>
        <NavigationButtons updateFeed={updateFeed} feedConfig={feedConfig} hiveUser={hiveUser} />
        <Box display="flex" justifyContent="center">
          <Box width="300px">
            <AuthorSearchBar
              onSearch={(author) => updateFeed("blog", [{ tag: author, limit: 10 }])}
            />
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
          <AuthorSearchBar
            onSearch={(author) => updateFeed("blog", [{ tag: author, limit: 10 }])}
          />
        </Box>
      </Box>
      {error && (
        <Flex justify="center" mt={4}>
          <Text>Error loading posts. Please try again later.</Text>
        </Flex>
      )}
      <PostFeed
        posts={posts}
        visiblePosts={visiblePosts}
        setVisiblePosts={setVisiblePosts}
        query={feedConfig.query}
        loading={isLoading}
      />
      {!isLoading && posts && posts.length === 0 && (
        <Flex justify="center" mt={4}>
          <Text>No posts found. Try another filter or check back later.</Text>
        </Flex>
      )}
    </Box>
  );
}