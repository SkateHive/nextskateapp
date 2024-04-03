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

export async function voteWithPrivateKey(username: string, permlink: string, author: string, weight: number) {
  const encryptedPrivateKey = localStorage.getItem("postingKey") || "";
  const secret = process.env.NEXT_PUBLIC_CRYPTO_SECRET || ""

  const bytes = CryptoJS.AES.decrypt(encryptedPrivateKey, secret) || "";
  const privateKey = bytes.toString(CryptoJS.enc.Utf8);
  if (!encryptedPrivateKey) {
    throw new Error("Private key not found")
  }
  const client = new Client("https://api.hive.blog")
  client.broadcast.vote({
    voter: username,
    author: author,
    permlink: permlink,
    weight: weight,
  }, PrivateKey.from(privateKey)).then((result) => {
    console.log(result)
  }
  ).catch((error) => {
    console.error(error)
  }
  )
}