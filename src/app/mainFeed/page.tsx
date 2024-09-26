"use client";
import UserAvatar from "@/components/UserAvatar";
import { useHiveUser } from "@/contexts/UserContext";
import { useComments } from "@/hooks/comments";
import { vote } from "@/lib/hive/client-functions";
import { commentWithPrivateKey } from "@/lib/hive/server-functions";
import { CommentOperation } from "@hiveio/dhive";
import { getTotalPayout } from "@/lib/utils";
import EmojiPicker, { Theme } from 'emoji-picker-react';
import {
  Box,
  Button,
  Divider,
  Flex,
  HStack,
  IconButton,
  Image,
  Input,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
  Textarea,
  VStack,
} from "@chakra-ui/react";
import { CommentOptionsOperation } from "@hiveio/dhive";
import { useEffect, useMemo, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import { FaHistory, FaImage, FaMoneyBill, FaTimes } from "react-icons/fa";
import { FaArrowRightArrowLeft, FaFaceSmile } from "react-icons/fa6";
import { IoFilter } from "react-icons/io5";
import { uploadFileToIPFS } from "../upload/utils/uploadToIPFS";
import AvatarList from "./components/AvatarList";
import CommentList from "./components/CommentsList";
import LoadingComponent from "./components/loadingComponent";
import AvatarMediaModal from "./components/mediaModal";

const parent_author = process.env.NEXT_PUBLIC_MAINFEED_AUTHOR || "skatehacker";
const parent_permlink = process.env.NEXT_PUBLIC_MAINFEED_PERMLINK || "test-advance-mode-post";

export interface Comment {
  id: number;
  author: string;
  permlink: string;
  created: string;
  body: string;
  total_payout_value?: string;
  pending_payout_value?: string;
  curator_payout_value?: string;
}

const SkateCast = () => {
  const { comments, addComment, isLoading } = useComments(
    parent_author,
    parent_permlink
  );
  const [visiblePosts, setVisiblePosts] = useState<number>(6);
  const postBodyRef = useRef<HTMLTextAreaElement>(null);
  const user = useHiveUser();
  const username = user?.hiveUser?.name;
  const [hasPosted, setHasPosted] = useState<boolean>(false);
  const [sortMethod, setSortMethod] = useState<string>("chronological");
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [imageList, setImageList] = useState<string[]>([]);
  const [isPickingEmoji, setIsPickingEmoji] = useState<boolean>(false)
  const parentRef = useRef<HTMLDivElement>(null)


  const handleOutsideClick = (e: any) => {
    if (parentRef.current && !parentRef.current.contains(e.target)) {
      setIsPickingEmoji(false)
    }
  }

  const handleEmojiClick = (emoji: { emoji: string }) => {
    let positionStart: number | null = postBodyRef.current?.selectionStart ?? null;
    let positionEnd: number | null = postBodyRef.current?.selectionEnd ?? null;
    let currentText: string | undefined = postBodyRef.current?.value;
    let textBefore: string | undefined = currentText?.substring(0, positionStart as number);
    let textAfter: string | undefined = currentText?.substring(positionEnd as number);
    postBodyRef.current!.value = textBefore + emoji.emoji + textAfter;
  };

  useEffect(() => {

    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [])
  interface IPFSData {
    IpfsHash: string;
  }

  const { getRootProps, getInputProps } = useDropzone({
    noClick: true,
    noKeyboard: true,
    onDrop: async (acceptedFiles: File[]) => {
      setIsUploading(true);
      const newImageList: string[] = [];
      for (const file of acceptedFiles) {
        const ipfsData: IPFSData | undefined = await uploadFileToIPFS(file);
        if (ipfsData !== undefined) {
          const ipfsUrl = `https://ipfs.skatehive.app/ipfs/${ipfsData.IpfsHash}`;
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

  // Handle pasting images via Ctrl+V / Command+V and right-click Paste
  const handlePaste = async (event: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const clipboardItems = event.clipboardData.items;
    const newImageList: string[] = [];

    for (const item of clipboardItems) {
      if (item.type.startsWith("image/")) {
        const blob = item.getAsFile();

        if (blob) {
          // Convert Blob to File
          const file = new File([blob], "pasted-image.png", { type: blob.type });

          setIsUploading(true);
          const ipfsData = await uploadFileToIPFS(file);
          if (ipfsData !== undefined) {
            const ipfsUrl = `https://ipfs.skatehive.app/ipfs/${ipfsData.IpfsHash}`;
            const markdownLink = `![Image](${ipfsUrl})`;
            newImageList.push(markdownLink);
          }
        }
      }
    }

    if (newImageList.length > 0) {
      setImageList((prevList) => [...prevList, ...newImageList]);
      setIsUploading(false);
    }
  };

  const sortedComments = useMemo(() => {
    if (sortMethod === "chronological") {
      return comments?.slice().reverse();
    } else if (sortMethod === "engagement") {
      return comments?.slice().sort((a, b) => {
        return (b?.children ?? 0) - (a?.children ?? 0);
      });
    } else {
      return comments?.slice().sort((a, b) => {
        return getTotalPayout(b as Comment) - getTotalPayout(a as Comment);
      });
    }
  }, [comments, sortMethod]);

  const handlePostClick = () => {
    const markdownString = (postBodyRef.current?.value + "\n" + imageList.join("\n")).trim();
    if (markdownString === "") {
      alert("Please write something before posting");
      return;
    }
    else if (markdownString.length > 2000) {
      alert("Post is too long. To make longform content use our /mag section");
      return;
    }
    else {
      handlePost(markdownString);
    }
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
      parent_author: parent_author,
      parent_permlink: parent_permlink,
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
          parent_author: parent_author,
          parent_permlink: parent_permlink,
          author: String(username),
          permlink: permlink,
          title: "Cast",
          body: markdownString,
          json_metadata: JSON.stringify({
            tags: ["skateboard"],
            app: "Skatehive App",
            image: "/SKATE_HIVE_VECTOR_FIN.svg",
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

  const handleRemoveImage = (index: number) => {
    setImageList((prevList) => prevList.filter((_, i) => i !== index));
  };

  const handleVote = async (author: string, permlink: string) => {
    if (!username) {
      console.error("Username is missing");
      return;
    }
    vote({
      username: username,
      permlink: permlink,
      author: author,
      weight: 10000,
    });
  };

  const handleSortChange = (method: string) => {
    setSortMethod(method);
  };
  return isLoading ? (
    <LoadingComponent />
  ) : (
    <VStack
      id="scrollableDiv"
      overflowY="auto"
      css={{
        "&::-webkit-scrollbar": { display: "none" },
        scrollbarWidth: "none", // For Firefox
      }}
      maxW={"740px"}
      width={"100%"}
      borderInline={"1px solid rgb(255,255,255,0.2)"}
      height={"101vh"}
      overflowX="hidden"
    >
      {/* <AvatarMediaModal
        isOpen={mediaModalOpen}
        onClose={() => setMediaModalOpen(false)}
        media={media}
      /> */}
      <AvatarList sortedComments={sortedComments} />

      {user.hiveUser && (
        <>
          <Box p={4} width={"100%"} bg="black" color="white" {...getRootProps()}>
            <div>
              <Flex>
                {/* @ts-ignore */}
                <UserAvatar hiveAccount={user.hiveUser || {}} boxSize={12} borderRadius={5} />
                <Flex flexDir="column" w="100%">
                  <Textarea
                    border="none"
                    _focus={{
                      border: "none",
                      boxShadow: "none",
                    }}
                    overflow={"hidden"}
                    resize={"vertical"}
                    ref={postBodyRef}
                    placeholder="Write your stuff..."
                    onPaste={handlePaste} // Attach handlePaste to handle right-click Paste and Ctrl+V / Command+V
                  />
                  <div ref={parentRef as any} style={{ opacity: isPickingEmoji ? 1 : 0, marginTop: 50, transition: '1s', zIndex: 10, position: 'absolute' }}>
                    <EmojiPicker theme={"dark" as Theme} onEmojiClick={handleEmojiClick} open={isPickingEmoji} />
                  </div>

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
                </Flex>
              </Flex>
              <HStack justifyContent="space-between" marginTop={2}>
                <Input
                  id="md-image-upload"
                  type="file"
                  style={{ display: "none" }}
                  {...getInputProps({ refKey: "ref" })}
                  ref={inputRef}
                />
                <Button
                  name="md-image-upload"
                  variant="ghost"
                  onClick={() => inputRef.current?.click()}
                  _hover={{
                    background: "none",
                  }}
                >
                  <FaImage style={{
                    color: "#ABE4B8",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }} onMouseOver={(e) => {
                    e.currentTarget.style.color = "limegreen";
                    e.currentTarget.style.textShadow = "0 0 10px 0 limegreen";
                  }} onMouseOut={(e) => {
                    e.currentTarget.style.color = "#ABE4B8";
                    e.currentTarget.style.textShadow = "none";
                  }} />
                </Button>
                <Button
                  name="md-select-emoji"
                  variant="ghost"
                  onClick={() => { setIsPickingEmoji(is => !is) }}
                  _hover={{
                    background: "none",
                  }}
                >
                  <FaFaceSmile style={{
                    color: "#ABE4B8",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }} onMouseOver={(e) => {
                    e.currentTarget.style.color = "limegreen";
                    e.currentTarget.style.textShadow = "0 0 10px 0 limegreen";
                  }} onMouseOut={(e) => {
                    e.currentTarget.style.color = "#ABE4B8";
                    e.currentTarget.style.textShadow = "none";
                  }} />
                </Button>
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
            </div>
          </Box>
          <Divider />
        </>
      )}

      <HStack width="full" justifyContent="flex-end" m={-2} mr={4}>
        <Menu>
          <MenuButton>
            <IoFilter color="#9AE6B4" />
          </MenuButton>
          <MenuList color={'white'} bg={"black"} border={"1px solid #A5D6A7"}>
            <MenuItem
              bg={"black"}
              onClick={() => handleSortChange("chronological")}
            >
              <FaHistory /> <Text ml={2}> Latest</Text>
            </MenuItem>
            <MenuItem bg={"black"} onClick={() => handleSortChange("payout")}>
              <FaMoneyBill /> <Text ml={2}>Payout</Text>{" "}
            </MenuItem>
            <MenuItem
              bg={"black"}
              onClick={() => handleSortChange("engagement")}
            >
              <FaArrowRightArrowLeft /> <Text ml={2}>Engagement</Text>{" "}
            </MenuItem>
          </MenuList>
        </Menu>
      </HStack>
      <CommentList
        comments={sortedComments}
        visiblePosts={visiblePosts}
        setVisiblePosts={setVisiblePosts}
        username={username}
        handleVote={handleVote}
      />
    </VStack>
  );
};

export default SkateCast;
