//import UserModel from "@/lib/models/user"
import { getWebsiteURL } from "@/lib/utils"
import { Link } from "@chakra-ui/next-js"
import { Avatar } from "@chakra-ui/react"
//import { useEffect, useState } from "react"
import { HiveAccount } from "@/lib/models/user"

export default function UserAvatar({ hiveAccount }: { hiveAccount: HiveAccount }) {

  /*
  const [authorData, setAuthorData] = useState<UserModel>({} as UserModel)


  useEffect(() => {
    const fetchAuthor = async () => {
      const author = await UserModel.getNewFromUsername(username)
      setAuthorData(author)
    }
    fetchAuthor()
  }, [username])
  */
  const postAvatar = hiveAccount.metadata?.profile?.profile_image


  return (
    <Link href={`${getWebsiteURL()}/profile/${hiveAccount.name}`}>
      <Avatar
        name={hiveAccount.name}
        src={
          postAvatar ??
          `https://images.ecency.com/webp/u/${hiveAccount.name}/avatar/small`
        }
        height="40px"
        width="40px"
        bg="transparent"
        loading="lazy"
        borderRadius={5}
      />
    </Link>
  )
}
