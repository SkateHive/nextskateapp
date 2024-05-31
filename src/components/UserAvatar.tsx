import { HiveAccount } from "@/lib/models/user"
import { Link } from "@chakra-ui/next-js"
import { Avatar } from "@chakra-ui/react"

export default function UserAvatar({ hiveAccount, borderRadius, boxSize }: { hiveAccount: HiveAccount, borderRadius: number, boxSize: number }) {

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
