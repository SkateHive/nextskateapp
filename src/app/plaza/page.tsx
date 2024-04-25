"use client"
import {
  Badge,
  Box,
  Button,
  Center,
  Divider,
  Flex,
  HStack,
  Image,
  Link,
  Spinner,
  Text,
  Tooltip,
} from "@chakra-ui/react"
import { CSSProperties, useEffect, useRef, useState } from "react"
import { FaImage, FaVideo } from "react-icons/fa"
import InfiniteScroll from "react-infinite-scroll-component"

// Markdown Stuff
import MDEditor, { commands } from "@uiw/react-md-editor"
import ReactMarkdown from "react-markdown"
import rehypeRaw from "rehype-raw"
import remarkGfm from "remark-gfm"
import { MarkdownRenderers } from "../upload/utils/MarkdownRenderers"

// Utilities
import moment from "moment"

// Components
import CommentBox from "./commentBox"
import Comments from "./comments"
import { CommentProps } from "./types"

// Hive Stuff
import { useHiveUser } from "@/contexts/UserContext"
import HiveClient from "@/lib/hiveclient"
import voteOnContent from "./voting"

export default function Plaza() {
  const URLPermlink = "test-advance-mode-post"
  const URLAuthor = "skatehacker"
  const compWidth = "60%"

  const hiveUser = useHiveUser()
  const user = hiveUser.hiveUser
  const client = HiveClient
  const [post, setPost] = useState<any | null>(null)
  const [comments, setComments] = useState<CommentProps[]>([])
  const [commentContent, setCommentContent] = useState("")
  const [username, setUsername] = useState<string | null>(null)
  const [parentId, setParentId] = useState<string | null>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const [isLoadingComments, setIsLoadingComments] = useState(false)
  const [isPostingComment, setIsPostingComment] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [loadedCommentsCount, setLoadedCommentsCount] = useState(15)
  const containerRef = useRef<HTMLDivElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState<string | null>(null)
  const [votingBoxOpen, setVotingBoxOpen] = useState(false)

  // user metadata
  const metadata = JSON.parse(user?.json_metadata || "{}")

  // const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);
  // const [payout, setPayout] = useState(0);
  // const [localNetVotes, setNetVotes] = useState(0);

  const fetchComments = async () => {
    try {
      const allComments: CommentProps[] = await client.database.call(
        "get_content_replies",
        [URLAuthor, URLPermlink]
      )

      setComments(allComments.reverse())
      setIsLoadingComments(false)

      return allComments
    } catch (error) {
      console.error("Error fetching comments:", error)
    }
  }

  const fetchPostData = async () => {
    try {
      const postData = await client.database.call("get_content", [
        URLAuthor,
        URLPermlink,
      ])
      setPost({ ...postData })
    } catch (error) {
      console.error("Error fetching post data:", error)
    }
  }

  useEffect(() => {
    fetchPostData()
    fetchComments()
  }, [])

  const fetchReplies = async (comment: CommentProps) => {
    // if (comment.children === 0) return;
    try {
      let replies = await client.call("bridge", "get_discussion", {
        author: comment.author,
        permlink: comment.permlink,
        observer: username,
      })

      const originalCommentKey = `${comment.author}/${comment.permlink}`
      delete replies[originalCommentKey]

      for (const replyKey in replies) {
        const reply = replies[replyKey]
        const subReplies = reply.replies

        // add a repliesFetched property to the reply
        replies[replyKey].repliesFetched = []

        // add the sub replies to the repliesFetched property of this reply
        for (let i = 0; i < subReplies.length; i++) {
          const subReply = subReplies[i]
          if (subReply && subReply in replies) {
            const subReplyObject = replies[subReply]
            replies[replyKey].repliesFetched.push(subReplyObject)
          }
        }

        // set net_votes of the reply with active_votes.length
        replies[replyKey].net_votes = replies[replyKey].active_votes.length
      }

      const repliesArray = []

      // add the replies to the repliesArray
      for (const replyKey in replies) {
        const reply = replies[replyKey]

        // push the reply to the replies array only if it's a reply to the original comment
        if (
          reply.parent_author === comment.author &&
          reply.parent_permlink === comment.permlink
        ) {
          repliesArray.push(replies[replyKey])
        }
      }

      // set the repliesFetched property of the comment
      comment.repliesFetched = repliesArray as CommentProps[]

      // set showCommentBox
      comment.showCommentBox = true

      // update the comments array
      const updatedComments = comments.map((c) => {
        if (c.id === comment.id) {
          return comment
        }
        return c
      })

      // set the updated comments array
      setComments(updatedComments)
    } catch (error) {
      console.error("Error fetching replies:", error)
    }
  }

  const hideCommentBox = (comment: CommentProps) => () => {
    const updatedComments = comments.map((c) => {
      if (c.id === comment.id) {
        return { ...c, showCommentBox: false };
      }
      return c;
    });
    setComments(updatedComments)
  }

  const handlePostComment = async () => {
    if (!window.hive_keychain) {
      console.error("Hive Keychain extension not found!")
      return
    }
    if (!username) {
      console.error("Username is missing")
      return
    }

    const permlink = new Date()
      .toISOString()
      .replace(/[^a-zA-Z0-9]/g, "")
      .toLowerCase()

    let parentAuthor = ""
    let parentPermlink = ""

    if (parentId) {
      const parentComment = comments.find((comment) => comment.id === parentId)
      if (parentComment) {
        parentAuthor = parentComment.author
        parentPermlink = parentComment.permlink
      }
    } else {
      parentAuthor = URLAuthor
      parentPermlink = URLPermlink
    }
    const beneficiaries = [
      { account: "steemskate", weight: 3000 },
      { account: "xvlad", weight: 2000 },
    ]

    const extensions = [
      [
        0,
        {
          beneficiaries: beneficiaries,
        },
      ],
    ]

    const operations = [
      [
        "comment",
        {
          parent_author: parentAuthor,
          parent_permlink: parentPermlink,
          author: username,
          permlink: permlink,
          title: "",
          body: commentContent,
          json_metadata: JSON.stringify({
            tags: ["skateboard"],
            app: "skatehive",
          }),
        },
      ],
    ]

    setIsPostingComment(true)

    let postCreationTimestamp = moment.utc().unix()

    window.hive_keychain.requestBroadcast(
      username,
      operations,
      "posting",
      async (response: any) => {
        await loadUpdatedComments(username, postCreationTimestamp)
      }
    )
  }
  const loadUpdatedComments = async (
    username: string,
    postCreationTimestamp: number
  ) => {
    const maxAttempts = commentContent && commentContent !== "" ? 10 : 0
    let attempts = 0

    while (true) {
      let data = await fetchComments()
      if (!data) throw new Error("No comments")

      const lastPostDate = moment.utc((data[0] as any).last_update).unix()
      if (
        (username === data[0].author && lastPostDate > postCreationTimestamp) ||
        attempts === maxAttempts
      )
        break

      attempts++
      await new Promise((resolve) => setTimeout(resolve, 1000 * attempts))
    }

    chatContainerRef.current?.scrollTo(0, 0)
    setCommentContent("")
    setIsPostingComment(false)
    setIsUploading(false)
  }

  useEffect(() => {
    setUsername(user?.name || null)
  }, [user])

  const postContainerStyle: CSSProperties = {
    borderRadius: "10px",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    marginBottom: "20px",
    padding: "15px",
    border: "1px solid gray",
  }

  // const isMobile = window.innerWidth < 768
  const isMobile = false

  // make a state so it changes the color of the voting button instantly

  const [userVoted, setUserVoted] = useState(false);

  const didUserVoted = async () => {
    const userVoted = comments.some((comment) => {
      return comment.active_votes.some((vote) => vote.voter === username);
    });
    setUserVoted(userVoted);
  }

  useEffect(() => {
    didUserVoted();
  }
    , [comments]);

  const handleVote = async (comment: CommentProps) => {
    // setVotingBoxOpen(true)
    if (!user || !username) {
      console.error("Username is missing")
      return
    }

    try {
      await voteOnContent(username, comment.permlink, comment.author, 10000)
    } catch (error: any) {
      console.error("Error voting:", error)
    }
  }

  const uploadFileToIPFS = async (file: File): Promise<void> => {
    try {
      setIsUploading(true)

      // Check if it's an MP4 video
      if (file.type.startsWith("video") && !file.type.includes("mp4")) {
        alert("Invalid video format. Please upload a .mp4 file.")
        setIsUploading(false)
        return
      }

      const formData = new FormData()
      formData.append("file", file)
      formData.set("Content-Type", "multipart/form-data")

      const response = await fetch(
        "https://api.pinata.cloud/pinning/pinFileToIPFS",
        {
          method: "POST",
          //@ts-ignore
          headers: {
            pinata_api_key: process.env.PINATA_API_KEY,
            pinata_secret_api_key: process.env.PINATA_API_SECRET,
          },
          body: formData,
        }
      )

      if (response.ok) {
        const data = await response.json()
        const ipfsUrl = `https://ipfs.skatehive.app/ipfs/${data.IpfsHash}?pinataGatewayToken=nxHSFa1jQsiF7IHeXWH-gXCY3LDLlZ7Run3aZXZc8DRCfQz4J4a94z9DmVftXyFE`

        // Handle images
        if (file.type.startsWith("image")) {
          const imageMarkdown = `![](${ipfsUrl}) `
          setCommentContent(
            (prevContent) => prevContent + `\n${imageMarkdown}` + "\n"
          )
        }
        // Handle videos
        else if (file.type.startsWith("video")) {
          const videoElement = `<video controls muted loop><source src="${ipfsUrl}" type="${file.type}"></video> `
          setCommentContent(
            (prevContent) => prevContent + `\n${videoElement}` + "\n"
          )
        }

        // Set the file URL in the state
        setUploadedVideoUrl(ipfsUrl)

      } else {
        const errorData = await response.json()
        console.error(
          `Error uploading ${file.type} file to Pinata IPFS:`,
          errorData
        )
      }
    } catch (error) {
      console.error("Error uploading file:", error)
    } finally {
      setIsUploading(false)
    }
  }


  return (
    <Center>
      <Box
        ref={containerRef}
        style={{
          borderRadius: "10px",
          overflowY: "auto",
          width: isMobile ? "100%" : compWidth,
        }}
      >
        <Flex flexDirection="column" justifyContent="space-between">
          <Flex alignItems="center" justifyContent="start" paddingLeft="10px">
            <Image
              src={
                metadata?.profile?.profile_image ||
                "https://images.ecency.com/webp/u/skatehive/avatar/small"
              }
              alt={`${URLAuthor}'s avatar`}
              boxSize="40px"
              borderRadius="50%"
              margin="5px"
            />
            <Text>{metadata?.profile?.name || "You"}</Text>
          </Flex>
          <MDEditor
            value={commentContent}
            onChange={(value, event, state) => setCommentContent(value || "")}
            preview="edit"
            height={200}
            commands={[
              commands.bold,
              commands.italic,
              commands.strikethrough,
              commands.divider,
              commands.hr,
              commands.title,
              commands.divider,
              commands.link,
              commands.quote,
              commands.divider,
              commands.code,
              commands.codeBlock,
              commands.divider,
              commands.image,
              commands.table,
              commands.divider,
              commands.unorderedListCommand,
              commands.orderedListCommand,
              commands.checkedListCommand,
            ]}
            extraCommands={[commands.help, commands.fullscreen]}
            style={{
              borderRadius: "5px",
              border: "1px solid limegreen",
              padding: "10px",
              backgroundColor: "navy",
            }}
          />
          <Box
            style={{
              display: "flex",
              justifyContent: "space-between",
              margin: "5px",
            }}
          >
            <label
              htmlFor="fileInput"
              style={{
                cursor: "pointer",
                display: "inline-block",
                padding: "10px",
                border: "1px solid limegreen",
                borderRadius: "5px",
                backgroundColor: "limegreen",
                color: "white",
              }}
            >
              <HStack>
                {isUploading ? (
                  <Spinner size="sm" />

                ) : (
                  <>
                    <FaImage style={{ marginRight: "5px" }} />
                    <Text color={"black"}> | </Text>
                    <FaVideo style={{ marginRight: "5px" }} />
                  </>
                )}
              </HStack>
              <input
                id="fileInput"
                type="file"
                accept="image/*,video/*"
                style={{ display: "none" }}
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    setSelectedFile(file)
                    uploadFileToIPFS(file)
                  }
                }}
              />
            </label>
            <Button
              fontSize="14px"
              padding="6px 10px"
              color="limegreen"
              bg={"transparent"}
              border={"1px solid limegreen"}
              onClick={handlePostComment}
              disabled={isPostingComment}
            >
              {isPostingComment ? <HStack>
                <Spinner size="sm" />
                <Text color={"white"}> | sending to blockchain...</Text>

              </HStack> : "🗣 Post"}
            </Button>
          </Box>
          {commentContent.length > 1 && (
            <Box
              style={{
                border: "2px dashed limegreen",
                borderRadius: "5px",
                padding: "10px",
              }}
            >
              <Badge>Draft</Badge>
              <ReactMarkdown
                rehypePlugins={[rehypeRaw]}
                remarkPlugins={[remarkGfm]}
                components={MarkdownRenderers}
              >
                {commentContent}
              </ReactMarkdown>
            </Box>
          )}
        </Flex>

        {isLoadingComments ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            height="200px"
          >
            Loading GMs...
          </Box>
        ) : (
          <Flex
            borderRadius="10px"
            padding="5px"
            direction="column"
            overflow="auto"
            style={{ width: "100%" }}
          >
            <InfiniteScroll
              dataLength={loadedCommentsCount}
              next={() => setLoadedCommentsCount((val) => val + 15)}
              hasMore={comments.length !== loadedCommentsCount}
              scrollableTarget="postsTl"
              loader={
                <Box
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  height="200px"
                >
                  Loading comments...
                </Box>
              }
            >
              {comments.slice(0, loadedCommentsCount).map((comment, index) => (
                <Box key={comment.id}>
                  <Box style={postContainerStyle}>
                    <HStack justifyContent={"space-between"}>
                      <Flex
                        alignItems="center"
                        justifyContent="start"
                        paddingLeft="10px"
                        marginBottom={"10px"}
                      >
                        <Link href={`/profile/${comment.author}`}>
                          <Image
                            src={`https://images.ecency.com/webp/u/${comment.author}/avatar/small`}
                            alt={`${comment.author}'s avatar`}
                            boxSize="40px"
                            borderRadius="50%"
                            margin="5px"
                          />
                        </Link>

                        <span>{comment.author}</span>
                      </Flex>
                      <Tooltip
                        label="Yes you can earn $ by tweeting here, make sure you post cool stuff that people will fire up!"
                        aria-label="A tooltip"
                        placement="top"
                        bg={"black"}
                        color={"yellow"}
                        border={"1px dashed yellow"}
                      >
                        <Badge
                          marginBottom={"27px"}
                          colorScheme="yellow"
                          fontSize="sm"
                        >
                          {comment.total_payout_value !== 0
                            ? `${comment.pending_payout_value}`
                            : "0.000 "}
                        </Badge>
                      </Tooltip>
                    </HStack>
                    <Divider />
                    <ReactMarkdown
                      rehypePlugins={[rehypeRaw]}
                      remarkPlugins={[remarkGfm]}
                      components={MarkdownRenderers}
                    >
                      {comment.body}
                    </ReactMarkdown>

                    <Flex justifyContent="space-between" mt="4">
                      <Button
                        onClick={() => fetchReplies(comment)}
                        leftIcon={
                          <div
                            style={{ display: "flex", alignItems: "center" }}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="20"
                              height="20"
                              fill="currentColor"
                              viewBox="0 0 16 16"
                            >
                              <path d="M16 8c0 3.866-3.582 7-8 7a9 9 0 0 1-2.347-.306c-.584.296-1.925.864-4.181 1.234-.2.032-.352-.176-.273-.362.354-.836.674-1.95.77-2.966C.744 11.37 0 9.76 0 8c0-3.866 3.582-7 8-7s8 3.134 8 7M4.5 5a.5.5 0 0 0 0 1h7a.5.5 0 0 0 0-1zm0 2.5a.5.5 0 0 0 0 1h7a.5.5 0 0 0 0-1zm0 2.5a.5.5 0 0 0 0 1h4a.5.5 0 0 0 0-1z" />
                            </svg>
                          </div>
                        }
                        style={{
                          border: "1px solid limegreen",
                          backgroundColor: "black",
                          fontSize: "16px",
                          color: "limegreen",
                          padding: "3px 6px",
                        }}
                      >
                        {comment.children}
                      </Button>

                      <Button
                        onClick={() => handleVote(comment)}
                        leftIcon={
                          <div
                            style={{ display: "flex", alignItems: "center" }}
                          >
                            <Image
                              src={
                                comment.active_votes.some(
                                  (vote) => vote.voter === username
                                )
                                  ? "https://cdn.discordapp.com/emojis/1060351346416554136.gif?size=240&quality=lossless"
                                  : "https://cdn.discordapp.com/emojis/1060351346416554136.gif?size=240&quality=lossless"
                              }
                              alt="Image Alt Text"
                              style={
                                comment.active_votes.some(
                                  (vote) => vote.voter === username
                                )
                                  ? {}
                                  : { filter: "grayscale(100%)" }
                              }
                            />
                            <div
                              style={{
                                color: comment.active_votes.some(
                                  (vote) => vote.voter === username
                                )
                                  ? "orange"
                                  : "white",
                              }}
                            >
                              {" "}
                              Fuck Yeah!
                            </div>
                          </div>
                        }
                        style={{
                          border: "1px solid limegreen",
                          backgroundColor: comment.active_votes.some(
                            (vote) => vote.voter === username
                          )
                            ? "black"
                            : "black",
                          fontSize: "12px",
                          color: comment.active_votes.some(
                            (vote) => vote.voter === username
                          )
                            ? "limegreen"
                            : "black",
                          padding: "3px 6px",
                          marginLeft: "8px",
                        }}
                      ></Button>

                      {/* {votingBoxOpen && <VotingBoxModal />}   */}
                    </Flex>
                  </Box>

                  {comment.showCommentBox &&
                    (comment.showCommentBox ||
                      (comment.repliesFetched &&
                        comment.repliesFetched.length > 0)) && (
                      <Box
                        style={{
                          border: "1px solid limegreen",
                          borderRadius: "20px",
                          marginBottom: "20px",
                        }}
                      >
                        {comment.showCommentBox && (
                          <CommentBox
                            user={user}
                            parentAuthor={comment.author}
                            parentPermlink={comment.permlink}
                            onCommentPosted={hideCommentBox(comment)}
                          />
                        )}

                        {comment.repliesFetched &&
                          comment.repliesFetched.length > 0 && (
                            <Comments
                              comments={
                                comment.repliesFetched as CommentProps[]
                              }
                              blockedUser="hivebuzz"
                              commentPosted={false}
                              permlink={comment.permlink}
                            />
                          )}
                      </Box>
                    )}
                </Box>
              ))}
            </InfiniteScroll>
          </Flex>
        )}
      </Box>
    </Center>
  )
}
