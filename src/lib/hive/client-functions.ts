'use client';
import { KeychainRequestResponse, KeychainSDK, Post, Vote } from "keychain-sdk"
import { Client, PrivateKey } from "@hiveio/dhive"
import CryptoJS from 'crypto-js';
import { KeychainTransactionResult } from "keychain-sdk";


interface HiveKeychainResponse {
  success: boolean
  publicKey: string
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
  console.log('post', post);
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


//  window.hive_keychain.requestBroadcast(author, operations, 'posting', async (response: any) => {

// if (response.success) {
//   console.log(response);
//   return {
//     success: true,
//     result: response.result,
//   };

// } else {
//   console.error('Error publishing post on Hive:', response.message);
//   return {
//     success: false,
//     result: response.message,
//   };
// }
// });