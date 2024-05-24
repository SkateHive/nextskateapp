import { vote } from "@/lib/hive/client-functions"
import { use } from "react"

export const handleVote = async (author: string, permlink: string, username: string) => {
  if (!username) {
    console.error("Username is missing")
    return
  }
  console.log(username, author, permlink)

  vote({
    username: username,
    permlink: permlink,
    author: author,
    weight: 10000,
  })
}
