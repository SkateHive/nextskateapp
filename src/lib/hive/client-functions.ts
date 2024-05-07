'use client';
import { KeychainRequestResponse, KeychainSDK, Post, Vote, KeychainKeyTypes, Broadcast, Login, Transfer } from "keychain-sdk"
import { Operation } from "@hiveio/dhive"
import { HiveAccount } from "../models/user";


interface HiveKeychainResponse {
  success: boolean
  publicKey: string
}

export async function claimRewards(hiveUser: HiveAccount) {

  const rewardHiveBalance = hiveUser.reward_hive_balance
  const rewardHBDBalance = hiveUser.reward_hbd_balance
  const rewardVests = hiveUser.reward_vesting_balance

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
    const memo = `${username} signed up with ${process.env.NEXT_PUBLIC_WEBSITE_URL} app at ${Date.now()}`
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

export async function updateProfile(username: String, name: String, about: String, coverImageUrl: String, avatarUrl: String, website: String, ethAddress: String) {
  try {
    const keychain = new KeychainSDK(window);

    const formParamsAsObject = {
      data: {
        username: username,
        operations: [
          [
            'account_update2',
            {
              account: username,
              json_metadata: JSON.stringify({
                profile: {
                  name: name,
                  about: about,
                  cover_image: coverImageUrl,
                  profile_image: avatarUrl,
                  website: website,
                },
                extensions: {
                  //add ethAddress to json_metadata
                  eth_address: ethAddress,
                },
              }),
              posting_json_metadata: JSON.stringify({
                profile: {
                  name: name,
                  about: about,
                  cover_image: coverImageUrl,
                  profile_image: avatarUrl,
                  website: website,
                },
              }),
              extensions: [],
            },
          ],
        ],
        method: KeychainKeyTypes.active,
      }
    }
  } catch (error) {
    console.log({ error })
  }
}