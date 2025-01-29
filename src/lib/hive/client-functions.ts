'use client';
import { Operation, PrivateKey } from "@hiveio/dhive";
import crypto from 'crypto';
import { Broadcast, Custom, KeychainKeyTypes, KeychainRequestResponse, KeychainSDK, Login, Post, Transfer, Vote, WitnessVote } from "keychain-sdk";
import HiveClient from "./hiveclient";
import { signImageHash } from "./server-functions";

interface HiveKeychainResponse {
  success: boolean
  publicKey: string
}


export interface VideoPart {
  videoUrl: string;
  thumbnailUrl: string;
  duration: number;
}
const communityTag = process.env.NEXT_PUBLIC_HIVE_COMMUNITY_TAG;

/*
export async function claimRewards(hiveUser: HiveAccount) {
  console.log('claimRewards', hiveUser)
  const rewardHiveBalance = hiveUser.reward_hive_balance
  const rewardHBDBalance = hiveUser.reward_hbd_balance
  const rewardVests = hiveUser.reward_vesting_balance
  console.log({ rewardHiveBalance, rewardHBDBalance, rewardVests });
  const operation: Operation = [
    "claim_reward_balance",
    {
      account: hiveUser.name,
      reward_hive: rewardHiveBalance,
      reward_hbd: rewardHBDBalance,
      reward_vests: rewardVests
    }
  ]

  const keychain = new KeychainSDK(window)
  const formParamsAsObject = {
    "data": {
      "username": hiveUser.name,
      "operations": [operation],
      "method": KeychainKeyTypes.posting
    }
  }

  try {
    const broadcast = await keychain
      .broadcast(
        formParamsAsObject.data as Broadcast);
    console.log({ broadcast });
  } catch (error) {
    console.log({ error });
  }

}
*/

export async function vote(props: Vote): Promise<KeychainRequestResponse> {
  const keychain = new KeychainSDK(window)

  const result = await keychain.vote({
    username: props.username,
    permlink: props.permlink,
    author: props.author,
    weight: props.weight,
  } as Vote);
  return result;
}
export async function commentWithKeychain(formParamsAsObject: any): Promise<HiveKeychainResponse | undefined> {

  const keychain = new KeychainSDK(window);
  const post = await keychain.post(formParamsAsObject.data as Post);
  if (post) {
    console.log('post', post);
    return {
      success: true,
      publicKey: String(post.publicKey)
    }
  } else {
    return {
      success: false,
      publicKey: 'deu merda'
    }

  }
}
export async function loginWithKeychain(username: string) {
  try {
    const memo = `${username} signed up with skatehive app at ${Date.now()}`
    const keychain = new KeychainSDK(window);
    undefined
    const formParamsAsObject = {
      "data": {
        "username": username,
        "message": memo,
        "method": KeychainKeyTypes.posting,
        "title": "Login"
      }
    }

    const login = await keychain
      .login(
        formParamsAsObject.data as Login);
    console.log({ login });
  } catch (error) {
    console.log({ error });
  }
}
export function getReputation(rep: number) {
  let out = ((Math.log10(Math.abs(rep)) - 9) * 9) + 25;
  out = Math.round(out);
  return out;
}
export async function transferWithKeychain(username: string, destination: string, amount: string, memo: string, currency: string) {
  try {
    const keychain = new KeychainSDK(window);

    const formParamsAsObject = {
      "data": {
        "username": username,
        "to": destination,
        "amount": amount,
        "memo": memo,
        "enforce": false,
        "currency": currency,
      }
    }

    const transfer = await keychain
      .transfer(
        formParamsAsObject.data as Transfer);
    console.log({ transfer });
  } catch (error) {
    console.log({ error });
  }
}
export async function updateProfile(username: string, name: string, about: string, location: string,
  coverImageUrl: string, avatarUrl: string, website: string, ethAddress: string, videoParts: VideoPart[],
  level: number, staticXp?: number, cumulativeXp?: number) {
  try {
    const keychain = new KeychainSDK(window);

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
        cumulativeXp: cumulativeXp
      }
    }

    const formParamsAsObject = {
      data: {
        username: username,
        operations: [
          [
            'account_update2',
            {
              account: username,
              json_metadata: JSON.stringify(extMetadata),
              posting_json_metadata: JSON.stringify(profileMetadata),
              extensions: []
            }
          ]
        ],
        method: KeychainKeyTypes.active,
      },
    };

    return await keychain.broadcast(formParamsAsObject.data as unknown as Broadcast);
    // console.log('Broadcast success:', broadcast);
  } catch (error) {
    // console.error('Profile update failed:', error);
    return false
  }
}
export async function checkCommunitySubscription(username: string) {

  const parameters = {
    account: username
  }
  try {
    const subscriptions = await HiveClient.call('bridge', 'list_all_subscriptions', parameters);
    return subscriptions.some((subscription: any) => subscription[0] === communityTag);
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    return false; // Returning false in case of an error
  }
}
export async function communitySubscribeKeyChain(username: string) {

  const keychain = new KeychainSDK(window);
  const json = [
    'subscribe',
    {
      community: communityTag
    }
  ]
  const formParamsAsObject = {
    data: {
      username: username,
      id: "community",
      method: KeychainKeyTypes.posting,
      json: JSON.stringify(json)
    },
  };
  try {
    const custom = await keychain.custom(formParamsAsObject.data as unknown as Custom);
    //const broadcast = await keychain.broadcast(formParamsAsObject.data as unknown as Broadcast);
    console.log('Broadcast success:', custom);
  } catch (error) {
    console.error('Profile update failed:', error);
  }
}

export async function checkFollow(follower: string, following: string): Promise<boolean> {
  try {
    const status = await HiveClient.call('bridge', 'get_relationship_between_accounts', [
      follower,
      following
    ]);
    return status.follows;
  } catch (error) {
    console.log(error);
    return false;
  }
}

// toogleFollow
// if return "blog", following;
// if return "" not following;
// if return false, error
export async function toogleFollow(follower: string, following: string, status: boolean) {
  const keychain = new KeychainSDK(window);
  if (!keychain.isKeychainInstalled()) return false;

  // status = followstate, if set True, start following, other, stop following
  var type = '';
  if (status)
    type = 'blog';

  const json = JSON.stringify(['follow', {
    follower: follower,
    following: following,
    what: [type], // '' empty value for unfollow; 'blog' for follow
  }]);

  const formParamsAsObject = {
    data: {
      username: follower,
      id: "follow",
      method: KeychainKeyTypes.posting,
      json: json
    }
  };

  try {
    await keychain.custom(formParamsAsObject.data as unknown as Custom);
    return type;
  } catch (error) {
    return 'error';
  }

}

// if return "blog", following;
// if return "" not following;
// if return false, error
export async function changeFollow(follower: string, following: string) {
  const keychain = new KeychainSDK(window);
  if (!keychain.isKeychainInstalled()) return false;

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
      what: [type], // '' empty value for unfollow; 'blog' for follow
    },
  ]);

  const formParamsAsObject = {
    data: {
      username: follower,
      id: "follow",
      method: KeychainKeyTypes.posting,
      json: json
    },
  };

  try {
    await keychain.custom(formParamsAsObject.data as unknown as Custom);
    return type;
    //const broadcast = await keychain.broadcast(formParamsAsObject.data as unknown as Broadcast);
    // console.log('Broadcast success:', custom);
  } catch (error) {
    return false;
    // return {"success": false};
    // console.error('Profile update failed:', error);
  }

}
export async function witnessVoteWithKeychain(username: string, witness: string) {
  const keychain = new KeychainSDK(window);
  try {
    const formParamsAsObject = {
      "data": {
        "username": username,
        "witness": "skatehive",
        "vote": true
      }
    };
    const witnessvote = await keychain
      .witnessVote(
        formParamsAsObject.data as WitnessVote);
    console.log({ witnessvote });
  } catch (error) {
    console.log({ error });
  }

}

// TODO: Review and test this function with privatekey login 
export async function witnessVoteWithPrivateKey(username: string, witness: string, vote: boolean) {
  const client = HiveClient
  const privateKey = process.env.NEXT_PUBLIC_HIVE_ACTIVE_KEY

  // Define the witness vote operation
  const operation: Operation = [
    'account_witness_vote',
    {
      account: username,
      witness: witness,
      approve: vote
    }
  ];

  try {
    // Broadcast the operation to the Hive blockchain
    if (!privateKey) {
      throw new Error('Private key is undefined');
    }
    const result = await client.broadcast.sendOperations([operation], PrivateKey.fromString(privateKey));
    console.log('Witness vote broadcast result:', result);
    return result;
  } catch (error) {
    console.error('Error broadcasting witness vote:', error);
    return false;
  }
}

export async function getAccountHistory(username: string, batchSize: number) {
  const accountHistory = await HiveClient.database.getAccountHistory(username, -1, batchSize * 2);
  return accountHistory;
}

export function getFileSignature(file: File): Promise<string> {
  return new Promise<string>(async (resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async () => {
      if (reader.result) {
        const content = Buffer.from(reader.result as ArrayBuffer);
        const hash = crypto.createHash('sha256')
          .update('ImageSigningChallenge')
          .update(new Uint8Array(content))
          .digest('hex');
        try {
          const signature = await signImageHash(hash);
          resolve(signature);
        } catch (error) {
          console.error('Error signing the hash:', error);
          reject(error);
        }
      } else {
        reject(new Error('Failed to read file.'));
      }
    };
    reader.onerror = () => {
      reject(new Error('Error reading file.'));
    };
    reader.readAsArrayBuffer(file);
  });
}


type UploadStatus = "pending" | "in-progress" | "completed" | "error";

const uploadStates = new Map<string, UploadStatus>();

export async function uploadImage(
  file: File,
  signature: string,
  index?: number,
  setUploadProgress?: React.Dispatch<React.SetStateAction<number[]>>
): Promise<string> {
  const signatureUser = process.env.NEXT_PUBLIC_HIVE_USER;
  const uploadUrl = `https://images.hive.blog/${signatureUser}/${signature}`;
  const fileKey = `${file.name}-${signature}`;

  // Avoid duplication
  if (uploadStates.get(fileKey) === "in-progress") {
    console.log(`Upload for ${file.name} is already in progress.`);
    return Promise.reject(new Error("Upload already in progress"));
  }
  if (uploadStates.get(fileKey) === "completed") {
    console.log(`Upload for ${file.name} is already completed.`);
    return Promise.reject(new Error("Upload already completed"));
  }

  // Mark as in progress
  uploadStates.set(fileKey, "in-progress");

  const formData = new FormData();
  formData.append("file", file, file.name);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", uploadUrl, true);

    if (index !== undefined && setUploadProgress) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setUploadProgress((prevProgress: number[]) => {
            const updatedProgress = [...prevProgress];
            updatedProgress[index] = progress;
            return updatedProgress;
          });
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status === 200) {
        try {
          const response = JSON.parse(xhr.responseText);
          uploadStates.set(fileKey, "completed"); // Update state
          resolve(response.url);
        } catch (error) {
          uploadStates.set(fileKey, "error"); /// Update state
          reject(new Error("Failed to parse response from server."));
        }
      } else {
        uploadStates.set(fileKey, "error"); // Update state
        reject(new Error(`Upload failed with status ${xhr.status}: ${xhr.statusText}`));
      }
    };

    xhr.onerror = () => {
      uploadStates.set(fileKey, "error"); // Update state
      reject(new Error("Upload failed due to network error."));
    };

    xhr.send(formData);
  });
}



export async function getSkateHiveTotalPayout(): Promise<number | null> {
  try {
    const response = await HiveClient.call("bridge", "get_payout_stats", { limit: 250 });

    if (!response || !response.items) {
      throw new Error("Invalid response format from Hive API.");
    }
    console.log(response)
    // Find SkateHive stats across all weeks
    const skatehiveStats = response.items.filter((item: any[]) => item[1] === "SkateHive");

    if (!skatehiveStats || skatehiveStats.length === 0) {
      throw new Error("SkateHive community not found in the payout stats.");
    }

    return response.total; // Return the aggregated total
  } catch (error) {
    console.error("Error fetching SkateHive total payout stats:", error);
    return null; // Return null in case of an error
  }
}

export async function sendPowerUp(username: string, amount: number): Promise<void> {
  if (typeof window !== "undefined") {
    try {
      const response = await new Promise<{ success: boolean; message?: string }>((resolve, reject) => {
        if (typeof window.hive_keychain !== "undefined") {
          window.hive_keychain.requestPowerUp(
            username,
            username,
            amount.toFixed(3),
            "",
            "transfer_to_vesting",
            (response: { success: boolean; message?: string }) => {
              if (response.success) {
                resolve(response);
              } else {
                reject(new Error(response.message));
              }
            }
          );
        } else {
          reject(new Error("Hive Keychain is not available."));
        }
      });

      if (response.success) {
        console.log("Power-Up successful!");
      }
    } catch (error: any) {
      console.error("Power-Up failed:", error.message || "An error occurred when trying to perform the Power-Up.");
    }
  }
}
