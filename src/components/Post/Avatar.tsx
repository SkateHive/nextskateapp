import { Avatar } from "@chakra-ui/react"

interface PostAvatarProps {
  src: string
  name: string
}

export default function PostAvatar({ src, name }: PostAvatarProps) {
  return (
    <Avatar
      name={name}
      src={src}
      height="40px"
      width="40px"
      bg="gray.200"
      loading="lazy"
      borderRadius={"20%"}
    />
  )
}
