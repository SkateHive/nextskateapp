"use client"
import {
  Avatar,
  Box,
  Button,
  Divider,
  Flex,
  HStack,
  Input,
  Textarea
} from "@chakra-ui/react"
import { useEffect, useRef, useState } from "react"
import { useDropzone } from "react-dropzone"
import { FaImage } from "react-icons/fa"
import { uploadFileToIPFS } from "../../upload/utils/uploadToIPFS"

interface PostBoxProps {
  username?: string
  postBody: string
  setPostBody: (body: string | ((prevMarkdown: string) => string)) => void;
  handlePost: () => void
}

const PINATA_GATEWAY_TOKEN = process.env.NEXT_PUBLIC_PINATA_GATEWAY_TOKEN

const PostBox = ({ username, postBody, setPostBody, handlePost }: PostBoxProps) => {
  const [isUploading, setIsUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const [imageList, setImageList] = useState<string[]>([])
  const [shouldPost, setShouldPost] = useState(false)

  const { getRootProps, getInputProps } = useDropzone({
    noClick: true,
    noKeyboard: true,
    onDrop: async (acceptedFiles) => {
      setIsUploading(true)
      for (const file of acceptedFiles) {
        const ipfsData = await uploadFileToIPFS(file);
        if (ipfsData !== undefined) {
          const ipfsUrl = `https://ipfs.skatehive.app/ipfs/${ipfsData.IpfsHash}?pinataGatewayToken=${PINATA_GATEWAY_TOKEN}`;
          const markdownLink = file.type.startsWith("video/")
            ? `<iframe src="${ipfsUrl}" allowfullscreen></iframe>`
            : `![Image](${ipfsUrl})`;

          setImageList((prevList) => [...prevList, markdownLink])
        }
      }
      setIsUploading(false)
    },
    accept: {
      "image/*": [".png", ".gif", ".jpeg", ".jpg"],
      "video/*": [".mp4", ".mov"],
    },
    multiple: true,
  })

  const handleImageUploadClick = () => {
    if (inputRef.current) {
      inputRef.current.click()
    }
  }

  function textAreaAdjust(element: any) {
    element.style.height = "1px"
    element.style.height = 25 + element.scrollHeight + "px"
  }

  const handlePostClick = () => {
    setPostBody((prevMarkdown: string) => {
      const updatedBody = `${prevMarkdown}\n${imageList.join('\n')}\n`;
      console.log("imageList", imageList, "updatedBody", updatedBody);
      return updatedBody;
    });
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
    <Box p={4} width={"100%"} bg="black" color="white" {...getRootProps()}>
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
      <HStack>
        {imageList.map((item, index) => (
          <Box key={index}>
            {item.includes("![Image](") ? (
              <img
                src={item.match(/!\[Image\]\((.*?)\)/)?.[1]}
                alt="markdown-image"
                width="100%"
                height="auto" // Adjust the height as needed
              />
            ) : (
              <video
                src={
                  item.match(
                    /<iframe src="(.*?)" allowfullscreen><\/iframe>/
                  )?.[1]
                }
                controls
                muted
                width="100%"
              />
            )}
          </Box>
        ))}
      </HStack>
      <HStack justifyContent="space-between" m={4}>
        <Input
          id="md-image-upload"
          type="file"
          style={{ display: "none" }}
          {...getInputProps({ refKey: "ref" })}
          ref={inputRef}
        />
        <FaImage
          color="#ABE4B8"
          cursor="pointer"
          onClick={handleImageUploadClick}
        />
        <Button
          colorScheme="green"
          variant="outline"
          ml="auto"
          onClick={handlePostClick}
          isLoading={isUploading}
        >
          Post
        </Button>
      </HStack>
      <Divider mt={4} />
    </Box>
  )
}

export default PostBox
