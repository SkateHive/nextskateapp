import { Box, Button, HStack, IconButton, Image, Input } from "@chakra-ui/react";
import React, { useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import { FaImage, FaTimes } from "react-icons/fa";
import { uploadFileToIPFS } from "../../../upload/utils/uploadToIPFS";

interface PostBoxMediaProps {
  imageList: string[];
  setImageList: React.Dispatch<React.SetStateAction<string[]>>;
  isUploading: boolean;
  handlePostClick: () => void;
}

const PINATA_GATEWAY_TOKEN = process.env.NEXT_PUBLIC_PINATA_GATEWAY_TOKEN;

const PostBoxMedia: React.FC<PostBoxMediaProps> = ({ imageList, setImageList,  handlePostClick }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false)

  const { getRootProps, getInputProps } = useDropzone({
    noClick: true,
    noKeyboard: true,
    onDrop: async (acceptedFiles) => {
      setIsUploading(true);
      const newImageList: string[] = []
      for (const file of acceptedFiles) {
        const ipfsData = await uploadFileToIPFS(file);
        if (ipfsData !== undefined) {
          const ipfsUrl = `https://ipfs.skatehive.app/ipfs/${ipfsData.IpfsHash}?pinataGatewayToken=${PINATA_GATEWAY_TOKEN}`;
          const markdownLink = file.type.startsWith("video/")
            ? `<iframe src="${ipfsUrl}" allowfullscreen></iframe>`
            : `![Image](${ipfsUrl})`;
          newImageList.push(markdownLink);
        }
      }
      setImageList((prevList) => [...prevList, ...newImageList]);
      setIsUploading(false);
    },
    accept: {
      "image/*": [".png", ".gif", ".jpeg", ".jpg"],
      "video/*": [".mp4", ".mov"],
    },
    multiple: true,
  });

  const handleRemoveImage = (index: number) => {
    setImageList((prevList) => prevList.filter((_, i) => i !== index));
  };

  return (
    <Box  {...getRootProps()}>
        
      <HStack>
        {imageList.map((item, index) => (
          <Box key={index} position="relative" maxW={100} maxH={100}>
            <IconButton
              aria-label="Remove image"
              icon={<FaTimes style={{ color: "black", strokeWidth: 1 }} />}
              size="base"
              color="white"
              bg="white"
              _hover={{ bg: "white", color: "black" }}
              _active={{ bg: "white", color: "black" }}
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
                src={item.match(/<iframe src="(.*?)" allowfullscreen><\/iframe>/)?.[1]}
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
          onClick={() => inputRef.current?.click()}
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
    </Box>
  );
};

export default PostBoxMedia;
