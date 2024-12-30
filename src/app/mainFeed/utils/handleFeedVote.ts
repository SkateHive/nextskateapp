import { vote } from "@/lib/hive/client-functions";
import { voteWithPrivateKey } from "@/lib/hive/server-functions";
import { VoteOperation } from "@hiveio/dhive";

export const handleVote = async (
  author: string,
  permlink: string,
  username: string,
  weight: number = 10000,
  updateVotes: Function,
  setIsVoting: React.Dispatch<React.SetStateAction<boolean>>
): Promise<void> => {

  if (weight === 0) {
    console.log("Canceling vote, not allowing the vote to be registered.");
    updateVotes("cancel");
    return;
  }

  // Check if we are on the client side (browser)
  if (typeof window === "undefined") {
    console.error("localStorage is not available on the server.");
    return;
  }

  const loginMethod = localStorage.getItem("LoginMethod");

  if (!username) {
    console.error("Username is missing");
    return;
  }

  try {
    setIsVoting(true);
    if (loginMethod === "keychain") {
      await vote({
        username,
        permlink,
        author,
        weight,
      });
      updateVotes();
      console.log("Vote registered with Keychain");
    } else if (loginMethod === "privateKey") {
      const vote: VoteOperation = [
        "vote",
        {
          author,
          permlink,
          voter: username,
          weight,
        },
      ];

      const encryptedPrivateKey = localStorage.getItem("EncPrivateKey");
      if (!encryptedPrivateKey) {
        console.error("Private key not found in localStorage");
        return;
      }

      await voteWithPrivateKey(encryptedPrivateKey, vote);
      updateVotes();
      console.log("Vote registered with private key");
    } else {
      console.error("Login method not recognized.");
    }
  } catch (error) {
    console.error("Error during voting:", error);
    if ((error as Error)?.message?.includes("user_cancel")) {
      console.log("Vote was canceled by the user, updating state to reflect cancellation.");
      updateVotes("cancel");
    }
  } finally {
    setIsVoting(false);
  }
};
