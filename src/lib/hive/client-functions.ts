'use client';
import { KeychainRequestResponse, KeychainSDK, Post, Vote, KeychainKeyTypes, Broadcast, Login } from "keychain-sdk"
import { Client, Operation, PrivateKey } from "@hiveio/dhive"
import CryptoJS from 'crypto-js';
import { KeychainTransactionResult } from "keychain-sdk";
import { HiveAccount } from "../useHiveAuth";


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
         "method" : KeychainKeyTypes.posting
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
  try
  {
    const memo = `${username} signed up with ${process.env.NEXT_PUBLIC_WEBSITE_URL} app at ${Date.now()}`
    const keychain = new KeychainSDK(window);
    undefined
    const formParamsAsObject = {
     "data": {
          "username": username,
          "message": memo,
          "method" : KeychainKeyTypes.posting,
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