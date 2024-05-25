"use client"
import { Avatar, HStack, Divider, Box } from "@chakra-ui/react"
import AuthorAvatar from "@/components/AuthorAvatar"
import { comment } from "@uiw/react-md-editor"
interface AvatarListProps {
  sortedComments: any[]
}

const AvatarList = ({ sortedComments }: AvatarListProps) => {
  // lets sort the avatar by the ones with more comments children and store in a variable so we can use this order just to the avatarlist

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
          <AuthorAvatar
            username={comment.author}
          />
        )
      })}
      <Divider />
    </HStack>
  )
}

export default AvatarList
