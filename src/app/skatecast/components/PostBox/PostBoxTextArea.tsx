import { Avatar, Box, Flex, Textarea } from "@chakra-ui/react";
import React from "react";

interface PostBoxTextAreaProps {
  username?: string;
  postBody: string;
  setPostBody: React.Dispatch<React.SetStateAction<string>>;
}

const PostBoxTextArea: React.FC<PostBoxTextAreaProps> = ({ username, postBody, setPostBody }) => {
  
  function textAreaAdjust(element: any) {
    element.style.height = "1px"
    element.style.height = 25 + element.scrollHeight + "px"
  }

  return (
    <Box >
      <Flex>
        <Avatar
          borderRadius={10}
          boxSize={12}
          src={`https://images.ecency.com/webp/u/${username}/avatar/small`}
        />
        <Textarea
          border="none"
          _focus={{
            border: "none",
            boxShadow: "none",
          }}
          placeholder="What's happening?"
          onChange={(e) => setPostBody(e.target.value)}
          value={postBody}
          overflow={"hidden"}
          resize={"vertical"}
          onKeyUp={(e) => textAreaAdjust(e.target)}
        />
      </Flex>
      
    </Box>
  );
};

export default PostBoxTextArea;
