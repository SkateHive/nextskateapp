'use client';
import { Broadcast, Custom, KeychainKeyTypes, KeychainRequestResponse, KeychainSDK, Login, Post, Transfer, Vote, WitnessVote } from "keychain-sdk";
import { VideoPart } from "../models/user";
import HiveClient from "./hiveclient";

interface HiveKeychainResponse {
  success: boolean
  publicKey: string
}

const communityTag = process.env.NEXT_PUBLIC_HIVE_COMMUNITY_TAG;

/*
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

}
*/

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
export async function commentWithKeychain(formParamsAsObject: any): Promise<HiveKeychainResponse | undefined> {

  const keychain = new KeychainSDK(window);
  const post = await keychain.post(formParamsAsObject.data as Post);
  if (post) {
    console.log('post', post);
    return {
      success: true,
      publicKey: String(post.publicKey)
    }
  } else {
    return {
      success: false,
      publicKey: 'deu merda'
    }

  }
}
export async function loginWithKeychain(username: string) {
  try {
    const memo = `${username} signed up with skatehive app at ${Date.now()}`
    const keychain = new KeychainSDK(window);
    undefined
    const formParamsAsObject = {
      "data": {
        "username": username,
        "message": memo,
        "method": KeychainKeyTypes.posting,
        "title": "Login"
      }
    }

    const login = await keychain
      .login(
        formParamsAsObject.data as Login);
    console.log({ login });
  } catch (error) {
    console.log({ error });
  }
}
export function getReputation(rep: number) {
  let out = ((Math.log10(Math.abs(rep)) - 9) * 9) + 25;
  out = Math.round(out);
  return out;
}
export async function transferWithKeychain(username: string, destination: string, amount: string, memo: string, currency: string) {
  try {
    const keychain = new KeychainSDK(window);

    const formParamsAsObject = {
      "data": {
        "username": username,
        "to": destination,
        "amount": amount,
        "memo": memo,
        "enforce": false,
        "currency": currency,
      }
    }

    const transfer = await keychain
      .transfer(
        formParamsAsObject.data as Transfer);
    console.log({ transfer });
  } catch (error) {
    console.log({ error });
  }
}
export async function updateProfile(username: string, name: string, about: string, location: string, coverImageUrl: string, avatarUrl: string, website: string, ethAddress: string, videoParts: VideoPart[], level: number, staticXp?: number, cumulativeXp?: number) {
  try {
    const keychain = new KeychainSDK(window);

    const profileMetadata = {
      profile: {
        name: name,
        about: about,
        location: location,
        cover_image: coverImageUrl,
        profile_image: avatarUrl,
        website: website,
        version: 2
      }
    };

    const extMetadata = {
      extensions: {
        eth_address: ethAddress,
        video_parts: videoParts,
        level: level,
        staticXp: staticXp,
        cumulativeXp: cumulativeXp
      }
    }

    const formParamsAsObject = {
      data: {
        username: username,
        operations: [
          [
            'account_update2',
            {
              account: username,
              json_metadata: JSON.stringify(extMetadata),
              posting_json_metadata: JSON.stringify(profileMetadata),
              extensions: []
            }
          ]
        ],
        method: KeychainKeyTypes.active,
      },
    };

    const broadcast = await keychain.broadcast(formParamsAsObject.data as unknown as Broadcast);
    console.log('Broadcast success:', broadcast);
  } catch (error) {
    console.error('Profile update failed:', error);
  }
}
export async function checkCommunitySubscription(username: string) {

  const parameters = {
    account: username
  }
  try {
    const subscriptions = await HiveClient.call('bridge', 'list_all_subscriptions', parameters);
    return subscriptions.some((subscription: any) => subscription[0] === communityTag);
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    return false; // Returning false in case of an error
  }
}
export async function communitySubscribeKeyChain(username: string) {

  const keychain = new KeychainSDK(window);
  const json = [
    'subscribe',
    {
      community: communityTag
    }
  ]
  const formParamsAsObject = {
    data: {
      username: username,
      id: "community",
      method: KeychainKeyTypes.posting,
      json: JSON.stringify(json)
    },
  };
  try {
    const custom = await keychain.custom(formParamsAsObject.data as unknown as Custom);
    //const broadcast = await keychain.broadcast(formParamsAsObject.data as unknown as Broadcast);
    console.log('Broadcast success:', custom);
  } catch (error) {
    console.error('Profile update failed:', error);
  }
}
export async function checkFollow(follower: string, following: string): Promise<boolean> {
  try {
    const status = await HiveClient.call('bridge', 'get_relationship_between_accounts', [
      follower,
      following
    ]);
    if (status.follows) {
      return true
    } else {
      return false
    }
  } catch (error) {
    console.log(error)
    return false
  }
}
export async function changeFollow(follower: string, following: string) {
  const keychain = new KeychainSDK(window);
  const status = await checkFollow(follower, following)
  let type = ''
  if (status) {
    type = ''
  } else {
    type = 'blog'
  }
  const json = JSON.stringify([
    'follow',
    {
      follower: follower,
      following: following,
      what: [type], //null value for unfollow, 'blog' for follow
    },
  ]);

  const formParamsAsObject = {
    data: {
      username: follower,
      id: "follow",
      method: KeychainKeyTypes.posting,
      json: JSON.stringify(json)
    },
  };
  try {
    const custom = await keychain.custom(formParamsAsObject.data as unknown as Custom);
    //const broadcast = await keychain.broadcast(formParamsAsObject.data as unknown as Broadcast);
    console.log('Broadcast success:', custom);
  } catch (error) {
    console.error('Profile update failed:', error);
  }

}
export async function witnessVoteWithKeychain(username: string, witness: string) {
  const keychain = new KeychainSDK(window);
  try {
    const formParamsAsObject = {
      "data": {
        "username": username,
        "witness": "skatehive",
        "vote": true
      }
    };
    const witnessvote = await keychain
      .witnessVote(
        formParamsAsObject.data as WitnessVote);
    console.log({ witnessvote });
  } catch (error) {
    console.log({ error });
  }

}