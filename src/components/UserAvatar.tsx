'use client'
import { HiveAccount } from "@/lib/useHiveAuth"
import { Avatar } from "@chakra-ui/react"
import { useEffect, useState } from "react"

export default function UserAvatar({ hiveAccount, borderRadius, boxSize }: { hiveAccount: HiveAccount, borderRadius: number, boxSize: number }) {
  const [userAvatar, setUserAvatar] = useState<string>("")
  const metadata = JSON.parse(hiveAccount.posting_json_metadata || hiveAccount.json_metadata || "{}")

  useEffect(() => {
    if (metadata.profile) {
      setUserAvatar(metadata.profile.profile_image)
      setUserAvatar(metadata.profile.profile_image || `https://images.ecency.com/webp/u/${hiveAccount.name}/avatar/small`)
    }
    else {
      setUserAvatar(`https://images.ecency.com/webp/u/${hiveAccount.name}/avatar/small`)
    }

  }
    , [metadata])



  return (
    // <Link href={`/profile/${hiveAccount.name}`}>
    <Avatar
      name={hiveAccount.name}
      src={
        userAvatar ??
        `https://images.ecency.com/webp/u/${hiveAccount.name}/avatar/small`
      }
      boxSize={boxSize || 12}
      bg="transparent"
      loading="lazy"
      borderRadius={borderRadius || 5}
    />
    // </Link>
  )
}
