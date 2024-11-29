import LoginModal from "@/components/Hive/Login/LoginModal";
import { HStack, Text } from "@chakra-ui/react";
import { useState } from "react";
import { FaHeart, FaHeartBroken, FaRegHeart } from "react-icons/fa";
import { useReward } from "react-rewards";
import VoteButton from "./VoteButton";

const VotingButton = ({
  comment,
  username,
  toggleValueTooltip
}: {
  comment: any;
  username: string;
  toggleValueTooltip: () => void;  // Function to toggle the value tooltip
}) => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isVoteModalOpen, setIsVoteModalOpen] = useState(false);
  const [clickPosition, setClickPosition] = useState<{ x: number; y: number } | undefined>(undefined);

  // Checks the initial upvote and downvote state for the user
  const initialUpvoted = comment.active_votes?.some(
    (vote: any) => vote.voter === username && vote.percent > 0
  );
  const initialDownvoted = comment.active_votes?.some(
    (vote: any) => vote.voter === username && vote.percent < 0
  );

  const [isUpvoted, setIsUpvoted] = useState(initialUpvoted);
  const [isDownvoted, setIsDownvoted] = useState(initialDownvoted);
  
  // Separate counters for upvotes and downvotes
  const upvoteCount = comment.active_votes?.filter(
    (vote: any) => vote.percent > 0
  ).length;
  
  const downvoteCount = comment.active_votes?.filter(
    (vote: any) => vote.percent < 0
  ).length;

  const rewardId = `reward-${comment.id}`;
  const { reward, isAnimating } = useReward(rewardId, "emoji", {
    emoji: ["$", "*", "#"],
    spread: 60,
  });

  const handleVoteClick = (e: React.MouseEvent, voteType: 'upvote' | 'downvote') => {
    if (!username) {
      setIsLoginModalOpen(true);
      toggleValueTooltip();
      return;
    }

    // Captures the click position
    const { clientX, clientY } = e;
    setClickPosition({ x: clientX, y: clientY });

    // Opens the modal for the user to choose the type of vote
    setIsVoteModalOpen(true);
    toggleValueTooltip();
  };

  const handleVoteSuccess = async (voteType: 'upvote' | 'downvote') => {
    // Updates the vote states for upvote or downvote
    if (voteType === 'upvote') {
      setIsUpvoted(true);
      setIsDownvoted(false); // If voted upvote, remove downvote
    } else {
      setIsDownvoted(true);
      setIsUpvoted(false); // If voted downvote, remove upvote
    }

    reward();
    setIsVoteModalOpen(false);
  };

  return (
    <>
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />

      <HStack spacing={4} cursor="pointer" color="#A5D6A7">
        {/* Upvote Button */}
        <HStack onClick={(e) => handleVoteClick(e, 'upvote')} spacing={1} cursor="pointer">
          <Text fontSize="15px" color="#A5D6A7">
            {isUpvoted ? <FaHeart /> : <FaRegHeart />}
          </Text>
          <Text fontSize="12px" color="#A5D6A7">
            {upvoteCount || 0}
          </Text>
        </HStack>

        {/* Downvote Button - Only appears when the user has already downvoted */}
        {isDownvoted && ( // The downvote button only appears if the user has actually downvoted
          <HStack onClick={(e) => handleVoteClick(e, 'downvote')} spacing={1} cursor="pointer">
            <Text fontSize="15px" color="#A5D6A7">
              <FaHeartBroken />
            </Text>
            <Text fontSize="12px" color="#A5D6A7">
              {downvoteCount || 0}
            </Text>
          </HStack>
        )}
      </HStack>

      {isVoteModalOpen && (
        <VoteButton
          author={comment.author}
          permlink={comment.permlink}
          comment={comment}
          isModal={true}
          onClose={() => setIsVoteModalOpen(false)}
          onSuccess={handleVoteSuccess}
          currentVoteType={isUpvoted ? 'upvote' : isDownvoted ? 'downvote' : 'none'} 
        />
      )}
    </>
  );
};

export default VotingButton;
