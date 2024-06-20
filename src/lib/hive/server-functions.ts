"use server"

import { Validation } from "@/types"
import * as dhive from "@hiveio/dhive"
import CryptoJS from "crypto-js"
import { VideoPart } from "../models/user"
import { HiveAccount } from "../useHiveAuth"
import HiveClient from "./hiveclient"

const communityTag = process.env.NEXT_PUBLIC_HIVE_COMMUNITY_TAG;

interface ServerLoginResponse {
  validation: Validation
  key?: string
  type?: dhive.KeyRole
}

async function getAccountByPassword(username: string, password: string) {
  let hivePrivateKey = dhive.PrivateKey.fromLogin(username, password, "active")
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

  //const client = new dhive.Client("https://api.hive.blog")
  HiveClient.broadcast
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

export async function updateProfileWithPrivateKey(
  encryptedPrivateKey: string | null,
  username: string,
  name: string,
  about: string,
  location: string,
  coverImageUrl: string,
  avatarUrl: string,
  website: string,
  ethAddress: string,
  videoParts: VideoPart[]) {

  if (encryptedPrivateKey === null) throw new Error("Private key not found");

  const privateKey = decryptPrivateKey(encryptedPrivateKey)

  const profileMetadata = {
    profile: {
      name: name,
      about: about,
      location: location,
      cover_image: coverImageUrl,
      profile_image: avatarUrl,
      website: website,
      version: 2
    }
  };

  const extMetadata = {
    extensions: {
      eth_address: ethAddress,
      video_parts: videoParts,
    }
  }

  const updateInfo: dhive.Operation = [
    "account_update2",
    {
      account: username,
      json_metadata: JSON.stringify(extMetadata),
      posting_json_metadata: JSON.stringify(profileMetadata),
      extensions: []
    }
  ]

  HiveClient.broadcast
    .sendOperations([updateInfo], dhive.PrivateKey.from(privateKey))
    .then((result) => {
      console.log(result)
    })
    .catch((error) => {
      console.error(error)
    })

}

export async function sendHiveOperation(encryptedPrivateKey: string | null, op: dhive.Operation[]) {

  if (encryptedPrivateKey === null) throw new Error("Private key not found");
  const privateKey = decryptPrivateKey(encryptedPrivateKey)
  HiveClient.broadcast
    .sendOperations(op, dhive.PrivateKey.from(privateKey))
    .then((result) => {
      console.log(result)
    })
    .catch((error) => {
      console.error(error)
    })

}

export async function communitySubscribePassword(encryptedPrivateKey: string | null, username: string) {
  const json = [
    'subscribe',
    {
      community: communityTag
    }
  ]
  const operation: dhive.Operation =
    [
      'custom_json',
      {
        required_auths: [],
        required_posting_auths: [username],
        id: "community",
        json: JSON.stringify(json)
      }
    ]

  sendHiveOperation(encryptedPrivateKey, [operation])

}

async function checkFollow(follower: string, following: string): Promise<boolean> {
  try {
    const status = await HiveClient.call('bridge', 'get_relationship_between_accounts', [
      follower,
      following
  ]);

    if (status.follows) {
      return true
    } else {
      return false
    }
  } catch (error) {
    console.log(error)
    return false
  }
}

export async function changeFollowWithPassword(encryptedPrivateKey: string | null, follower: string, following: string) {
  const status = await checkFollow(follower, following)
  let type = ''
  if (status) {
    type = ''
  } else {
    type = 'blog'
  }
  const json = JSON.stringify([
    'follow',
    {
      follower: follower,
      following: following,
      what: [type], //null value for unfollow, 'blog' for follow
    },
  ]);
  const data = {
    id: 'follow',
    json: json,
    required_auths: [],
    required_posting_auths: [follower],
  };
  const operation: dhive.Operation =
    [
      'custom_json',
      data
    ]

  sendHiveOperation(encryptedPrivateKey, [operation])
}
