"use client"
import {
  Avatar,
  Box,
  Button,
  Divider,
  Flex,
  HStack,
  IconButton,
  Image,
  Input,
  Textarea,
} from "@chakra-ui/react"
import { useEffect, useRef, useState } from "react"
import { useDropzone } from "react-dropzone"
import { FaImage, FaTimes } from "react-icons/fa"
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

  const { getRootProps, getInputProps, open } = useDropzone({
    noClick: true,
    noKeyboard: true,
    onDrop: async (acceptedFiles) => {
      setIsUploading(true)
      const newImageList: string[] = []
      for (const file of acceptedFiles) {
        const ipfsData = await uploadFileToIPFS(file)
        if (ipfsData !== undefined) {
          const ipfsUrl = `https://ipfs.skatehive.app/ipfs/${ipfsData.IpfsHash}?pinataGatewayToken=${PINATA_GATEWAY_TOKEN}`
          const markdownLink = file.type.startsWith("video/")
            ? `<iframe src="${ipfsUrl}" allowfullscreen></iframe>`
            : `![Image](${ipfsUrl})`
          newImageList.push(markdownLink)
        }
      }
      setImageList((prevList) => [...prevList, ...newImageList])
      setIsUploading(false)
    },
    accept: {
      "image/*": [".png", ".gif", ".jpeg", ".jpg"],
      "video/*": [".mp4", ".mov"],
    },
    multiple: true,
  })

  const handleImageUploadClick = () => {
    open()
  }

  const handleRemoveImage = (index: number) => {
    setImageList((prevList) => prevList.filter((_, i) => i !== index))
  }

  function textAreaAdjust(element: any) {
    element.style.height = "1px"
    element.style.height = 25 + element.scrollHeight + "px"
  }

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
          <Box key={index} position="relative" maxW={100} maxH={100}>
          <IconButton
          aria-label="Remove image"
          icon={<FaTimes style={{ color: 'black', strokeWidth: 1 }} />} 
          size="base"
          color="white"
          bg="white"
          _hover={{ bg: 'white', color: 'black' }} 
          _active={{ bg: 'white', color: 'black' }}
          position="absolute"
          top="0"
          right="0"
          onClick={() => handleRemoveImage(index)}
          zIndex="1"
          borderRadius="full" 
        />
            {item.includes("![Image](") ? (
              <Image
                src={item.match(/!\[Image\]\((.*?)\)/)?.[1] || ""}
                alt="markdown-image"
                maxW="100%"
                maxH="100%"
                objectFit="contain"
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
        <Button
          colorScheme="green"
          variant="ghost"
          onClick={handleImageUploadClick}
        >
          <FaImage color="#ABE4B8" cursor="pointer" />
        </Button>
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
