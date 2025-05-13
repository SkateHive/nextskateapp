import React, { useRef, useState, forwardRef } from "react";
import {
  Textarea,
  IconButton,
  Button,
  HStack,
  VStack,
  Flex,
  Tooltip,
  useToast,
  Spinner,
} from "@chakra-ui/react";
import { useDropzone } from "react-dropzone";
import { FaImage, FaSmile } from "react-icons/fa";
import { EmojiPickerComponent } from "./EmojiPicker";
import { uploadFileToIPFS } from "@/app/upload/utils/uploadToIPFS";
import { MediaListComponent } from "./MediaList";
import { commentWithPrivateKey } from "@/lib/hive/server-functions";
import { CommentOperation, CommentOptionsOperation } from "@hiveio/dhive";
import { getFileSignature, uploadImage } from "@/lib/hive/client-functions";

interface MainInputProps {
  username: string;
  value?: string;
  onCommentChange?: (comment: string) => void;
  onCommentSubmit?: (newComment: any) => void;
  isLoading?: boolean;
  canPost?: boolean; // add this
  onRequireProfilePic?: () => void; // add this
}

interface IPFSData {
  IpfsHash: string;
  PinSize?: number;
  Timestamp?: string;
  PinStatus?: string;
}

interface MediaItem {
  url: string;
  type: "image" | "video";
  extension?: string;
}

const MainInput = forwardRef<HTMLTextAreaElement, MainInputProps>(
  (
    {
      username,
      value = "",
      onCommentChange,
      onCommentSubmit,
      isLoading,
      canPost = true, // default true
      onRequireProfilePic,
    },
    ref
  ) => {
    const [comment, setComment] = useState(value);
    const [mediaList, setMediaList] = useState<MediaItem[]>([]);
    const [isPickingEmoji, setIsPickingEmoji] = useState(false);
    const [isUploadingMedia, setIsUploadingMedia] = useState(false);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const toast = useToast();
    const [isProcessing, setIsProcessing] = useState(false);

    const { getRootProps, getInputProps } = useDropzone({
      onDrop: async (acceptedFiles: File[]) => {
        setIsUploadingMedia(true);
        const newMediaList: MediaItem[] = [];
        for (const file of acceptedFiles) {
          const fileType = file.type;
          const fileExtension = file.name.split(".").pop();
          if (fileType.startsWith("video/")) {
            const ipfsData: IPFSData | undefined = await uploadFileToIPFS(file);
            if (ipfsData !== undefined) {
              const ipfsUrl = `https://ipfs.skatehive.app/ipfs/${ipfsData.IpfsHash}`;
              newMediaList.push({
                url: ipfsUrl,
                type: "video",
                extension: fileExtension,
              });
            }
          } else if (fileType.startsWith("image/")) {
            const signature = await getFileSignature(file);
            const uploadUrl = await uploadImage(file, signature);
            newMediaList.push({ url: uploadUrl, type: "image" });
          }
        }
        setMediaList((prevList) => [...prevList, ...newMediaList]);
        setIsUploadingMedia(false);
      },
      accept: {
        "image/*": [".png", ".gif", ".jpeg", ".jpg"],
        "video/*": [".mp4", ".mov", ".webm", ".ogg"],
      },
      multiple: true,
    });

    const handlePost = async () => {
      if (!canPost) {
        if (onRequireProfilePic) onRequireProfilePic();
        else alert("You must set a profile picture before posting.");
        return;
      }

      const markdownString = comment.trim();
      if (!markdownString) {
        return;
      } else if (markdownString.length > 2000) {
        alert(
          "Post is too long. To make longform content use our /mag section"
        );
        return;
      }

      const mediaMarkdown = mediaList
        .map((media) => {
          if (media.type === "video") {
            return `<iframe src="${media.url}" allowFullScreen={true}></iframe>`;
          } else {
            return `![Image](${media.url})`;
          }
        })
        .join("\n");

      const finalComment = `${markdownString}\n${mediaMarkdown}`;

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
        parent_author: process.env.NEXT_PUBLIC_MAINFEED_AUTHOR || "skatehacker",
        parent_permlink:
          process.env.NEXT_PUBLIC_MAINFEED_PERMLINK || "test-advance-mode-post",
        author: username,
        permlink: permlink,
        title: "Cast",
        body: finalComment,
        json_metadata: JSON.stringify({
          tags: ["skateboard"],
          app: "skatehive",
        }),
      };
      const operations = [["comment", postData]];

      setIsProcessing(true);

      // Display the persistent toast
      const toastId = "processing-toast";
      if (!toast.isActive(toastId)) {
        toast({
          id: toastId,
          title: "Processing",
          description: "Your post is being submitted...",
          status: "info",
          duration: null,
          isClosable: false,
        });
      }

      try {
        if (loginMethod === "keychain") {
          if (typeof window !== "undefined") {
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
              setComment("");
              setMediaList([]);
              toast.close(toastId); // Close the processing toast
              onCommentSubmit?.(postData); // Pass the new comment data
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
              parent_author:
                process.env.NEXT_PUBLIC_MAINFEED_AUTHOR || "skatehacker",
              parent_permlink:
                process.env.NEXT_PUBLIC_MAINFEED_PERMLINK ||
                "test-advance-mode-post",
              author: String(username),
              permlink: permlink,
              title: "Cast",
              body: finalComment,
              json_metadata: JSON.stringify({
                tags: ["skateboard"],
                app: "Skatehive App",
                image: "/SKATE_HIVE_VECTOR_FIN.svg",
              }),
            },
          ];

          await commentWithPrivateKey(
            localStorage.getItem("EncPrivateKey")!,
            postOperation,
            commentOptions
          );
          setComment("");
          setMediaList([]);
          toast.close(toastId); // Close the processing toast
          onCommentSubmit?.(postData); // Pass the new comment data
        }
      } catch (error) {
        console.error("Error posting comment:", (error as Error).message);
        toast.close(toastId); // Close the processing toast
        toast({
          title: "Error",
          description: `Failed to post: ${(error as Error).message}`,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setIsProcessing(false);
      }
    };

    return (
      <VStack spacing={3} w="full" p={3} borderRadius="md" {...getRootProps()}>
        <Flex w="full" align="center">
          <Textarea
            ref={ref}
            value={comment}
            onChange={(e) => {
              setComment(e.target.value);
              onCommentChange?.(e.target.value);
            }}
            placeholder="Write your thoughts..."
            resize="vertical"
            minH="80px"
            color="white"
            border={0}
            _focusVisible={{ border: 0 }}
            borderRadius="md"
            w={"full"}
          />
        </Flex>
        <MediaListComponent mediaList={mediaList} setMediaList={setMediaList} />
        <HStack w="full" justify="space-between">
          <HStack spacing={2}>
            <Tooltip
              label={isUploadingMedia ? "Uploading Media..." : "Upload Media"}
            >
              <IconButton
                aria-label="Upload Media"
                icon={<FaImage size={18} color="#ABE4B8" />}
                variant="ghost"
                onClick={() => inputRef.current?.click()}
              />
            </Tooltip>
            <input
              {...getInputProps()}
              ref={inputRef}
              style={{ display: "none" }}
            />
            <Tooltip label="Add Emoji">
              <IconButton
                aria-label="Add Emoji"
                icon={<FaSmile size={18} color="#ABE4B8" />}
                variant="ghost"
                onClick={() => setIsPickingEmoji(!isPickingEmoji)}
              />
            </Tooltip>
          </HStack>
          <Button
            colorScheme="green"
            variant={"ghost"}
            isLoading={isLoading || isProcessing || isUploadingMedia}
            onClick={handlePost}
          >
            {isUploadingMedia ? <Spinner size="sm" /> : "Post"}
          </Button>
        </HStack>
        {isPickingEmoji && (
          <EmojiPickerComponent
            isPickingEmoji={isPickingEmoji}
            setIsPickingEmoji={setIsPickingEmoji}
            setComment={setComment}
          />
        )}
      </VStack>
    );
  }
);

export default MainInput;
