import { Operation } from "@hiveio/dhive"
import { HiveAccount } from "@/lib/useHiveAuth"
import { KeychainSDK, KeychainKeyTypes, Broadcast } from "keychain-sdk"
import { sendHiveOperation } from "@/lib/hive/server-functions"

export async function claimRewards(hiveUser: HiveAccount) {
  console.log('claimRewards', hiveUser)
  const rewardHiveBalance = hiveUser.reward_hive_balance
  const rewardHBDBalance = hiveUser.reward_hbd_balance
  const rewardVests = hiveUser.reward_vesting_balance
  console.log({ rewardHiveBalance, rewardHBDBalance, rewardVests });
  const operation: Operation = [
    "claim_reward_balance",
    {
      account: hiveUser.name,
      reward_hive: rewardHiveBalance,
      reward_hbd: rewardHBDBalance,
      reward_vests: rewardVests
    }
  ]

  const operations = [operation]

  const loginMethod = localStorage.getItem("LoginMethod")
  if (!hiveUser.name) {
    console.error("Username is missing")
    return
  }
  if (loginMethod === "keychain") {

    const keychain = new KeychainSDK(window)
    const formParamsAsObject = {
      "data": {
        "username": hiveUser.name,
        "operations": [operation],
        "method": KeychainKeyTypes.posting
      }
    }

    try {
      const broadcast = await keychain
        .broadcast(
          formParamsAsObject.data as Broadcast);
      console.log({ broadcast });
    } catch (error) {
      console.log({ error });
    }
  } else if (loginMethod === "privateKey") {
    const encryptedPrivateKey = localStorage.getItem("EncPrivateKey");
    sendHiveOperation(encryptedPrivateKey, operations)
  }
}