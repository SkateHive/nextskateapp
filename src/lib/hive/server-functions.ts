"use server"

import { Validation } from "@/types"
import * as dhive from "@hiveio/dhive"
import { Client, PrivateKey, VoteOperation } from '@hiveio/dhive'
import { Buffer } from 'buffer'
import CryptoJS from "crypto-js"
import { HiveAccount } from "../useHiveAuth"
import HiveClient from "./hiveclient"
import { VideoPart } from "./client-functions"
const communityTag = process.env.NEXT_PUBLIC_HIVE_COMMUNITY_TAG;

interface ServerLoginResponse {
  validation: Validation
  key?: string
  type?: dhive.KeyRole
}

async function getAccountByPassword(username: string, password: string) {
  const hivePrivateKey = dhive.PrivateKey.fromLogin(username, password, "active");
  const hivePublicKey = hivePrivateKey.createPublic();
  const val = await HiveClient.keys.getKeyReferences([hivePublicKey.toString()]);
  const accountName = val.accounts[0][0];

  return { accountName, hivePrivateKey };
}

function decryptPrivateKey(encryptedPrivateKey: string): string {
  const secret = process.env.NEXT_PUBLIC_CRYPTO_SECRET || "";

  if (!secret) {
    throw new Error("NEXT_PUBLIC_CRYPTO_SECRET is not set in the environment");
  }

  const bytes = CryptoJS.AES.decrypt(encryptedPrivateKey, secret);
  const privateKey = bytes.toString(CryptoJS.enc.Utf8);

  if (!privateKey) {
    throw new Error("Failed to decrypt the private key. Check the secret or the data.");
  }

  return privateKey;
}

function encryptPrivateKey(privateKey: dhive.PrivateKey) {
  const secret = process.env.NEXT_PUBLIC_CRYPTO_SECRET as string;

  if (!secret) {
    throw new Error("NEXT_PUBLIC_CRYPTO_SECRET is not set in the environment");
  }

  return CryptoJS.AES.encrypt(privateKey.toString(), secret).toString();
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

const client = new Client("https://api.hive.blog");

export async function voteWithPrivateKey(
  encryptedPrivateKey: string,
  vote: VoteOperation
): Promise<void> {
  try {
    const privateKey = decryptPrivateKey(encryptedPrivateKey);
    if (!privateKey) {
      throw new Error("Failed to decrypt the private key.");
    }

    console.log("Broadcasting vote operation:", vote);
    await client.broadcast.sendOperations([vote], PrivateKey.fromString(privateKey));
    console.log("Vote operation successfully broadcasted");
  } catch (error) {
    console.error("Error broadcasting vote operation:", error);
    throw error;
  }
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
  videoParts: VideoPart[],
  level: number,
  staticXp: number,
) {

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
      level: level,
      staticXp: staticXp,
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

  return await HiveClient.broadcast.sendOperations([updateInfo], dhive.PrivateKey.from(privateKey))
  // .then((result) => {
  //   console.log(result)
  //   return result
  // })
  // .catch((error) => {
  //   console.error(error)
  //   return error
  // })

}

export async function sendHiveOperation(encryptedPrivateKey: string | null, op: dhive.Operation[]) {

  if (encryptedPrivateKey === null) throw new Error("Private key not found");
  const privateKey = decryptPrivateKey(encryptedPrivateKey)
  HiveClient.broadcast
    .sendOperations(op, dhive.PrivateKey.from(privateKey))
    .then((result) => {
      console.log(result)
      console.log("look mom it worked!")
    })
    .catch((error) => {
      console.error(error)
      console.log("I will get damn error")
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

interface Transaction {
  from: string;
  to: string;
  amount: string;
  memo?: string;
  timestamp: string;
}
export async function getTransactionHistory(username: string, searchAccount: string): Promise<Transaction[]> {
  try {
    const operationsBitmask: [number, number] = [4, 0];
    const accountHistory = await HiveClient.database.getAccountHistory(
      username,
      -1,
      1000,
      operationsBitmask
    );

    // Filter and map transfer transactions
    const filteredTransactions = accountHistory
      .filter(([_, operationDetails]) => {
        const operationType = operationDetails.op[0];
        const opDetails = operationDetails.op[1];
        return (
          operationType === "transfer" &&
          (opDetails.from === searchAccount || opDetails.to === searchAccount)
        );
      })
      .map(([_, operationDetails]) => {
        const opDetails = operationDetails.op[1];
        return {
          from: opDetails.from,
          to: opDetails.to,
          amount: opDetails.amount,
          memo: opDetails.memo || "",
          timestamp: operationDetails.timestamp,
        };
      });
    // Revert so that the most recent transactions come first
    return filteredTransactions.reverse();
  } catch (error) {
    console.error("Error fetching transaction history:", error);
    return [];
  }
}


export async function changeFollowWithPassword(encryptedPrivateKey: string | null, follower: string, following: string) {
  const status = await checkFollow(follower, following)

  let type = ''
  if (!status) {
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
    required_auths: [],
    required_posting_auths: [follower],
    json: json,
  };

  const operation: dhive.Operation = ['custom_json', data]
  sendHiveOperation(encryptedPrivateKey, [operation])
}

//toogle follow 
export async function toogleFollowWithPassword(encryptedPrivateKey: string | null, follower: string, following: string, status: boolean) {
  // const status = await checkFollow(follower, following)
  let type = ''
  if (!status) {
    type = 'blog'
  }

  const json = JSON.stringify(['follow', {
    follower: follower,
    following: following,
    what: [type], //null value for unfollow, 'blog' for follow
  },]);

  const data = {
    id: 'follow',
    required_auths: [],
    required_posting_auths: [follower],
    json: json,
  };

  const operation: dhive.Operation = ['custom_json', data]
  sendHiveOperation(encryptedPrivateKey, [operation])
  return type;
}

export async function signImageHash(hash: string): Promise<string> {
  const wif = process.env.HIVE_POSTING_KEY;

  if (!wif) {
    throw new Error("HIVE_POSTING_KEY is not set in the environment");
  }

  const key = PrivateKey.fromString(wif);
  const hashBuffer = Buffer.from(hash, 'hex');  // Convert the hex string back to a buffer
  const signature = key.sign(hashBuffer);

  return signature.toString();
}

export async function sendPowerUpWithPrivateKey(username: string, amount: number, privateKey: string): Promise<void> {
  const client = HiveClient;

  const operation: dhive.Operation = [
    'transfer_to_vesting',
    {
      from: username,
      to: username,
      amount: `${amount.toFixed(3)} HIVE`
    }
  ];

  try {
    const result = await client.broadcast.sendOperations([operation], dhive.PrivateKey.fromString(privateKey));
    console.log('Power-Up broadcast result:', result);
  } catch (error) {
    console.error('Error broadcasting Power-Up:', error);
    throw error;
  }
}
