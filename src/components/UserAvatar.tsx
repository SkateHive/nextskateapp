'use client'
import { HiveAccount } from "@/lib/models/user"
import { Avatar } from "@chakra-ui/react"
import { useEffect, useState } from "react"

export default function UserAvatar({ hiveAccount, borderRadius, boxSize }: { hiveAccount: HiveAccount, borderRadius: number, boxSize: number }) {
  const profile_pic = JSON.parse(hiveAccount.posting_json_metadata).profile.profile_image

  return (
    // <Link href={`/profile/${hiveAccount.name}`}>
    <Avatar
      name={hiveAccount.name}
      src={
        profile_pic ??
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
