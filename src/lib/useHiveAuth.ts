import { useHiveUser } from "@/contexts/UserContext"
import * as dhive from "@hiveio/dhive"
import { hiveServerLoginWithPassword } from "./hive/server-functions"
import HiveClient from "./hive/hiveclient"
import CryptoJS from "crypto-js"

interface HiveKeychainResponse {
  success: boolean
  publicKey: string
  result: string
}

interface MetadataProps {
  [key: string]: any
}

// Define the Account type
export interface HiveAccount extends dhive.Account {

  metadata?: MetadataProps
}

export type AuthUser = {
  hiveUser: HiveAccount | null
  loginWithHive: (
    username: string,
    loginAs?: boolean,
    privateKey?: string | undefined
  ) => Promise<void>
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
        userAccount.metadata = JSON.parse(userAccount.json_metadata)
      }
    } catch (error) {
      console.error("Error parsing json_metadata:", error)
      userAccount.metadata = {} // Initialize with an empty object or handle it as needed
    }

    // If metadata is empty or does not have a "profile" property, try parsing posting_json_metadata
    if (
      !userAccount.metadata ||
      !userAccount.metadata.hasOwnProperty("profile")
    ) {
      try {
        if (userAccount.posting_json_metadata) {
          userAccount.metadata = JSON.parse(userAccount.posting_json_metadata)
        }
      } catch (error) {
        console.error("Error parsing posting_json_metadata:", error)
        userAccount.metadata = {} // Initialize with an empty object or handle it as needed
      }
    }

    setHiveUser(userAccount)
    localStorage.setItem("hiveuser", JSON.stringify(userAccount))
  }
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
        const { validation, key, type } = await hiveServerLoginWithPassword(
          username,
          privateKey
        )
        if (validation.success) {
          localStorage.setItem("Username", username)
          localStorage.setItem("EncPrivateKey", key as string)
          localStorage.setItem("Type", type as string)
          localStorage.setItem("LoginMethod", "privateKey")
          const val2 = await hiveClient.database.getAccounts([
            username,
          ])

          const userAccount: HiveAccount = {
            ...val2[0],
          }
          localStorage.setItem("hiveuser", JSON.stringify(userAccount))
          setHiveUser(userAccount)
        } else {
          console.error(validation.message)
          return reject(validation.message)
        }
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
                    const val2 = await hiveClient.database.getAccounts([
                      accountName,
                    ])

                    const userAccount: HiveAccount = {
                      ...val2[0],
                    }


                    if (userAccount.json_metadata) {
                      userAccount.metadata = JSON.parse(userAccount.json_metadata)
                      if (
                        userAccount.metadata &&
                        !userAccount.metadata.hasOwnProperty("profile")
                      )
                        userAccount.metadata = JSON.parse(
                          userAccount.posting_json_metadata
                        )
                    }
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
