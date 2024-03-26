import { KeychainRequestResponse, KeychainSDK, Vote } from "keychain-sdk"

export async function vote(props: Vote): Promise<KeychainRequestResponse> {
  const keychain = new KeychainSDK(window)
  return await keychain.vote({
    username: props.username,
    permlink: props.permlink,
    author: props.author,
    weight: props.weight,
  } as Vote)
}
