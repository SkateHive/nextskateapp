import CommandPrompt from "@/components/PostModal/commentPrompt";
import CommentsSection from "@/components/PostModal/commentSection";
import { usePostContext } from "@/contexts/PostContext";
import { useComments } from "@/hooks/comments";
import { Box } from "@chakra-ui/react";

interface CommentsProps {
  author: string;
  permlink: string;
  commentsUpdated: boolean;
  onCommentPosted: () => void;
}

const CommentsComponent = (props: CommentsProps) => {
  const { author, permlink } = props;
  const { post } = usePostContext();

  const { comments, addComment, isLoading } = useComments(author, permlink);

  const onClose = () => {
    ("Closing comment section...");
  };

  const handleNewComment = (newComment: any) => {
    addComment(newComment); 
    props.onCommentPosted(); 
  };

  return (
    <Box color={"white"}>
      <CommandPrompt
        post={post}
        onClose={onClose}
        author={author}
        permlink={permlink}
        onNewComment={handleNewComment} 
      />
      <CommentsSection comments={comments} />
    </Box>
  );
};

export default CommentsComponent;
