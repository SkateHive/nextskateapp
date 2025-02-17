'use client';
import CommandPrompt from "@/components/PostModal/commentPrompt";
import CommentsSection from "@/components/PostModal/commentSection";
import { usePostContext } from "@/contexts/PostContext";
import { useHiveUser } from "@/contexts/UserContext";
import { useComments } from "@/hooks/comments";
import { Box, useToast } from "@chakra-ui/react";
import { useState } from "react";

interface CommentsProps {
  author: string;
  permlink: string;
  onCommentPosted: () => void;
}

const CommentsComponent = (props: CommentsProps) => {
  const { author, permlink } = props;
  const { post } = usePostContext();
  const { comments, addComment, isLoading, updateComments } = useComments(author, permlink);
  const [commentsUpdated, setCommentsUpdated] = useState<boolean>(false);
  const toast = useToast();
  const hiveUser = useHiveUser();
  const onClose = () => {
    ("Closing comment section...");
  };

  const handleNewComment = (newComment: any) => {
    addComment(newComment);
    setCommentsUpdated((prev: boolean) => !prev);
    updateComments();
    props.onCommentPosted();
    toast({
      title: "Comment added!",
      status: "success",
      duration: 2000,
      isClosable: true,
    });
  };

  return (
    <Box color={"white"}>
      {hiveUser.hiveUser?.name && (
        <CommandPrompt
          post={post}
          onClose={onClose}
          author={author}
          permlink={permlink}
          onNewComment={handleNewComment}
        />
      )}
      <CommentsSection comments={comments} />
    </Box>
  );
};

export default CommentsComponent;
