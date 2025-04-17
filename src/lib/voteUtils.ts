export const getDownvoteCount = (activeVotes: { percent: number }[]): number => {
  return activeVotes.filter((vote) => vote.percent < 0).length;
};

export const exceedsDownvoteThreshold = (
  activeVotes: { percent: number }[],
  threshold: number
): boolean => {
  const downvoteCount = getDownvoteCount(activeVotes);
  return downvoteCount >= threshold;
};
