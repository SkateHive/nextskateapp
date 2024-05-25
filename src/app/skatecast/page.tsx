"use client"
import { ButtonGroup, VStack, Button, HStack, MenuButton, MenuList, MenuItem, Menu } from "@chakra-ui/react"
import { useHiveUser } from "@/contexts/UserContext"
import { useComments } from "@/hooks/comments"
import AvatarList from "./AvatarList"
import PostBox from "./PostBox"
import LoadingComponent from "./loadingComponent"
import AvatarMediaModal from "./mediaModal"
import { vote } from "@/lib/hive/client-functions"
import * as dhive from "@hiveio/dhive"
import CommentList from "./CommentsList"
import { commentWithPrivateKey } from "@/lib/hive/server-functions"
import { useState, useEffect, useMemo } from "react"
import { IoFilter } from "react-icons/io5";

const parent_author = "skatehacker"
const parent_permlink = "test-advance-mode-post"

interface Comment {
  id: number
  author: string
  permlink: string
  created: string
  body: string
  total_payout_value?: string
  pending_payout_value?: string
  curator_payout_value?: string
}

const getTotalPayout = (comment: Comment): number => {
  const payout = parseFloat(comment.total_payout_value?.split(" ")[0] || "0")
  const pendingPayout = parseFloat(comment.pending_payout_value?.split(" ")[0] || "0")
  const curatorPayout = parseFloat(comment.curator_payout_value?.split(" ")[0] || "0")
  return payout + pendingPayout + curatorPayout
}

const SkateCast = () => {
  const { comments, addComment, isLoading } = useComments(
    parent_author,
    parent_permlink
  )
  const [visiblePosts, setVisiblePosts] = useState<number>(20)
  const [postBody, setPostBody] = useState<string>("")
  const user = useHiveUser()
  const username = user?.hiveUser?.name
  const [mediaModalOpen, setMediaModalOpen] = useState<boolean>(false)
  const [media, setMedia] = useState<string[]>([])
  const [mediaDictionary, setMediaDictionary] = useState<Map<number, { media: string[], type: string }>>(new Map())
  const [hasPosted, setHasPosted] = useState<boolean>(false)
  const [sortMethod, setSortMethod] = useState<string>('engagement') // State to track sorting method


  const sortedComments = useMemo(() => {
    if (sortMethod === 'chronological') {
      return comments?.slice().reverse()
    } else if (sortMethod === 'engagement') {
      return comments?.slice().sort((a, b) => {
        return (b?.children ?? 0) - (a?.children ?? 0)
      })
    } else {
      return comments?.slice().sort((a: any, b: any) => {
        return getTotalPayout(b) - getTotalPayout(a)
      })
    }
  }, [comments, sortMethod])

  const handlePost = async () => {
    const permlink = new Date()
      .toISOString()
      .replace(/[^a-zA-Z0-9]/g, "")
      .toLowerCase()

    const loginMethod = localStorage.getItem("LoginMethod")

    if (!username) {
      console.error("Username is missing")
      return
    }

    const postData = {
      parent_author: parent_author,
      parent_permlink: parent_permlink,
      author: username,
      permlink: permlink,
      title: "Cast",
      body: postBody,
      json_metadata: JSON.stringify({
        tags: ["skateboard"],
        app: "skatehive",
      }),
    }

    const operations = [["comment", postData]]

    if (loginMethod === "keychain") {
      if (typeof window !== "undefined") {
        try {
          const response = await new Promise<{
            success: boolean
            message?: string
          }>((resolve, reject) => {
            window.hive_keychain.requestBroadcast(
              username,
              operations,
              "posting",
              (response: any) => {
                if (response.success) {
                  resolve(response)
                } else {
                  reject(new Error(response.message))
                }
              }
            )
          })

          if (response.success) {
            setPostBody("")
            addComment(postData)
          }
        } catch (error) {
          console.error("Error posting comment:", (error as Error).message)
        }
      }
    } else if (loginMethod === "privateKey") {
      const commentOptions: dhive.CommentOptionsOperation = [
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
      ]

      const postOperation: dhive.CommentOperation = [
        "comment",
        {
          parent_author: parent_author,
          parent_permlink: parent_permlink,
          author: String(username),
          permlink: permlink,
          title: "Cast",
          body: postBody,
          json_metadata: JSON.stringify({
            tags: ["skateboard"],
            app: "Skatehive App",
            image: "/skatehive_square_green.png",
          }),
        },
      ]

      try {
        await commentWithPrivateKey(
          localStorage.getItem("EncPrivateKey")!,
          postOperation,
          commentOptions
        )
        addComment(postData)
        setPostBody("")
        setHasPosted(true)
      } catch (error) {
        console.error("Error posting comment:", (error as Error).message)
      }
    }
  }

  const handleVote = async (author: string, permlink: string) => {
    if (!username) {
      console.error("Username is missing")
      return
    }
    vote({
      username: username,
      permlink: permlink,
      author: author,
      weight: 10000,
    })
  }

  const handleMediaAvatarClick = (commentId: number) => {
    const media = mediaDictionary.get(commentId)
    console.log("media", media)
    setMedia(media?.media ?? [])
    console.log("media", media)
    setMediaModalOpen(true)
  }

  const handleCommentIconClick = (comment: Comment) => {
    if (typeof window !== "undefined") {
      window.location.href = `post/hive-173115/@${comment.author}/${comment.permlink}`
    }
  }

  const handleSortChange = (method: string) => {
    setSortMethod(method)
  }

  return isLoading ? (
    <LoadingComponent />
  ) : (
    <VStack
      overflowY="auto"
      css={{ "&::-webkit-scrollbar": { display: "none" } }}
      maxW={"740px"}
      width={"100%"}
      borderInline={"1px solid rgb(255,255,255,0.2)"}
    >
      <AvatarMediaModal
        isOpen={mediaModalOpen}
        onClose={() => setMediaModalOpen(false)}
        media={media}
      />
      <AvatarList
        sortedComments={sortedComments}
      />
      {user.hiveUser !== null && (
        <PostBox
          username={username}
          postBody={postBody}
          setPostBody={setPostBody}
          handlePost={handlePost}
        />
      )}
      <HStack
        spacing="1"
        width="full"
        justifyContent="flex-end"
        mr={4}
      >
        <Menu>
          <MenuButton>
            <IoFilter color="#4BD166" />
          </MenuButton>
          <MenuList
            bg={"black"}
          >
            <MenuItem
              bg={"black"}
              onClick={() => handleSortChange('payout')}> Payout</MenuItem>
            <MenuItem bg={"black"}
              onClick={() => handleSortChange('chronological')}>Latest</MenuItem>
            <MenuItem bg={"black"}
              onClick={() => handleSortChange('engagement')}>Engagement</MenuItem>
          </MenuList>
        </Menu>

      </HStack>
      <CommentList
        comments={sortedComments}
        visiblePosts={visiblePosts}
        setVisiblePosts={setVisiblePosts}
        username={username}
        handleCommentIconClick={handleCommentIconClick}
        handleVote={handleVote}
        getTotalPayout={getTotalPayout}
      />
    </VStack>
  )
}

export default SkateCast
