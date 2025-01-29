"use client";
import UserAvatar from "@/components/UserAvatar";
import { useHiveUser } from "@/contexts/UserContext";
import { useComments } from "@/hooks/comments";
import { getFileSignature, uploadImage, vote } from "@/lib/hive/client-functions";
import { commentWithPrivateKey } from "@/lib/hive/server-functions";
import { getTotalPayout } from "@/lib/utils";
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
  useToast,
  VStack,
} from "@chakra-ui/react";
import { CommentOperation, CommentOptionsOperation } from "@hiveio/dhive";
import EmojiPicker, { Theme } from 'emoji-picker-react';
import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import { FaHistory, FaImage, FaMoneyBill, FaTimes } from "react-icons/fa";
import { FaArrowRightArrowLeft, FaFaceSmile } from "react-icons/fa6";
import { IoFilter } from "react-icons/io5";
import { uploadFileToIPFS } from "../upload/utils/uploadToIPFS";
import TopMenu from "./components/TopMenu";
import CommentList from "./components/CommentsList";

const LoadingComponent = dynamic(() => import("./components/loadingComponent"), { ssr: false });

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
  const { comments, addComment, isLoading } = useComments(parent_author, parent_permlink);
  const [visiblePosts, setVisiblePosts] = useState<number>(6);
  const postBodyRef = useRef<HTMLTextAreaElement>(null);
  const user = useHiveUser();
  const username = user?.hiveUser?.name;
  const [hasPosted, setHasPosted] = useState<boolean>(false);
  const [sortMethod, setSortMethod] = useState<string>("chronological");
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [imageList, setImageList] = useState<string[]>([]);
  const [isPickingEmoji, setIsPickingEmoji] = useState<boolean>(false);
  const parentRef = useRef<HTMLDivElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const toast = useToast();

  const handleOutsideClick = (e: any) => {
    if (parentRef.current && !parentRef.current.contains(e.target)) {
      setIsPickingEmoji(false);
    }
  };
  const handleEmojiClick = (emoji: any) => {
    postBodyRef.current?.focus();
    postBodyRef.current?.setRangeText(emoji.emoji, postBodyRef.current?.selectionStart || 0, postBodyRef.current?.selectionEnd || 0, 'end');
    setIsPickingEmoji(false);
  }
  useEffect(() => {
    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

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
        if (file.type.startsWith("video/")) {
          const ipfsData: IPFSData | undefined = await uploadFileToIPFS(file);
          if (ipfsData !== undefined) {
            const ipfsUrl = `https://ipfs.skatehive.app/ipfs/${ipfsData.IpfsHash}`;
            const markdownLink = `<iframe src="${ipfsUrl}" allowFullScreen={true}></iframe>`;
            newImageList.push(markdownLink);
          }
        } else {
          const signature = await getFileSignature(file);
          const uploadUrl = await uploadImage(file, signature);
          const markdownLink = `![Image](${uploadUrl})`;
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

  const handlePaste = async (event: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const clipboardItems = event.clipboardData.items;
    const newImageList: string[] = [];

    for (const item of clipboardItems) {
      if (item.type.startsWith("image/")) {
        const blob = item.getAsFile();
        if (blob) {
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
    } else if (markdownString.length > 2000) {
      alert("Post is too long. To make longform content use our /mag section");
      return;
    } else {
      handlePost(markdownString);
    }
  };

  const handlePost = async (markdownString: string) => {
    const permlink = new Date().toISOString().replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
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
            // @ts-ignore
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
            toast.close(toastId); // Close the processing toast
            toast({
              title: "Success",
              description: "Your post has been published!",
              status: "success",
              duration: 3000,
              isClosable: true,
            });
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
        toast.close(toastId); // Close the processing toast
        toast({
          title: "Success",
          description: "Your post has been published!",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
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

  useEffect(() => {
    const scrollDiv = document.getElementById('scrollableDiv');
    const handleScroll = () => {
      if (scrollDiv && (scrollDiv.scrollTop + scrollDiv.clientHeight >= scrollDiv.scrollHeight - 100)) {
        setVisiblePosts((prev) => prev + 6);
      }
    };
    scrollDiv?.addEventListener('scroll', handleScroll);
    return () => scrollDiv?.removeEventListener('scroll', handleScroll);
  }, []);


  return (
    <VStack
      id="scrollableDiv"
      overflowY="auto"
      css={{
        "&::-webkit-scrollbar": { display: "none" },
        scrollbarWidth: "none",
      }}
      maxW={"540px"}
      width={"100%"}
      borderInline={"1px solid rgb(255,255,255,0.2)"}
      height={"101vh"}
      overflowX="hidden"
      position="relative" // Allows absolutely positioned loading overlay
    >
      {/* 
      Always show the main structure:
      If comments are not ready, you could show skeletons or placeholders here.
    */}

      <TopMenu sortedComments={sortedComments || []} />

      {user.hiveUser && (
        <>
          <Box p={4} width={"100%"} bg="black" color="white" {...getRootProps()}>
            {isLoading && (
              <Box
                position="absolute"
                top={0}
                left={0}
                width="100%"
                height="100%"
                bg="black"
                zIndex={10}
              >
                <LoadingComponent />
              </Box>
            )}
            <div>
              <Flex>
                {/* show user avatar or a skeleton avatar placeholder */}
                {/* @ts-ignore */}
                <UserAvatar hiveAccount={user.hiveUser || {}} boxSize={12} borderRadius={5} />
                <Flex flexDir="column" w="100%">
                  <Textarea
                    border="none"
                    _focus={{ border: "none", boxShadow: "none" }}
                    overflow={"hidden"}
                    resize={"vertical"}
                    ref={postBodyRef}
                    placeholder="Write your stuff..."
                    onPaste={handlePaste}
                    // If isLoading, you could disable this or show a skeleton
                    isDisabled={isLoading}
                  />

                  <div
                    ref={parentRef}
                    style={{
                      opacity: isPickingEmoji ? 1 : 0, // here is the visual control
                      pointerEvents: isPickingEmoji ? 'auto' : 'none', // Here you avoid clicks when you are not seen
                      marginTop: 50,
                      transition: 'opacity 1s ease',
                      zIndex: 10,
                      position: 'absolute',
                    }}
                  >
                    <EmojiPicker
                      theme={"dark" as Theme}
                      onEmojiClick={handleEmojiClick}
                      open={isPickingEmoji}
                    />
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
                            src={item.match(/<iframe src="(.*?)" allowFullScreen={true}><\/iframe>/)?.[1]}
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
                  disabled={isLoading}
                />
                <Button
                  name="md-image-upload"
                  variant="ghost"
                  onClick={() => !isLoading && inputRef.current?.click()}
                  _hover={{
                    background: "none",
                  }}
                  isDisabled={isLoading}
                >
                  <FaImage style={{ color: "#ABE4B8", cursor: "pointer", transition: "all 0.2s" }} />
                </Button>
                <Button
                  name="md-select-emoji"
                  variant="ghost"
                  onClick={() => { !isLoading && setIsPickingEmoji(is => !is) }}
                  _hover={{
                    background: "none",
                  }}
                  isDisabled={isLoading}
                >
                  <FaFaceSmile style={{ color: "#ABE4B8", cursor: "pointer", transition: "all 0.2s" }} />
                </Button>
                <Button
                  color="#ABE4B8"
                  variant="ghost"
                  ml="auto"
                  onClick={handlePostClick}
                  isLoading={isProcessing}
                  isDisabled={isLoading}
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
            <MenuItem bg={"black"} onClick={() => handleSortChange("chronological")}>
              <FaHistory /> <Text ml={2}> Latest</Text>
            </MenuItem>
            <MenuItem bg={"black"} onClick={() => handleSortChange("payout")}>
              <FaMoneyBill /> <Text ml={2}>Payout</Text>
            </MenuItem>
            <MenuItem bg={"black"} onClick={() => handleSortChange("engagement")}>
              <FaArrowRightArrowLeft /> <Text ml={2}>Engagement</Text>
            </MenuItem>
          </MenuList>
        </Menu>
      </HStack>

      <CommentList
        comments={sortedComments || []}
        visiblePosts={visiblePosts}
        setVisiblePosts={setVisiblePosts}
        username={username}
        handleVote={handleVote}
      />

      {/* If loading, show overlay */}
      {isLoading && (
        <Box
          position="absolute"
          top={0}
          left={0}
          width="100%"
          height="100%"
          bg="black"
          zIndex={10}
        >
          <LoadingComponent />
        </Box>
      )}
    </VStack>
  );

};

export default SkateCast;
