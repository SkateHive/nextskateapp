import { vote } from "@/lib/hive/client-functions"
import { use } from "react"
import { voteWithPrivateKey } from "@/lib/hive/server-functions"

export const handleVote = async (author: string, permlink: string, username: string) => {
  const loginMethod = localStorage.getItem("LoginMethod")
  if (!username) {
    console.error("Username is missing")
    return
  }
  if (loginMethod === "keychain") {
    await vote({
      username: username,
      permlink: permlink,
      author: author,
      weight: 10000,
    })
  } else if (loginMethod === "privateKey") {
    console.log("privateKey")
  }

  // } else if (loginMethod === "privateKey") {
  //   await voteWithPrivateKey({
  //     encryptedPrivateKey: localStorage.getItem("EncPrivateKey"),
  //     vote: [
  //       "vote",
  //       {
  //         voter: username,
  //         author: author,
  //         permlink: permlink,
  //         weight: 10000,
  //       },
  //     ],
  //   })å®
  // }
}
