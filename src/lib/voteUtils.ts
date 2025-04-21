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
