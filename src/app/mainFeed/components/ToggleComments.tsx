import { Box, Button } from "@chakra-ui/react";
import CommentList from "./CommentsList";

interface ToggleCommentsProps {
  isEyeClicked?: boolean;
  commentReplies: any[];
  visiblePosts: number;
  setVisiblePosts: React.Dispatch<React.SetStateAction<number>>;
  username: string;
  handleVote: (author: string, permlink: string) => void;
  shouldShowAllComments?: boolean;
  isCommentFormVisible?: boolean;
}

const ToggleComments = ({
  isEyeClicked,
  commentReplies,
  visiblePosts,
  setVisiblePosts,
  username,
  handleVote,
  shouldShowAllComments,
  isCommentFormVisible
}: ToggleCommentsProps) => {
  const shouldShowComments = isEyeClicked || shouldShowAllComments || isCommentFormVisible;
  return (
    <>
      {shouldShowComments && (
        <Box ml={10} mt={4} pl={4} borderLeft="2px solid gray">
          <CommentList
            comments={commentReplies}
            visiblePosts={visiblePosts}
            setVisiblePosts={setVisiblePosts}
            username={username}
            handleVote={handleVote}
          />

          {visiblePosts < commentReplies.length && !isCommentFormVisible && (
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
