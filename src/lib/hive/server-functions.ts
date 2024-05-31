"use server"

import { Validation } from "@/types"
import * as dhive from "@hiveio/dhive"
import CryptoJS from "crypto-js"
import { HiveAccount } from "../useHiveAuth"
import HiveClient from "./hiveclient"

interface ServerLoginResponse {
  validation: Validation
  key?: string
  type?: dhive.KeyRole
}

async function getAccountByPassword(username: string, password: string) {
  let hivePrivateKey = dhive.PrivateKey.fromLogin(username, password, "posting")
  let hivePublicKey = hivePrivateKey.createPublic()
  let val = await HiveClient.keys.getKeyReferences([hivePublicKey.toString()])
  let accountName = val.accounts[0][0]
  return {
    accountName,
    hivePrivateKey,
  }
}

function decryptPrivateKey(encryptedPrivateKey: string) {
  const secret = process.env.NEXT_PUBLIC_CRYPTO_SECRET || ""
  const bytes = CryptoJS.AES.decrypt(encryptedPrivateKey, secret) || ""
  const privateKey = bytes.toString(CryptoJS.enc.Utf8)
  return privateKey
}

function encryptPrivateKey(privateKey: dhive.PrivateKey) {
  let cryptoKey = process.env.NEXT_PUBLIC_CRYPTO_SECRET as string
  let encryptedKey = CryptoJS.AES.encrypt(
    privateKey.toString(),
    cryptoKey
  ).toString()
  return encryptedKey
}

export async function hiveServerLoginWithPassword(
  username: string,
  privateKey: string
): Promise<ServerLoginResponse> {
  if (!username)
    return { validation: { success: false, message: "Empty username" } }
  if (!privateKey)
    return { validation: { success: false, message: "Empty username" } }

  const { accountName, hivePrivateKey } = await getAccountByPassword(
    username,
    privateKey
  )

  if (accountName === username) {
    let encryptedKey = encryptPrivateKey(hivePrivateKey)
    return {
      validation: { success: true, message: "User has found" },
      key: encryptedKey,
      type: "posting",
    }
  } else {
    let hivePrivateKey = dhive.PrivateKey.fromString(privateKey)
    let hivePublicKey = hivePrivateKey.createPublic()
    let val = await HiveClient.keys.getKeyReferences([hivePublicKey.toString()])
    let accountName = val.accounts[0][0]

    if (accountName === username) {
      const userData = await HiveClient.database.getAccounts([username])
      let encryptedKey = encryptPrivateKey(hivePrivateKey)

      const userAccount: HiveAccount = {
        ...userData[0],
      }

      let checkAuth = userAccount.posting.key_auths
      for (var i = 0, len = checkAuth.length; i < len; i++) {
        if (checkAuth[i][0] == hivePublicKey.toString()) {
          return {
            validation: { success: true, message: "User has found" },
            key: encryptedKey,
            type: "posting",
          }
        }
      }
      checkAuth = userAccount.active.key_auths
      for (var i = 0, len = checkAuth.length; i < len; i++) {
        if (checkAuth[i][0] == hivePublicKey.toString()) {
          return {
            validation: { success: true, message: "User has found" },
            key: encryptedKey,
            type: "active",
          }
        }
      }

      checkAuth = userAccount.owner.key_auths
      for (var i = 0, len = checkAuth.length; i < len; i++) {
        if (checkAuth[i][0] == hivePublicKey.toString()) {
          return {
            validation: { success: true, message: "User has found" },
            key: encryptedKey,
            type: "owner",
          }
        }
      }
    }

    return { validation: { success: false, message: "User not found" } }
  }
}

export async function voteWithPrivateKey(
  encryptedPrivateKey: string | null,
  vote: dhive.VoteOperation
) {
  if (encryptedPrivateKey === null) throw new Error("Private key not found")
  const privateKey = decryptPrivateKey(encryptedPrivateKey)

  const client = new dhive.Client("https://api.hive.blog")
  client.broadcast
    .vote(vote[1], dhive.PrivateKey.from(privateKey))
    .then((result) => {
      console.log(result)
    })
    .catch((error) => {
      console.error(error)
    })
}

export async function commentWithPrivateKey(
  encryptedPrivateKey: string | null,
  commentOperation: dhive.CommentOperation,
  commentOptionsOperation: dhive.CommentOptionsOperation
) {
  if (encryptedPrivateKey === null) throw new Error("Private key not found");

  const privateKey = dhive.PrivateKey.fromString(
    decryptPrivateKey(encryptedPrivateKey)
  );

  return HiveClient.broadcast
    .commentWithOptions(
      commentOperation[1],
      commentOptionsOperation[1],
      privateKey
    )
    .then(res => {
      console.log({ res, commentOperation, commentOptionsOperation });
      return res;
    })
    .catch((error) => {
      console.error(error);
      throw error;
    });
}

