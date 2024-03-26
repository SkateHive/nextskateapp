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
  
  return new Promise<void>((resolve, reject) => {
    (window as any).hive_keychain.requestVote(
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
