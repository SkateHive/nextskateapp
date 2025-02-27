import { vote } from "@/lib/hive/client-functions";
import LoginModal from "@/components/Hive/Login/LoginModal";
import { HStack, Text } from "@chakra-ui/react";
import { useRef, useState } from "react";
import { FaHeart, FaHeartBroken, FaRegHeart } from "react-icons/fa";
import { useReward } from "react-rewards";
import { useHiveUser } from "@/contexts/UserContext";
import { v4 as uuidv4 } from 'uuid';

import VoteButtonModal from "./VoteButtonModal";

const VotingButton = ({
  comment,
  username,
  onVoteSuccess, // Add this prop
}: {
  comment: any;
  username: string;
  onVoteSuccess: (voteType: string, voteValue: number) => void; // Define the prop type
}) => {
  const { voteValue } = useHiveUser(); // Get voteValue from useHiveUser
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isVoteModalOpen, setIsVoteModalOpen] = useState(false);
  const [touchTimer, setTouchTimer] = useState<NodeJS.Timeout | null>(null);
  const [isVoting, setIsVoting] = useState(false);
  const [isVoteCancelled, setIsVoteCancelled] = useState(false);

  const TOUCH_TIMEOUT = 1000;
  const VOTE_TYPES = {
    UPVOTE: 'upvote',
    DOWNVOTE: 'downvote',
    CANCEL: 'cancel'
  };

  const voteButtonRef = useRef<HTMLDivElement>(null);
  const initialUpvoted = comment.active_votes?.some(
    (vote: any) => vote.voter === username && vote.percent > 0
  );
  const initialDownvoted = comment.active_votes?.some(
    (vote: any) => vote.voter === username && vote.percent < 0
  );

  const initialUpvoteCount = comment.active_votes?.filter(
    (vote: any) => vote.percent > 0
  ).length || 0;
  const initialDownvoteCount = comment.active_votes?.filter(
    (vote: any) => vote.percent < 0
  ).length || 0;

  const [isUpvoted, setIsUpvoted] = useState(initialUpvoted);
  const [isDownvoted, setIsDownvoted] = useState(initialDownvoted);

  const [upvoteCount, setUpvoteCount] = useState(initialUpvoteCount);
  const [downvoteCount, setDownvoteCount] = useState(initialDownvoteCount);

  const uniqueId = uuidv4(); // Generate a unique ID for each instance
  const { reward, isAnimating } = useReward(uniqueId, "emoji", {
    emoji: ["$", "*", "#"],
    spread: 60,
  });

  // Utility function to update votes
  const updateVotes = (action: string, voteValue: number) => {
    if (action === VOTE_TYPES.UPVOTE) {
      setIsUpvoted(true);
      setIsDownvoted(false);
      setUpvoteCount((prev: number) => prev + 1);
      if (isDownvoted) {
        setDownvoteCount((prev: number) => prev - 1);
      }
      onVoteSuccess(VOTE_TYPES.UPVOTE, voteValue);
    } else if (action === VOTE_TYPES.DOWNVOTE) {
      setIsUpvoted(false);
      setIsDownvoted(true);
      setDownvoteCount((prev: number) => prev + 1);
      if (isUpvoted) {
        setUpvoteCount((prev: number) => prev - 1);
      }
      onVoteSuccess(VOTE_TYPES.DOWNVOTE, voteValue);
    } else if (action === VOTE_TYPES.CANCEL) {
      setIsUpvoted(false);
      setUpvoteCount((prev: number) => prev - 0);
      setDownvoteCount((prev: number) => prev - 0);
      onVoteSuccess(VOTE_TYPES.CANCEL, voteValue);
    }
  };

  const handleVote = async (voteType: string, voteWeight: number) => {
    try {
      setIsVoting(true);
      const response = await vote({
        username,
        permlink: comment.permlink,
        author: comment.author,
        weight: voteWeight,
      });
      if (response.success) {
        updateVotes(voteType, voteValue);
        reward(); // Call reward function here
      } else {
        console.error("Error when voting:", response.message);
        if (voteType === VOTE_TYPES.UPVOTE) {
          setIsUpvoted(false);
          setUpvoteCount((prev: number) => prev - 1);
        }
      }
    } catch (error) {
      console.error("Error when voting:", error);
    } finally {
      setIsVoting(false);
    }
  };

  const handleRightClick = (e: React.MouseEvent, voteType: string) => {
    e.preventDefault();
    if (isAnimating) {
      console.log("Animation in progress, please wait.");
      return;
    }
    if (!username) {
      setIsLoginModalOpen(true);
      return;
    }
    if (e.button === 2) {
      setIsVoteModalOpen(true);
    }
    if (touchTimer) {
      clearTimeout(touchTimer);
    }
  };

  const handleLeftClick = (e: React.MouseEvent) => {
    if (isVoting || isAnimating) {
      console.log("Voting or animation in progress, please wait...");
      return;
    }
    if (!username) {
      console.error("Error: The user is not logged in.");
      setIsLoginModalOpen(true);
      return;
    }
    if (e.button === 0) {
      if (isUpvoted) {
        handleVote(VOTE_TYPES.CANCEL, 0);
      } else {
        handleVote(VOTE_TYPES.UPVOTE, 10000);
      }
    }
  };

  // function that registers votes on mobile
  const handleTouchStart = (e: TouchEvent) => {
    e.preventDefault(); // Prevent text selection
    setTouchTimer(
      setTimeout(() => {
        setIsVoteModalOpen(true);
      }, TOUCH_TIMEOUT)
    );
  };

  const handleTouchEnd = (e: TouchEvent) => {
    if (touchTimer) {
      clearTimeout(touchTimer);
      setTouchTimer(null);
    }
    if (!isVoteModalOpen) {
      handleLeftClick(e as unknown as React.MouseEvent);
    }
  };

  // Icon control
  const renderUpvoteIcon = () => {
    if (isVoteCancelled) {
      return <span id={uniqueId}><FaRegHeart /></span>;
    }
    if (isUpvoted) {
      return <span id={uniqueId}><FaHeart /></span>;
    }
    return <span id={uniqueId}><FaRegHeart /></span>;
  };

  return (
    <>
      {isLoginModalOpen && <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />}
      <HStack spacing={4} cursor="pointer" color="#A5D6A7">
        <HStack
          spacing={1}
          cursor={isUpvoted ? "not-allowed" : "pointer"} // Cursor disabled for repeated votes
          style={{
            userSelect: 'none',
            pointerEvents: isUpvoted ? "none" : "auto", // Block clicks
          }}
          onClick={(e) => !isUpvoted && handleLeftClick(e)} // Block if you have already voted
          onContextMenu={(e) => handleRightClick(e, "upvote")} // Open modal on right-click
          onTouchStart={(e) => handleTouchStart(e as unknown as TouchEvent)} // Open modal on long press
          onTouchEnd={(e) => handleTouchEnd(e as unknown as TouchEvent)}
          alignItems="center"
          gap={2}
        >
          {renderUpvoteIcon()}
          <Text
            fontWeight={"bold"}
            color={"green.200"}
            cursor={"pointer"}
            id="voteButtonReward"
          >
            {upvoteCount}
          </Text>
        </HStack>
        {isDownvoted && (
          <HStack
            ref={voteButtonRef}
            onClick={(e) => handleRightClick(e, "downvote")}
            onContextMenu={(e) => handleRightClick(e, "downvote")}
            spacing={1}
            cursor="pointer"
            style={{ userSelect: 'none' }}
          >
            <Text fontSize="18px" color="#ff0000">
              {isDownvoted ? <FaHeartBroken /> : ""}
            </Text>
            <Text fontSize="18px" color="#ad4848">
              {downvoteCount}
            </Text>
          </HStack>
        )}
      </HStack>

      <div id={uniqueId} />

      {isVoteModalOpen && (
        <VoteButtonModal
          author={comment.author}
          permlink={comment.permlink}
          comment={comment}
          isModal={true}
          onClose={() => setIsVoteModalOpen(false)}
          onSuccess={(voteType) => updateVotes(voteType, voteValue)}
          currentVoteType={isUpvoted ? 'upvote' : isDownvoted ? 'downvote' : 'none'}
        />
      )}
    </>
  );
};

export default VotingButton;
