import LoginModal from "@/components/Hive/Login/LoginModal";
import { HStack, Text } from "@chakra-ui/react";
import { useState } from "react";
import { FaHeart, FaRegHeart } from "react-icons/fa";
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

  const initialIsVoted = comment.active_votes?.some(
    (vote: any) => vote.voter === username
  );
  const [isVoted, setIsVoted] = useState(initialIsVoted);
  const [voteCount, setVoteCount] = useState(comment.active_votes?.length);

  const rewardId = `reward-${comment.id}`;
  const { reward, isAnimating } = useReward(rewardId, "emoji", {
    emoji: ["$", "*", "#"],
    spread: 60,
  });

  const handleVoteClick = (e: React.MouseEvent) => {
    if (!username) {
      setIsLoginModalOpen(true);
      toggleValueTooltip();
      return;
    }

    // Capture the click position
    const { clientX, clientY } = e;

    // Save the coordinates to pass to the modal
    setClickPosition({ x: clientX, y: clientY });

    setIsVoteModalOpen(true);
    toggleValueTooltip();
  };

  const handleVoteSuccess = async () => {
    setIsVoted(true);
    setVoteCount((prevVoteCount: number) => prevVoteCount + 1);
    reward();
    setIsVoteModalOpen(false);
  };

  return (
    <>
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />

      <HStack onClick={handleVoteClick} cursor="pointer" color="#A5D6A7">
        <Text fontSize="15px" color="#A5D6A7">
          {isVoted ? <FaHeart /> : <FaRegHeart />}
        </Text>
        <Text fontSize="12px" color="#A5D6A7">
          {voteCount}
        </Text>
      </HStack>

      {isVoteModalOpen && (
        <VoteButton
          author={comment.author}
          permlink={comment.permlink}
          comment={comment}
          isModal={true}
          onClose={() => setIsVoteModalOpen(false)}
          onSuccess={handleVoteSuccess}
          clickPosition={clickPosition}
        />
      )}
    </>
  );
};

export default VotingButton;
