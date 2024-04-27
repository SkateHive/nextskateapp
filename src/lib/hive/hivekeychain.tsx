import { KeychainSDK } from "keychain-sdk"

const keychain = new KeychainSDK(window)

export default function HiveKeychain() {
  return keychain
}
