import { KeychainSDK } from "keychain-sdk";

interface Vote {
  username: string;
  permlink: string;
  author: string;
  weight: 10000;
  // Add other properties if needed
}

const voteOnContent = async (username: string, permlink: string, author: string, weight: number) => {
  if (!username) {
    throw new Error("Username is missing");
  }

  if (typeof window === "undefined") {
    throw new Error("This function can only be used in the browser.");
  }

  return new Promise<void>((resolve, reject) => {
    console.log(window.hive_keychain)
    window.hive_keychain.requestVote(
      username,
      permlink,
      author,
      weight,
      (response: any) => {
        if (response.success) {
          resolve();
        } else {
          reject(response.error || "Vote request failed");
        }
      }
    );
  });
};

export default voteOnContent;
