import { useHiveUser } from "@/contexts/UserContext"
import * as dhive from "@hiveio/dhive"
import { checkCommunitySubscription, communitySubscribeKeyChain } from "./hive/client-functions"
import HiveClient from "./hive/hiveclient"
import { communitySubscribePassword, hiveServerLoginWithPassword } from "./hive/server-functions"

interface HiveKeychainResponse {
  success: boolean
  publicKey: string
  result: string
}

interface MetadataProps {
  [key: string]: any
}

export interface HiveAccount extends dhive.Account {
  witness_votes: string[]
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

    try {
      if (userAccount.json_metadata) {
        userAccount.metadata = JSON.parse(userAccount.json_metadata)
      }
    } catch (error) {
      console.error("Error parsing json_metadata:", error)
      userAccount.metadata = {}
    }

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
        userAccount.metadata = {}
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
          const isSubscribed = await checkCommunitySubscription(username)
          if (!isSubscribed && key) {
            //console.log("not subscribed!!")
            await communitySubscribePassword(key, username)
          }
        } else {
          console.error(validation.message)
          return reject(validation.message)
        }
      }


      if (privateKey) {
        return
      }

      const memo = `${username} signed up with skatehive app at ${Date.now()}`

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
                        if (userAccount.posting_json_metadata) userAccount.metadata = JSON.parse(
                          userAccount.posting_json_metadata
                        )
                    }
                    setHiveUser(userAccount)
                    localStorage.setItem("hiveuser", JSON.stringify(userAccount))
                    localStorage.setItem("LoginMethod", "keychain")
                    const isSubscribed = await checkCommunitySubscription(username)
                    if (!isSubscribed) {
                      //console.log("not subscribed!!")
                      await communitySubscribeKeyChain(username)
                    }
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
