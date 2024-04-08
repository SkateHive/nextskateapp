import { KeychainRequestResponse, KeychainSDK, Vote } from "keychain-sdk"
import { Client, PrivateKey } from "@hiveio/dhive"
import CryptoJS from 'crypto-js';


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