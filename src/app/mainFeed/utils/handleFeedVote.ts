import { vote } from "@/lib/hive/client-functions";
import { voteWithPrivateKey } from "@/lib/hive/server-functions";
import { VoteOperation } from "@hiveio/dhive";

export const handleVote = async (
  author: string,
  permlink: string,
  username: string,
  weight: number = 10000,
  updateVotes: Function, // Function to update vote count on the front end
  setIsVoting: React.Dispatch<React.SetStateAction<boolean>>
): Promise<void> => {
  const loginMethod = localStorage.getItem("LoginMethod");
  if (!username) {
    console.error("Username is missing");
    return;
  }

   // Use 1000 as default weight if not specified
  const normalizedWeight = Math.min(Math.max(weight, 0), 10000);

  try {
    setIsVoting(true);
    console.log("Starting the vote...");
    if (loginMethod === "keychain") {
      await vote({
        username: username,
        permlink: permlink,
        author: author,
        weight: normalizedWeight,
      });

      // Update the interface with the new vote count
      updateVotes();
      console.log("Vote successfully registered with Keychain");
    } else if (loginMethod === "privateKey") {
      console.log("Trying to vote with private key");
      const vote: VoteOperation = [
        "vote",
        {
          voter: username,
          permlink: permlink,
          author: author,
          weight: normalizedWeight,
        },
      ];

      const encryptedPrivateKey = localStorage.getItem("EncPrivateKey");
      if (encryptedPrivateKey) {
        await voteWithPrivateKey(encryptedPrivateKey, vote);
       // Update the interface with the new vote count
        updateVotes();
        console.log("Vote successfully registered with private key");
      } else {
        console.error("Private key not found");
      }
    }
  } catch (error) {
    console.error("Error during voting:", error);
  } finally {
    setIsVoting(false);
  }
};
