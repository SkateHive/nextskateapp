"use server"

import { Validation } from "@/types"
import * as dhive from "@hiveio/dhive"
import { HiveAccount } from "../useHiveAuth"
import HiveClient from "./../hiveclient"

interface HiveKeychainResponse {
  success: boolean
  publicKey: string
  result: string
}

interface ServerLoginResponse {
  validation: Validation
  key?: string
  type?: dhive.KeyRole
}

async function getAccountByPassword(username: string, password: string) {
  let hivePrivateKey = dhive.PrivateKey.fromLogin(username, password, "posting")
  let hivePublicKey = hivePrivateKey.createPublic()
  let val = await HiveClient.keys.getKeyReferences([hivePublicKey.toString()])
  let accountName = val.accounts[0][0]
  return {
    accountName,
    hivePrivateKey,
  }
}

export async function hiveServerLoginWithPassword(
  username: string,
  privateKey: string
): Promise<ServerLoginResponse> {
  console.log("hiveServerLoginWithPassword")
  if (!username)
    return { validation: { success: false, message: "Empty username" } }
  if (!privateKey)
    return { validation: { success: false, message: "Empty username" } }

  const { accountName, hivePrivateKey } = await getAccountByPassword(
    username,
    privateKey
  )

  if (accountName) {
    // user has used password
    let cryptoKey = process.env.ENCRYPTION_KEY as string
    let encrypted = CryptoJS.AES.encrypt(
      hivePrivateKey.toString(),
      cryptoKey
    ).toString()
    return {
      validation: { success: true, message: "User has found" },
      key: encrypted,
      type: "posting",
    }
  } else {
    // user did not use password
    let hivePrivateKey = dhive.PrivateKey.fromString(privateKey)
    let hivePublicKey = hivePrivateKey.createPublic()
    let val = await HiveClient.keys.getKeyReferences([hivePublicKey.toString()])
    let accountName = val.accounts[0][0]

    if (accountName === username) {
      // user has logged in using correct private key
      const userData = await HiveClient.database.getAccounts([username])
      const encryptedKey = CryptoJS.AES.encrypt(
        hivePrivateKey.toString(),
        privateKey
      ).toString()

      const userAccount: HiveAccount = {
        ...userData[0],
      }

      // check if user is using posting key
      let checkAuth = userAccount.posting.key_auths
      for (var i = 0, len = checkAuth.length; i < len; i++) {
        // checking if key is in posting array
        if (checkAuth[i][0] == hivePublicKey.toString()) {
          return {
            validation: { success: true, message: "User has found" },
            key: encryptedKey,
            type: "posting",
          }
        }
      }
      // check if user is using active key
      checkAuth = userAccount.active.key_auths
      for (var i = 0, len = checkAuth.length; i < len; i++) {
        // checking if key is in active array
        if (checkAuth[i][0] == hivePublicKey.toString()) {
          return {
            validation: { success: true, message: "User has found" },
            key: encryptedKey,
            type: "active",
          }
        }
      }

      // check if user is using owner key
      checkAuth = userAccount.owner.key_auths
      for (var i = 0, len = checkAuth.length; i < len; i++) {
        // checking if key is in owner array
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

const hiveServerLogin2 = (
  username: string,
  privateKey: string
): Promise<void> => {
  return new Promise(async (resolve, reject) => {
    if (!username) reject("Empty username")
    if (!privateKey) reject("Empty private key")

    // check if user is using password
    localStorage.setItem("LoginMethod", "password")
    let hivePrivateKey = dhive.PrivateKey.fromLogin(
      username,
      privateKey,
      "posting"
    )
    let hivePublicKey = hivePrivateKey.createPublic()
    let val = await HiveClient.keys.getKeyReferences([hivePublicKey.toString()])
    let accountName = val.accounts[0][0]
    if (accountName) {
      let cryptoKey = localStorage.getItem("cryptoKey") || ""
      let encrypted = CryptoJS.AES.encrypt(
        hivePrivateKey.toString(),
        cryptoKey
      ).toString()
      // save in localstorage
      localStorage.setItem("postingKey", encrypted)
      localStorage.setItem("username", username)
      // storeAccountForUsername(username)
      // user has used password
    } else {
      // user did not use password
      hivePrivateKey = dhive.PrivateKey.fromString(privateKey)
      hivePublicKey = hivePrivateKey.createPublic()
      let val = await HiveClient.keys.getKeyReferences([
        hivePublicKey.toString(),
      ])
      let accountName = val.accounts[0][0]
      if (accountName === username) {
        // user has logged in using correct private key
        const userData = await HiveClient.database.getAccounts([username])

        const userAccount: HiveAccount = {
          ...userData[0],
        }
        // check if user is using posting key
        let keyType = ""
        let checkAuth = userAccount.posting.key_auths
        for (var i = 0, len = checkAuth.length; i < len; i++) {
          // checking if key is in posting array
          if (checkAuth[i][0] == hivePublicKey.toString()) {
            keyType = "posting"
          }
        }
        // check if user is using active key
        checkAuth = userAccount.active.key_auths
        for (var i = 0, len = checkAuth.length; i < len; i++) {
          // checking if key is in active array
          if (checkAuth[i][0] == hivePublicKey.toString()) {
            keyType = "active"
          }
        }
        // check if user is using owner key
        checkAuth = userAccount.owner.key_auths
        for (var i = 0, len = checkAuth.length; i < len; i++) {
          // checking if key is in owner array
          if (checkAuth[i][0] == hivePublicKey.toString()) {
            keyType = "owner"
          }
        }
      } else {
        console.log("user not found")
        // wrong credencials!!
      }
    }

    // login with HiveAuth
    if (privateKey) {
      console.log(privateKey)
      return
    }

    // Login with Keychain
    const memo = `${username} signed up with ${
      process.env.NEXT_PUBLIC_WEBSITE_URL
    } app at ${Date.now()}`

    ;(window as any).hive_keychain.requestSignBuffer(
      username,
      memo,
      "Posting",
      async (response: HiveKeychainResponse) => {
        if (response.success === true) {
          try {
            const publicKey = response.publicKey
            const val = await HiveClient.keys.getKeyReferences([publicKey])
            const accountName = val.accounts[0][0]
            if (accountName === username) {
              const sig = dhive.Signature.fromString(response.result)
              const key = dhive.PublicKey.fromString(publicKey)

              if (key.verify(dhive.cryptoUtils.sha256(memo), sig) === true) {
                console.log(publicKey)
                const val2 = await HiveClient.database.getAccounts([
                  accountName,
                ])

                const userAccount: HiveAccount = {
                  ...val2[0],
                }

                console.log(userAccount)

                userAccount.metadata = JSON.parse(userAccount.json_metadata)
                if (
                  userAccount.metadata &&
                  !userAccount.metadata.hasOwnProperty("profile")
                )
                  userAccount.metadata = JSON.parse(
                    userAccount.posting_json_metadata
                  )
                // setHiveUser(userAccount)
                localStorage.setItem("hiveuser", JSON.stringify(userAccount))
                localStorage.setItem("LoginMethod", "keychain")
                resolve()
              } else {
                reject("Verification failed: signature mismatch.")
              }
            } else {
              reject("Verification failed: username mismatch.")
            }
          } catch (error) {
            console.error(error)
            reject("Error during public key verification and user fetching.")
          }
        } else {
          reject("Hive keychain request failed.")
        }
      }
    )
  })
}
