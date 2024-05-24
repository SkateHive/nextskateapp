"use client"
import { useComments } from "@/hooks/comments"
import {
  Box,
  Button,
  Center,
  Flex,
  Spinner,
  Text,
  Tooltip,
} from "@chakra-ui/react"
import MDEditor from "@uiw/react-md-editor"
import React from "react"

import { useDropzone } from "react-dropzone"
import { uploadFileToIPFS } from "../upload/utils/uploadToIPFS"

import { FaImage, FaSave } from "react-icons/fa"

import CommentsSection from "@/components/PostModal/commentSection"
import { usePostContext } from "@/contexts/PostContext"
import { useHiveUser } from "@/contexts/UserContext"
import { commands } from "@uiw/react-md-editor"
import rehypeSanitize from "rehype-sanitize"

const PlazaCommentSection = () => {
  const PINATA_GATEWAY_TOKEN = process.env.NEXT_PUBLIC_PINATA_GATEWAY_TOKEN
  const { comments, addComment } = useComments(
    "xvlad",
    "visiting-meier-miniramp-with-the-new-submayor"
  )

  const [value, setValue] = React.useState("**Hello world!!!**")
  const [isUploading, setIsUploading] = React.useState(false)
  const { post } = usePostContext()
  const user = useHiveUser()
  const { getRootProps, getInputProps } = useDropzone({
    noClick: true,
    noKeyboard: true,
    onDrop: async (acceptedFiles) => {
      setIsUploading(true)
      for (const file of acceptedFiles) {
        const ipfsData = await uploadFileToIPFS(file) // Use the returned data directly
        if (ipfsData !== undefined) {
          // Ensure ipfsData is not undefined
          const ipfsUrl = `https://ipfs.skatehive.app/ipfs/${ipfsData.IpfsHash}?pinataGatewayToken=${PINATA_GATEWAY_TOKEN}`
          const markdownLink = file.type.startsWith("video/")
            ? `<iframe src="${ipfsUrl}" allowfullscreen></iframe>`
            : `![Image](${ipfsUrl})`
          setValue((prevMarkdown) => `${prevMarkdown}\n${markdownLink}\n`)
        }
      }
      setIsUploading(false)
    },
    accept: {
      "image/*": [".png", ".gif", ".jpeg", ".jpg"],
      "video/*": [".mp4", ".mov"],
    },
    multiple: false,
  })
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
      execute: (state: any, api: any) => {
        // Trigger file input click
        const element = document.getElementById("md-image-upload")
        if (element) {
          element.click()
        }
      },
    },
    {
      name: "saveDraftInTxt", // Corrected from 'saveDraftintxt'
      keyCommand: "saveDraftInTxt", // Also corrected for consistency
      buttonProps: { "aria-label": "Save Draft" },
      icon: (
        <Tooltip label="Save Draft">
          <span>
            <FaSave color="limegreen" />
          </span>
        </Tooltip>
      ),
      execute: (state: any, api: any) => {
        // save .txt from value in the local machine
        const element = document.createElement("a")
        const file = new Blob([value], { type: "text/plain" })
        element.href = URL.createObjectURL(file)
        element.download = "draft.txt"
        document.body.appendChild(element) // Required for this to work in FireFox
        element.click()
      },
    },
  ]

  const submitComment = async () => {
    if (!window.hive_keychain) {
      console.error("Hive Keychain extension not found!")
      return
    }

    const username = user.hiveUser?.name
    if (!username) {
      console.error("Username is missing")
      return
    }

    if (!post) {
      console.error("Post is missing")
      return
    }

    const permlink = new Date()
      .toISOString()
      .replace(/[^a-zA-Z0-9]/g, "")
      .toLowerCase()

    const postData = {
      parent_author: post.author,
      parent_permlink: post.permlink,
      author: username,
      permlink: permlink,
      title: "",
      body: value,
      json_metadata: JSON.stringify({
        tags: ["skateboard"],
        app: "skatehive",
      }),
    }

    const operations = [["comment", postData]]

    window.hive_keychain.requestBroadcast(
      username,
      operations,
      "posting",
      async (response: any) => {
        console.log({ response })
        if (response.success) {
          setValue("")
          addComment(postData)
        } else {
          console.error("Error posting comment:", response.message)
        }
      }
    )
  }

  return (
    <Box width={"100%"}>
      <Center>
        <Text fontSize={"24px"} marginBottom={"12px"}>
          Plaza
        </Text>
      </Center>
      <Box {...getRootProps()} ml={["3%", "21%"]} mr={["3%", "21%"]}>
        {isUploading && (
          <Center>
            <Spinner />
          </Center>
        )}

        <MDEditor
          value={value}
          onChange={(value) => setValue(value || "")}
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
            border: "2px solid limegreen",
            padding: "10px",
            backgroundColor: "black",
            margin: "3px",
          }}
        />
        <Flex justifyContent={"flex-end"} marginTop={2} marginRight={4} marginBottom={6}>
          <Button
            colorScheme="green"
            variant={"outline"}
            onClick={submitComment}
            cursor={"ne-resize"}
          >
            Sendit
            <Box flex="1" />
    <img src="https://images.hive.blog/0x0/https://files.peakd.com/file/peakd-hive/web-gnar/AJkTj5LEFHyERAZVJc8jYFCwHx3nFAg2fSX7RkdKtWUn5NcgjKs9f2TY6ZW6g2b.png" alt="sendit icon" style={{ width: "20px", height: "20px", margin:"5px", padding:"1px"}} />
          </Button>
        </Flex>
      </Box>

      <Center>
        <Box
          maxW={["100%", "60%"]} // This will make the width 100% on mobile and 60% on larger screens
        >
          <CommentsSection
            comments={comments ? comments.slice(-30) : undefined}
          />
        </Box>
      </Center>
    </Box>
  )
}

export default PlazaCommentSection
