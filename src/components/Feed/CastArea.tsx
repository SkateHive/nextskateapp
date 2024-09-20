"use client";

import { uploadFileToIPFS } from "@/app/upload/utils/uploadToIPFS";
import MediaUploader from "@/components/Hive/PostCreation/MediaUpload";
import MediaDisplay from "@/components/Hive/PostCreation/MediaDisplay";
import UserAvatar from "@/components/UserAvatar";
import { useHiveUser } from "@/contexts/UserContext";
import { useComments } from "@/hooks/comments";
import { commentWithPrivateKey } from "@/lib/hive/server-functions";
import { Box, Button, Flex, HStack, Textarea } from "@chakra-ui/react";
import { CommentOperation, CommentOptionsOperation } from "@hiveio/dhive";
import React, { useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import { HIVE_PARENT_AUTHOR, HIVE_PARENT_PERMLINK } from "@/lib/constants";
import { uploadImages } from "@/app/upload/utils/mediaUpload";

function CastArea() {
  const [castContent, setCastContent] = useState<string>();
  const [imageList, setImageList] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [medias, setMedias] = useState<File[]>([]);
  const user = useHiveUser();
  const username = user?.hiveUser?.name;
  const postBodyRef = useRef<HTMLTextAreaElement>(null);
  const [hasPosted, setHasPosted] = useState<boolean>(false);
  const { addComment } = useComments(
    HIVE_PARENT_AUTHOR,
    HIVE_PARENT_PERMLINK
  );

  const handlePaste = async (
    event: React.ClipboardEvent<HTMLTextAreaElement>
  ) => {
    const clipboardItems = event.clipboardData.items;
    for (const item of clipboardItems) {
      if (item.type.startsWith("image/")) {
        const blob = item.getAsFile();
        if (blob) {
          const file = new File([blob], "pasted-image.png", {
            type: blob.type,
          });

          addImages([file]);
        }
      }
    }
    setIsUploading(false);
  };

  const addImages = (images: File[]) => {
    setMedias((prev) => [...prev, ...images]);
  };

  const { getRootProps } = useDropzone({
    noClick: true,
    noKeyboard: true,
    onDrop: (acceptedFiles) => {
      addImages(acceptedFiles);
    },
    accept: {
      "image/*": [".png", ".gif", ".jpeg", ".jpg"],
      "video/*": [".mp4", ".mov"],
    },
    multiple: true,
  });

  const handlePostClick = async () => {
    setIsUploading(true);
    const urls = await uploadImages(medias, "hive");

    const markdownString = (
      castContent +
      "\n" +
      urls.join("\n")
    ).trim();
    if (markdownString === "") {
      alert("Please write something before posting");
      return;
    } else if (markdownString.length > 2000) {
      alert("Post is too long. To make longform content use our /mag section");
      return;
    } else {
      await handlePost(markdownString);
    }

    setIsUploading(false);
  };

  const handlePost = async (markdownString: string) => {
    const permlink = new Date()
      .toISOString()
      .replace(/[^a-zA-Z0-9]/g, "")
      .toLowerCase();

    const loginMethod = localStorage.getItem("LoginMethod");

    if (!username) {
      console.error("Username is missing");
      return;
    }

    const postData = {
      parent_author: HIVE_PARENT_AUTHOR,
      parent_permlink: HIVE_PARENT_PERMLINK,
      author: username,
      permlink: permlink,
      title: "Cast",
      body: markdownString,
      json_metadata: JSON.stringify({
        tags: ["skateboard"],
        app: "skatehive",
      }),
    };

    const operations = [["comment", postData]];

    if (loginMethod === "keychain") {
      if (typeof window !== "undefined") {
        try {
          const response = await new Promise<{
            success: boolean;
            message?: string;
          }>((resolve, reject) => {
            window.hive_keychain.requestBroadcast(
              username,
              operations,
              "posting",
              (response: any) => {
                if (response.success) {
                  resolve(response);
                } else {
                  reject(new Error(response.message));
                }
              }
            );
          });

          if (response.success) {
            if (postBodyRef.current) {
              postBodyRef.current.value = "";
            }
            addComment(postData);
            setImageList([]);
          }
        } catch (error) {
          console.error("Error posting comment:", (error as Error).message);
        }
      }
    } else if (loginMethod === "privateKey") {
      const commentOptions: CommentOptionsOperation = [
        "comment_options",
        {
          author: String(username),
          permlink: permlink,
          max_accepted_payout: "10000.000 HBD",
          percent_hbd: 10000,
          allow_votes: true,
          allow_curation_rewards: true,
          extensions: [
            [
              0,
              {
                beneficiaries: [
                  {
                    account: "skatehacker",
                    weight: 1000,
                  },
                ],
              },
            ],
          ],
        },
      ];

      const postOperation: CommentOperation = [
        "comment",
        {
          parent_author: HIVE_PARENT_AUTHOR,
          parent_permlink: HIVE_PARENT_PERMLINK,
          author: String(username),
          permlink: permlink,
          title: "Cast",
          body: markdownString,
          json_metadata: JSON.stringify({
            tags: ["skateboard"],
            app: "Skatehive App",
            image: "/skatehive_square_green.png",
          }),
        },
      ];

      try {
        await commentWithPrivateKey(
          localStorage.getItem("EncPrivateKey")!,
          postOperation,
          commentOptions
        );
        if (postBodyRef.current) {
          postBodyRef.current.value = "";
        }
        addComment(postData);
        setHasPosted(true);
        setImageList([]);
      } catch (error) {
        console.error("Error posting comment:", (error as Error).message);
      }
    }
  };

  return (
    <Box p={4} width={"100%"} bg="black" color="white" {...getRootProps()}>
      <Flex>
        <UserAvatar
          /* @ts-ignore */
          hiveAccount={user.hiveUser || {}}
          boxSize={12}
          borderRadius={5}
        />
        <Flex flexDir="column" w="100%">
          <Textarea
            border="none"
            _focus={{
              border: "none",
              boxShadow: "none",
            }}
            overflow={"hidden"}
            resize={"vertical"}
            // ref={postBodyRef}
            defaultValue={castContent}
            onChange={(event) => setCastContent(event.target.value)}
            placeholder="Write your stuff..."
            onPaste={handlePaste}
          />
        </Flex>
      </Flex>

      <MediaDisplay
        imageList={medias}
        handleRemoveImage={(index) =>
          setMedias((prevImages) => prevImages.filter((_, i) => i !== index))
        }
      />

      <HStack justifyContent="space-between" marginTop={2}>
        <MediaUploader onUpload={addImages} disabled={isUploading} />
        <Button
          color="#ABE4B8"
          variant="ghost"
          ml="auto"
          onClick={handlePostClick}
          isLoading={isUploading}
          _hover={{
            color: "limegreen",
            textShadow: "0 0 10px 0 limegreen",
            transition: "all 0.2s",
          }}
        >
          Post
        </Button>
      </HStack>
    </Box>
  );
}
export default CastArea;
