import { uploadFileToIPFS } from "@/app/upload/utils/uploadToIPFS"
import { useHiveUser } from "@/contexts/UserContext"
import { Comment } from "@/hooks/comments"
import PostModel from "@/lib/models/post"
import { Box, Button, Center, Flex, Spinner, Tooltip } from "@chakra-ui/react"
import MDEditor, { commands } from "@uiw/react-md-editor"
import { useState } from "react"
import { useDropzone } from "react-dropzone"
import { FaImage, FaSave } from "react-icons/fa"
import rehypeSanitize from "rehype-sanitize"

interface CommandPromptProps {
  post: PostModel | Comment,
  addComment: (comment: Comment) => void;
}

const CommandPrompt = ({ post, addComment }: CommandPromptProps) => {
  const [isUploading, setIsUploading] = useState(false)
  const [value, setValue] = useState("")
  const PINATA_GATEWAY_TOKEN = process.env.NEXT_PUBLIC_PINATA_GATEWAY_TOKEN
  const parent_permlink = post?.permlink
  const parent_author = post?.author
  const user = useHiveUser()

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


    const permlink = new Date()
      .toISOString()
      .replace(/[^a-zA-Z0-9]/g, "")
      .toLowerCase()

    const postData = {
      parent_author: parent_author,
      parent_permlink: parent_permlink,
      author: username,
      permlink: permlink,
      title: "",
      body: value,
      json_metadata: JSON.stringify({
        tags: ["skateboard"],
        app: "skatehive",
      }),
    }


    const operations = [
      [
        "comment",
        postData,
      ],
    ]

    window.hive_keychain.requestBroadcast(
      username,
      operations,
      "posting",
      async (response: any) => {
        if (response.success) {
          setValue("")
          addComment(postData)
          console.log("Comment posted successfully")
        } else {
          console.error("Error posting comment:", response.message)
        }
      }
    )
  }

  const { getRootProps, getInputProps } = useDropzone({
    noClick: true,
    noKeyboard: true,
    onDrop: async (acceptedFiles) => {
      setIsUploading(true)
      for (const file of acceptedFiles) {
        const ipfsData = await uploadFileToIPFS(file)
        if (ipfsData !== undefined) {
          const ipfsUrl = `https://ipfs.skatehive.app/ipfs/${ipfsData.IpfsHash}`
          const markdownLink = file.type.startsWith("video/")
            ? `<iframe src="${ipfsUrl}" allowFullScreen autoplay={false}></iframe>`
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
        const element = document.getElementById("md-image-upload")
        if (element) {
          element.click()
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
      execute: (state: any, api: any) => {
        const element = document.createElement("a")
        const file = new Blob([value], { type: "text/plain" })
        element.href = URL.createObjectURL(file)
        element.download = "draft.txt"
        document.body.appendChild(element)
        element.click()
      },
    },
  ]

  return (
    <>
      <Box p={5} color={'white'} marginTop="3" {...getRootProps()}>
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
          height="150px"
          preview="edit"
          style={{
            border: "none",
            padding: "10px",
            backgroundColor: "black",
            color: "white",
          }}
        />
        <Flex justifyContent={"flex-end"}>
          <Button
            colorScheme="green"
            size="sm"
            mt={2}
            borderRadius={0}
            onClick={submitComment}
            alignSelf="flex-end"
          >
            Send it
          </Button>
        </Flex>
      </Box>
    </>
  )
}

export default CommandPrompt
