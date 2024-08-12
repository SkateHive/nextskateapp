import { Box, Button } from "@chakra-ui/react";
import CommentList from "./CommentsList";

interface ToggleCommentsProps {
  isEyeClicked: boolean;
  setIsEyeClicked: React.Dispatch<React.SetStateAction<boolean>>;
  commentReplies: any[];
  visiblePosts: number;
  setVisiblePosts: React.Dispatch<React.SetStateAction<number>>;
  username: string;
  handleVote: (author: string, permlink: string) => void;
}

const ToggleComments = ({
  isEyeClicked,
  setIsEyeClicked,
  commentReplies,
  visiblePosts,
  setVisiblePosts,
  username,
  handleVote
}: ToggleCommentsProps) => {
  return (
    <>
      {isEyeClicked && (
        <Box ml={10} mt={4} pl={4} borderLeft="2px solid gray">
          <CommentList
            comments={commentReplies}
            visiblePosts={visiblePosts}
            setVisiblePosts={setVisiblePosts}
            username={username}
            handleVote={handleVote}
          />

          {visiblePosts < commentReplies.length && (
            <Button
              onClick={() => setVisiblePosts(visiblePosts + 5)}
              variant="outline"
              colorScheme="green"
              size="sm"
              mt={4}
            >
              Show More
            </Button>
          )}
        </Box>
      )}
    </>
  );
};

export default ToggleComments;
