import { useHiveUser } from "@/contexts/UserContext"
import * as dhive from "@hiveio/dhive"
import HiveClient from "./hiveclient"

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
  posting_json_metadata: string
  json_metadata: string
  metadata?: MetadataProps
}

export type AuthUser = {
  hiveUser: HiveAccount | null
  loginWithHive: (username: string, loginAs?: boolean) => Promise<void>
  logout: () => void
  isLoggedIn: () => boolean
}

function useAuthHiveUser(): AuthUser {
  const hiveClient = HiveClient()
  const { hiveUser, setHiveUser } = useHiveUser()

  const loginWithHive = (
    username: string,
    loginAs: boolean = false
  ): Promise<void> => {
    return new Promise(async (resolve, reject) => {
      if (!username) reject("Empty username")

      if (loginAs) {
        const val2 = await hiveClient.database.getAccounts([username])
        const userAccount: HiveAccount = {
          ...val2[0],
        }
        userAccount.metadata = JSON.parse(userAccount.json_metadata)
        setHiveUser(userAccount)
        localStorage.setItem("hiveuser", JSON.stringify(userAccount))
        resolve()
        return
      }

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

                  userAccount.metadata = JSON.parse(userAccount.json_metadata)

                  setHiveUser(userAccount)
                  localStorage.setItem("hiveuser", JSON.stringify(userAccount))
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
