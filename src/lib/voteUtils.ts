import { witnessVoteWithKeychain, witnessVoteWithPrivateKey } from "./hive/client-functions";

export const getDownvoteCount = (activeVotes: { percent: number }[]): number => {
  if (!Array.isArray(activeVotes)) {
    return 0; // Return 0 if activeVotes is not a valid array
  }
  return activeVotes.filter((vote) => vote.percent < 0).length;
};

export const exceedsDownvoteThreshold = (
  activeVotes: { percent: number }[],
  threshold: number
): boolean => {
  const downvoteCount = getDownvoteCount(activeVotes);
  return downvoteCount >= threshold;
};

export const handleWitnessVote = (connectedUser: string) => {
  // lets check which loginmethod the user used 
  const loginMethod = localStorage.getItem("LoginMethod");
  if (loginMethod === "keychain") {
    witnessVoteWithKeychain(connectedUser, "skatehive");
  }
  else if (loginMethod === "privateKey") {
    witnessVoteWithPrivateKey(connectedUser, "skatehive", true);
  }
}
