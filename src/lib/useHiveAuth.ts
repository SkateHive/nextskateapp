import { useHiveUser } from "@/contexts/UserContext"
import * as dhive from "@hiveio/dhive"
import HiveClient from "./hiveclient"
import { useState } from "react"
import CryptoJS from 'crypto-js';
import HAS from 'hive-auth-wrapper'


interface HiveKeychainResponse {
  success: boolean
  publicKey: string
  result: string
}

interface MetadataProps {
  [key: string]: any
}

// Define the Account type
export interface HiveAccount {
  name: string
  reward_hbd_balance: string | dhive.Asset
  reward_hive_balance: string | dhive.Asset
  reward_vesting_balance: string | dhive.Asset
  reward_vesting_hive: string | dhive.Asset
  owner: dhive.Authority
  active: dhive.Authority
  posting: dhive.Authority
  posting_json_metadata: string
  json_metadata: string
  memo_key: string
  metadata?: MetadataProps
}

export type AuthUser = {
  hiveUser: HiveAccount | null
  loginWithHive: (username: string, loginAs?: boolean, privateKey?: string | undefined) => Promise<void>
  logout: () => void
  isLoggedIn: () => boolean
}

function useAuthHiveUser(): AuthUser {
  const hiveClient = HiveClient
  const { hiveUser, setHiveUser } = useHiveUser()

  const storeAccountForUsername = async (username: string) => {
    const userData = await hiveClient.database.getAccounts([username])
    const userAccount: HiveAccount = {
      ...userData[0],
    }

    // Check if json_metadata is a valid JSON string before parsing
    try {
      if (userAccount.json_metadata) {
        userAccount.metadata = JSON.parse(userAccount.json_metadata);
      }
    } catch (error) {
      console.error("Error parsing json_metadata:", error);
      userAccount.metadata = {}; // Initialize with an empty object or handle it as needed
    }

    // If metadata is empty or does not have a "profile" property, try parsing posting_json_metadata
    if (!userAccount.metadata || !userAccount.metadata.hasOwnProperty("profile")) {
      try {
        if (userAccount.posting_json_metadata) {
          userAccount.metadata = JSON.parse(userAccount.posting_json_metadata);
        }
      } catch (error) {
        console.error("Error parsing posting_json_metadata:", error);
        userAccount.metadata = {}; // Initialize with an empty object or handle it as needed
      }
    }

    setHiveUser(userAccount);
    localStorage.setItem("hiveuser", JSON.stringify(userAccount));
  }

  // privatekey
  console.log("teste")
  const loginWithHive = (
    username: string,
    loginAs: boolean = false,
    privateKey: string | undefined
  ): Promise<void> => {
    return new Promise(async (resolve, reject) => {
      if (!username) reject("Empty username")

      if (loginAs) {
        storeAccountForUsername(username)
        resolve()
        return
      }

      // store encrypted private key

      if (privateKey) {
        // check if user is using password
        localStorage.setItem("LoginMethod", "password")
        let hivePrivateKey = dhive.PrivateKey.fromLogin(username, privateKey, 'posting')
        let hivePublicKey = hivePrivateKey.createPublic()
        let val = await hiveClient.keys.getKeyReferences([hivePublicKey.toString()])
        let accountName = val.accounts[0][0]
        if (accountName) {

          let cryptoKey = localStorage.getItem("cryptoKey") || ""
          let encrypted = CryptoJS.AES.encrypt(hivePrivateKey.toString(), cryptoKey).toString();
          // save in localstorage
          localStorage.setItem("postingKey", encrypted)
          localStorage.setItem("username", username)
          storeAccountForUsername(username)
          // user has used password

        } else {
          // user did not use password
          hivePrivateKey = dhive.PrivateKey.fromString(privateKey)
          hivePublicKey = hivePrivateKey.createPublic()
          let val = await hiveClient.keys.getKeyReferences([hivePublicKey.toString()])
          let accountName = val.accounts[0][0]
          if (accountName === username) {
            // user has logged in using correct private key
            const userData = await hiveClient.database.getAccounts([
              username,
            ])

            const userAccount: HiveAccount = {
              ...userData[0],
            }
            // check if user is using posting key
            let keyType = ""
            let checkAuth = userAccount.posting.key_auths;
            for (var i = 0, len = checkAuth.length; i < len; i++) {
              // checking if key is in posting array
              if (checkAuth[i][0] == hivePublicKey.toString()) {
                keyType = "posting"
              }
            }
            // check if user is using active key
            checkAuth = userAccount.active.key_auths;
            for (var i = 0, len = checkAuth.length; i < len; i++) {
              // checking if key is in active array
              if (checkAuth[i][0] == hivePublicKey.toString()) {
                keyType = "active"
              }
            }
            // check if user is using owner key
            checkAuth = userAccount.owner.key_auths;
            for (var i = 0, len = checkAuth.length; i < len; i++) {
              // checking if key is in owner array
              if (checkAuth[i][0] == hivePublicKey.toString()) {
                keyType = "owner"
              }
            }
            // let cookie = []
            // cookie[0] = keyType
            // cookie[1] = privateKey
            // var ciphertext = CryptoJS.AES.encrypt(JSON.stringify(cookie), 'secret key 123').toString();
            // localStorage.setItem("userInfo", ciphertext)

          } else {
            console.log("user not found")
            // wrong credencials!!
          }
        }
        resolve()
        return
      }


      // grant posting authority to app
      /*
            if (privateKey) {
              // dhive private key instance
              const hivePrivateKey = dhive.PrivateKey.fromString(privateKey)
              // get public key from private key
              const hivePublicKey = hivePrivateKey.createPublic()
              // get hive user from public key
              const val = await hiveClient.keys.getKeyReferences([hivePublicKey.toString()])
              const accountName = val.accounts[0][0]
              // check if username from form match hive account name
              if (accountName === username) {
                const userData = await hiveClient.database.getAccounts([
                  username,
                ])
        
                const userAccount: HiveAccount = {
                  ...userData[0],
                }
      
                const postingAuth = userAccount.posting;
      
                //check for username duplication
                const checkAuth = userAccount.posting.account_auths;
                var arrayindex = -1;
                for (var i = 0,len = checkAuth.length; i<len; i++) {
                  // hard coded app name!!!!!!!
                  // checking if user already granted posting auth
                  if (checkAuth[i][0]=="skatehive") {
                    arrayindex = i
                    return
                  }
                }
      
                //add account permission
                // hard coded app name!!!!
                postingAuth.account_auths.push([
                  "skatehive",
                  1,
                ])
                postingAuth.account_auths.sort();
      
                //object creation
                const accObj = {
                  account: username,
                  json_metadata: userAccount.json_metadata,
                  memo_key: userAccount.memo_key,
                  posting: postingAuth,
                }
      
                //account update broadcast
                hiveClient.broadcast.updateAccount(accObj, hivePrivateKey).then(
                  function(result) {
                    console.log(
                      'included in block: ' + result.block_num,
                      'expired: ' + result.expired
                    );
                  },
                  function(error) {
                    console.error(error);
                  }
                );
                resolve()
                return
              }
      
            }
      
      */

      // login with HiveAuth
      if (privateKey) {
        console.log(privateKey)
        return
      }


      // Login with Keychain
      const memo = `${username} signed up with ${process.env.NEXT_PUBLIC_WEBSITE_URL
        } app at ${Date.now()}`

        ; (window as any).hive_keychain.requestSignBuffer(
          username,
          memo,
          "Posting",
          async (response: HiveKeychainResponse) => {
            if (response.success === true) {
              try {
                const publicKey = response.publicKey
                const val = await hiveClient.keys.getKeyReferences([publicKey])
                const accountName = val.accounts[0][0]
                if (accountName === username) {
                  const sig = dhive.Signature.fromString(response.result)
                  const key = dhive.PublicKey.fromString(publicKey)

                  if (key.verify(dhive.cryptoUtils.sha256(memo), sig) === true) {
                    console.log(publicKey)
                    const val2 = await hiveClient.database.getAccounts([
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
                    setHiveUser(userAccount)
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

  const logout = () => {
    setHiveUser(null)
    localStorage.removeItem("hiveuser")
    localStorage.removeItem("postingKey")
    localStorage.removeItem("username")
    localStorage.removeItem("userInfo")
    localStorage.removeItem("LoginMethod")
    localStorage.removeItem("cryptoKey")
    window.location.reload()
  }

  const isLoggedIn = () => {
    return !!hiveUser
  }

  return {
    hiveUser,
    loginWithHive,
    logout,
    isLoggedIn,
  }
}

export default useAuthHiveUser
