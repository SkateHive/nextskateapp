import { vote } from "@/lib/hive/client-functions"
import { voteWithPrivateKey } from "@/lib/hive/server-functions"
import { VoteOperation } from "@hiveio/dhive"
// Modify handleVote function to accept weight parameter
// Modify handleVote function to accept weight parameter
export const handleVote = async (
  author: string,
  permlink: string,
  username: string,
  weight?: number // Make weight optional
) => {
  const loginMethod = localStorage.getItem("LoginMethod");
  if (!username) {
    console.error("Username is missing");
    return;
  }

  // Use 1000 as default weight if not specified
  const normalizedWeight = Math.min(Math.max(weight || 1000, 0), 10000); // Ensure it's between 0 and 10000

  if (loginMethod === "keychain") {
    await vote({
      username: username,
      permlink: permlink,
      author: author,
      weight: normalizedWeight,
    });
  } else if (loginMethod === "privateKey") {
    console.log('trying to vote with private key');
    const vote: VoteOperation = [
      "vote",
      {
        voter: username,
        permlink: permlink,
        author: author,
        weight: normalizedWeight,
      }
    ];
    const encryptedPrivateKey = localStorage.getItem("EncPrivateKey");
    console.log(encryptedPrivateKey);
    voteWithPrivateKey(encryptedPrivateKey, vote);
  }
};
