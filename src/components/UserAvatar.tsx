import UserModel from "@/lib/models/user"
import { getWebsiteURL } from "@/lib/utils"
import { Link } from "@chakra-ui/next-js"
import { Avatar } from "@chakra-ui/react"
import { useEffect, useState } from "react"

export default function UserAvatar({ username }: { username: string }) {
  const [authorData, setAuthorData] = useState<UserModel>({} as UserModel)
  const postAvatar = authorData.metadata?.profile?.profile_image

  useEffect(() => {
    const fetchAuthor = async () => {
      const author = await UserModel.getNewFromUsername(username)
      setAuthorData(author)
    }
    fetchAuthor()
  }, [username])

  return (
    <Link href={`${getWebsiteURL()}/profile/${username}`}>
      <Avatar
        name={username}
        src={
          postAvatar ??
          `https://images.ecency.com/webp/u/${username}/avatar/small`
        }
        height="40px"
        width="40px"
        bg="gray.200"
        loading="lazy"
        borderRadius={5}
      />
    </Link>
  )
}
