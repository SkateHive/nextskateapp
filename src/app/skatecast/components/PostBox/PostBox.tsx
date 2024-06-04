"use client"
import { Box, Divider } from "@chakra-ui/react"
import { useEffect, useState } from "react"
import PostBoxMedia from "./PostBoxMedia"
import PostBoxTextArea from "./PostBoxTextArea"

interface PostBoxProps {
  username?: string
  postBody: string
  setPostBody: (body: string | ((prevMarkdown: string) => string)) => void;
  handlePost: () => void
}


const PostBox = ({ username, postBody, setPostBody, handlePost }: PostBoxProps) => {
  const [isUploading, setIsUploading] = useState(false)
  const [imageList, setImageList] = useState<string[]>([])
  const [shouldPost, setShouldPost] = useState(false)

  const handlePostClick = () => {
    setPostBody((prevMarkdown: string) => {
      const updatedBody = `${prevMarkdown}\n${imageList.join('\n')}\n`;
      return updatedBody;
    });
    if (postBody.trim() === "" && imageList.length === 0) {
      alert("Nothing to say?")
      return;
    }
    setShouldPost(true);
  };

  useEffect(() => {
    if (shouldPost) {
      handlePost();
      setPostBody("");
      setImageList([]);
      setShouldPost(false);
    }
  }, [shouldPost, handlePost, setPostBody, setImageList]);

  return (
    <Box p={4} width={"100%"} bg="black" color="white" >
     <div>
     <PostBoxTextArea
     username={username}
     postBody={postBody}
     setPostBody={setPostBody}
   />
   <PostBoxMedia
     imageList={imageList}
     setImageList={setImageList}
     isUploading={isUploading}
     handlePostClick={handlePostClick}
   />
     </div>
     <Divider mt={4} />
    </Box>
  )
}

export default PostBox
