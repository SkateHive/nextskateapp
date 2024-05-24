"use client"
import { VStack } from "@chakra-ui/react"
import { useHiveUser } from "@/contexts/UserContext"
import { useComments } from "@/hooks/comments"
import AvatarList from "./AvatarList"
import PostBox from "./PostBox"
import LoadingComponent from "./loadingComponent"
import AvatarMediaModal from "./mediaModal"
import {  vote } from "@/lib/hive/client-functions"
import * as dhive from "@hiveio/dhive"
import CommentList from "./CommentsList"
import { commentWithPrivateKey } from "@/lib/hive/server-functions"
import { useState, useEffect, useMemo } from "react"

const parent_author = "skatehacker"
const parent_permlink = "test-advance-mode-post"

const SkateCast = () => {
  const { comments, addComment, isLoading } = useComments(
    parent_author,
    parent_permlink
  )
  const [visiblePosts, setVisiblePosts] = useState(20)
  const [postBody, setPostBody] = useState("")
  const reversedComments = comments?.slice().reverse()
  const user = useHiveUser()
  const username = user?.hiveUser?.name
  const [mediaModalOpen, setMediaModalOpen] = useState(false)
  const [media, setMedia] = useState<string[]>([])
  const [mediaComments, setMediaComments] = useState<Set<number>>(new Set())
  const [mediaDictionary, setMediaDictionary] = useState(new Map())
  const [hasPosted, setHasPosted] = useState(false)

  useEffect(() => {
    if (comments) {
      const mediaSet = new Set<number>();
      const mediaDict = new Map()
      comments?.forEach((comment) => {
        const media = comment.body.match(
          /https:\/\/ipfs.skatehive.app\/ipfs\/[a-zA-Z0-9]*/g
        )
        const mediaType =
          comment.body.includes("<video") || comment.body.includes("<iframe")
            ? "video"
            : "image"
        if (media) {
          if (comment.id !== undefined) {
            mediaSet.add(comment.id);
          }
          mediaDict.set(comment.id, { media, type: mediaType })
        }
      })
      setMediaComments(mediaSet)
      setMediaDictionary(mediaDict)
    }
  }, [comments])

  const sortedComments = useMemo(() => {
    return comments?.slice().sort((a: any, b: any) => {
      const aHasMedia = mediaComments.has(a.id)
      const bHasMedia = mediaComments.has(b.id)
      if (aHasMedia && !bHasMedia) {
        return -1
      } else if (!aHasMedia && bHasMedia) {
        return 1
      }
      const aCreated = new Date(a.created)
      const bCreated = new Date(b.created)
      if (aCreated && bCreated) {
        return bCreated.getTime() - aCreated.getTime()
      }
      return 0
    })
  }, [comments, mediaComments])

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
          localStorage.getItem("EncPrivateKey"),
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
    setMedia(media ?? [])
    console.log("media", media)
    setMediaModalOpen(true)
  }

  const getTotalPayout = (comment: any) => {
    if (comment.total_payout_value === undefined) {
      return 0
    }
    if (comment.pending_payout_value === undefined) {
      return 0
    }
    if (comment.curator_payout_value === undefined) {
      return 0
    }
    const payout = parseFloat(comment.total_payout_value.split(" ")[0])
    const pendingPayout = parseFloat(comment.pending_payout_value.split(" ")[0])
    const curatorPayout = parseFloat(comment.curator_payout_value.split(" ")[0])
    return payout + pendingPayout + curatorPayout
  }

  const handleCommentIconClick = (comment: any) => {
    if (typeof window !== "undefined") {
      window.location.href = `post/hive-173115/@${comment.author}/${comment.permlink}`
    }
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
        mediaComments={mediaComments}
        handleMediaAvatarClick={handleMediaAvatarClick}
      />
      {user.hiveUser !== null && (
        <PostBox
          username={username}
          postBody={postBody}
          setPostBody={setPostBody}
          handlePost={handlePost}
        />
      )}
      <CommentList
        comments={reversedComments}
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
