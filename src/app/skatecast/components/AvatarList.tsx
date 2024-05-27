"use client"
import AuthorAvatar from "@/components/AuthorAvatar"
import { Avatar, Box, Divider, HStack, Link, Tooltip } from "@chakra-ui/react"
interface AvatarListProps {
  sortedComments: any[]
}

const AvatarList = ({ sortedComments }: AvatarListProps) => {

  const FakeAvatar = () => {
    return (
      <Box
        w={"40px"}
        h={"40px"}
        borderRadius={"50%"}
        bg={"gray.200"}
        display={"flex"}
        justifyContent={"center"}
        alignItems={"center"}
      >
        <Link href={"/invite"}>
          <Tooltip
            label={"Invite someone cool enough"}
            bg={"black"}
            color={"limegreen"}
            border={"1px dashed limegreen"}
          >

            <Avatar
              border={"1px solid white"}
              name="+"
              boxSize={12}
              bg="black"
              src="/loading.gif"
              loading="lazy"
              borderRadius={100}
              _hover={{ cursor: "pointer" }} />
          </Tooltip>
        </Link>
      </Box>
    )
  }


  return (
    <HStack
      flexWrap={"nowrap"}
      w={"100%"}
      css={{ "&::-webkit-scrollbar": { display: "none" } }}
      overflowX="auto"
      minHeight={"60px"}
      px={4}
    >
      <FakeAvatar />
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
            key={comment.author}
            hover={{
              zIndex: 1,
              transform: "scale(1.05)",
              border: "1px solid limegreen",
            }}
            borderRadius={100}

          />
        )
      })}
      <Divider />
    </HStack>
  )
}

export default AvatarList
