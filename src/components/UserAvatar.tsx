//import UserModel from "@/lib/models/user"
import { getWebsiteURL } from "@/lib/utils"
import { Link } from "@chakra-ui/next-js"
import { Avatar, border } from "@chakra-ui/react"
//import { useEffect, useState } from "react"
import { HiveAccount } from "@/lib/models/user"

export default function UserAvatar({ hiveAccount, borderRadius, boxSize }: { hiveAccount: HiveAccount, borderRadius: number, boxSize: number }) {

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
    <Link href={`/profile/${hiveAccount.name}`}>
      <Avatar
        name={hiveAccount.name}
        src={
          postAvatar ??
          `https://images.ecency.com/webp/u/${hiveAccount.name}/avatar/small`
        }
        boxSize={boxSize || 12}
        bg="transparent"
        loading="lazy"
        borderRadius={borderRadius || 5}
      />
    </Link>
  )
}
