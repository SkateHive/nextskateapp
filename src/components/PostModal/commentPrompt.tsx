"use client";
import { uploadFileToIPFS } from "@/app/upload/utils/uploadToIPFS";
import { useHiveUser } from "@/contexts/UserContext";
import { useComments } from "@/hooks/comments";
import { commentWithPrivateKey } from "@/lib/hive/server-functions";
import PostModel from "@/lib/models/post";
import {
  Box,
  Button,
  Center,
  Flex,
  Spinner,
  Text,
  Tooltip,
  useToast,
} from "@chakra-ui/react";
import * as dhive from "@hiveio/dhive";
import MDEditor, { commands } from "@uiw/react-md-editor";
import { add } from "lodash";
import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { FaImage, FaSave } from "react-icons/fa";
import rehypeSanitize from "rehype-sanitize";

interface CommandPromptProps {
  onClose: () => void;
  author: string;
  permlink: string;
  onNewComment: (comment: dhive.Discussion) => void;
  addComment?: (comment: dhive.Discussion) => void;
}

const CommandPrompt = ({
  onClose,
  author,
  permlink,
  onNewComment,
}: CommandPromptProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [value, setValue] = useState("");

  const user = useHiveUser();
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  const { addComment } = useComments(author, permlink);

  const submitComment = async (commentBody: string) => {
    const loginMethod = localStorage.getItem("LoginMethod");
    const newPermLink = `comment-${Math.random().toString(36).substr(2, 9)}`;

    try {
      if (!user.hiveUser?.name) throw new Error("Username is missing");

      const postData: any = {
        parent_author: author,
        parent_permlink: permlink,
        author: user.hiveUser.name,
        permlink: newPermLink,
        body: commentBody,
        title: "Comment",
        json_metadata: JSON.stringify({
          tags: ["skateboard"],
          app: "skatehive",
        }),
      };

      if (loginMethod === "keychain") {
        if (!window.hive_keychain)
          throw new Error("Hive Keychain extension not found!");

        const operations = [["comment", postData]];

        window.hive_keychain.requestBroadcast(
          user.hiveUser.name,
          operations,
          "posting",
          (response: any) => {
            if (response.success) {
              toast({
                title: "Comment posted successfully.",
                status: "success",
                duration: 3000,
                isClosable: true,
              });
              setValue("");
              onClose();
            } else {
              setError(`Error: ${response.message}`);
              console.error("Error broadcasting transaction:", response.error);
            }
          }
        );
      } else if (loginMethod === "privateKey") {
        const commentOptions: dhive.CommentOptionsOperation = [
          "comment_options",
          {
            author: String(user.hiveUser?.name),
            permlink: newPermLink,
            max_accepted_payout: "10000.000 HBD",
            percent_hbd: 10000,
            allow_votes: true,
            allow_curation_rewards: true,
            extensions: [
              [
                0,
                {
                  beneficiaries: [{ account: "skatehacker", weight: 1000 }],
                },
              ],
            ],
          },
        ];
        const postOperation: dhive.CommentOperation = [
          "comment",
          {
            parent_author: author,
            parent_permlink: permlink,
            author: String(user.hiveUser?.name),
            permlink: newPermLink,
            title: `Reply to ${author}`,
            body: commentBody,
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
        addComment({
          ...(postOperation[1] as dhive.Discussion),
        });
      }
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Failed to post comment.",
        description: err.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      console.error("Error posting comment:", err);
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    noClick: true,
    noKeyboard: true,
    onDrop: async (acceptedFiles) => {
      setIsUploading(true);
      for (const file of acceptedFiles) {
        const ipfsData = await uploadFileToIPFS(file);
        if (ipfsData) {
          const ipfsUrl = `https://ipfs.skatehive.app/ipfs/${ipfsData.IpfsHash}`;
          const markdownLink = file.type.startsWith("video/")
            ? `<iframe src="${ipfsUrl}" allowFullScreen={true} autoplay={false}></iframe>`
            : `![Image](${ipfsUrl})`;

          setValue((prevMarkdown) => `${prevMarkdown}\n${markdownLink}\n`);
        }
      }
      setIsUploading(false);
    },
    accept: {
      "image/*": [".png", ".gif", ".jpeg", ".jpg"],
      "video/*": [".mp4", ".mov"],
    },
    multiple: false,
  });

  const extraCommands = [
    {
      name: "uploadImage",
      keyCommand: "uploadImage",
      buttonProps: { "aria-label": "Upload image" },
      icon: (
        <Tooltip label="Upload Image or Video">
          <span>
            <FaImage color="yellow" />
          </span>
        </Tooltip>
      ),
      execute: () => {
        const element = document.getElementById("md-image-upload");
        if (element) {
          element.click();
        }
      },
    },
    {
      name: "saveDraftInTxt",
      keyCommand: "saveDraftInTxt",
      buttonProps: { "aria-label": "Save Draft" },
      icon: (
        <Tooltip label="Save Draft">
          <span>
            <FaSave color="#A5D6A7" />
          </span>
        </Tooltip>
      ),
      execute: () => {
        const element = document.createElement("a");
        const file = new Blob([value], { type: "text/plain" });
        element.href = URL.createObjectURL(file);
        element.download = "draft.txt";
        document.body.appendChild(element);
        element.click();
      },
    },
  ];

  return (
    <Box
      p={4}
      borderRadius="md"
      boxShadow="lg"
      color="white"
      {...getRootProps()}
    >
      <Box p={4} bg="blackAlpha.800" borderRadius="md" boxShadow="sm" mb={4}>
        {isUploading && (
          <Center>
            <Spinner />
          </Center>
        )}
        <MDEditor
          value={value}
          onChange={(value) => {
            setValue(value || "");
          }}
          commands={[
            commands.bold,
            commands.italic,
            commands.strikethrough,
            commands.hr,
            commands.code,
            commands.table,
            commands.link,
            commands.quote,
            commands.unorderedListCommand,
            commands.orderedListCommand,
            commands.codeBlock,
          ]}
          extraCommands={extraCommands}
          previewOptions={{ rehypePlugins: [[rehypeSanitize]] }}
          height="200px"
          preview="edit"
          style={{
            border: "1px solid #2D3748",
            borderRadius: "8px",
            padding: "15px",
            backgroundColor: "#1A202C",
            color: "white",
            minHeight: "150px",
            fontSize: "16px",
            lineHeight: "1.5",
          }}
        />
      </Box>
      <input
        type="file"
        id="md-image-upload"
        {...getInputProps()}
        style={{ display: "none" }}
      />
      <Flex justify="flex-end">
        <Button
          colorScheme="teal"
          size="lg"
          onClick={() => submitComment(value)}
          isDisabled={!value.trim() || !localStorage.getItem("LoginMethod")}
        >
          Post Comment
        </Button>
      </Flex>
      {error && <Text color="red.500">{error}</Text>}
    </Box>
  );
};

export default CommandPrompt;
