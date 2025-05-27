import { processVote } from "@/lib/hive/vote-utils";

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

  if (!username) {
    console.error("Username is missing");
    return;
  }

  try {
    setIsVoting(true);

    const response = await processVote({
      username,
      author,
      permlink,
      weight
    });

    if (response.success) {
      updateVotes();
      console.log("Vote registered successfully");
    } else {
      console.error("Error during voting:", response.message);
      if (response.message?.includes("user_cancel")) {
        updateVotes("cancel");
      }
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
