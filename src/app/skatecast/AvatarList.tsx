"use client"
import { Avatar, HStack, Divider } from "@chakra-ui/react"

interface AvatarListProps {
  sortedComments: any[]
  mediaComments: Set<number>
  handleMediaAvatarClick: (commentId: number) => void
}

const AvatarList = ({ sortedComments, mediaComments, handleMediaAvatarClick }: AvatarListProps) => {
  return (
    <HStack
      flexWrap={"nowrap"}
      w={"100%"}
      css={{ "&::-webkit-scrollbar": { display: "none" } }}
      overflowX="auto"
      minHeight={"60px"}
      px={4}
    >
      {sortedComments?.map((comment, index, commentsArray) => {
        const isDuplicate =
          commentsArray.findIndex((c) => c.author === comment.author) !==
          index
        if (isDuplicate) {
          return null
        }
        return (
          <Avatar
            key={comment.id}
            size="md"
            src={`https://images.ecency.com/webp/u/${comment.author}/avatar/small`}
            border={
              mediaComments.has(comment.id) ? "2px solid limegreen" : "none"
            }
            cursor={"pointer"}
            onClick={() => handleMediaAvatarClick(Number(comment.id))}
          />
        )
      })}
      <Divider />
    </HStack>
  )
}

export default AvatarList
