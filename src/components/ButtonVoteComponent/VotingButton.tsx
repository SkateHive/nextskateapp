import LoginModal from "@/components/Hive/Login/LoginModal";
import { HStack, Text } from "@chakra-ui/react";
import { useRef, useState, useEffect } from "react";
import { FaHeart, FaHeartBroken, FaRegHeart } from "react-icons/fa";
import { useReward } from "react-rewards";
import { useHiveUser } from "@/contexts/UserContext";
import { v4 as uuidv4 } from "uuid";
import VoteButtonModal from "./VoteButtonModal";
import { processVote } from "@/lib/hive/vote-utils";
import { voting_value2 } from "../PostCard/calculateHiveVotingValueForHiveUser";
import { getDownvoteCount } from "@/lib/voteUtils";

const VotingButton = ({
  comment,
  username,
  onVoteSuccess,
}: {
  comment: any;
  username: string;
  onVoteSuccess: (
    voteType: string,
    voteValue: number,
    updatedComment?: any
  ) => void;
}) => {
  const { voteValue, hiveUser } = useHiveUser();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isVoteModalOpen, setIsVoteModalOpen] = useState(false);
  const [touchTimer, setTouchTimer] = useState<NodeJS.Timeout | null>(null);
  const [isVoting, setIsVoting] = useState(false);
  const [isVoteCancelled, setIsVoteCancelled] = useState(false);
  const [calculatedVoteValue, setCalculatedVoteValue] = useState<number | null>(
    null
  );

  // Fetch the actual vote value once the component loads
  useEffect(() => {
    const fetchVoteValue = async () => {
      if (hiveUser) {
        try {
          const value = await voting_value2(hiveUser);
          setCalculatedVoteValue(value);
        } catch (error) {
          console.error("Error fetching vote value:", error);
        }
      }
    };

    fetchVoteValue();
  }, [hiveUser]);

  const TOUCH_TIMEOUT = 1000;
  const VOTE_TYPES = {
    UPVOTE: "upvote",
    DOWNVOTE: "downvote",
    CANCEL: "cancel",
  };

  const voteButtonRef = useRef<HTMLDivElement>(null);
  const initialUpvoted = comment.active_votes?.some(
    (vote: any) => vote.voter === username && vote.percent > 0
  );
  const initialDownvoted = comment.active_votes?.some(
    (vote: any) => vote.voter === username && vote.percent < 0
  );

  const initialUpvoteCount =
    comment.active_votes?.filter((vote: any) => vote.percent > 0).length || 0;
  const initialDownvoteCount = getDownvoteCount(comment.active_votes);

  const [isUpvoted, setIsUpvoted] = useState(initialUpvoted);
  const [isDownvoted, setIsDownvoted] = useState(initialDownvoted);

  const [upvoteCount, setUpvoteCount] = useState(initialUpvoteCount);
  const [downvoteCount, setDownvoteCount] = useState(initialDownvoteCount);

  const uniqueId = uuidv4();
  const { reward, isAnimating } = useReward(uniqueId, "emoji", {
    emoji: ["$", "*", "#"],
    spread: 60,
  });

  // Utility function to update votes
  const updateVotes = (
    action: string,
    userVoteValue: number = calculatedVoteValue || voteValue
  ) => {
    if (action === VOTE_TYPES.UPVOTE) {
      setIsUpvoted(true);
      setIsDownvoted(false);
      setUpvoteCount((prev: number) => prev + 1);
      if (isDownvoted) {
        setDownvoteCount((prev: number) => prev - 1);
      }
    } else if (action === VOTE_TYPES.DOWNVOTE) {
      setIsUpvoted(false);
      setIsDownvoted(true);
      setDownvoteCount((prev: number) => prev + 1);
      if (isUpvoted) {
        setUpvoteCount((prev: number) => prev - 1);
      }
    } else if (action === VOTE_TYPES.CANCEL) {
      setIsUpvoted(false);
      setUpvoteCount((prev: number) => Math.max(prev - 1, 0));
      setDownvoteCount((prev: number) => Math.max(prev - 1, 0));
    }
  };

  const handleVote = async (voteType: string, voteWeight: number) => {
    if (voteWeight === 0) {
      updateVotes(VOTE_TYPES.CANCEL);
      onVoteSuccess(VOTE_TYPES.CANCEL, 0); // Notify parent only once
      return;
    }

    if (!username) {
      setIsLoginModalOpen(true);
      return;
    }

    try {
      setIsVoting(true);
      const response = await processVote({
        username,
        author: comment.author,
        permlink: comment.permlink,
        weight: voteWeight,
        userAccount: hiveUser,
      });

      if (response.success) {
        const finalVoteType = response.voteType || voteType;
        const finalVoteValue =
          response.voteValue || calculatedVoteValue || voteValue;

        updateVotes(finalVoteType, finalVoteValue);
        reward();

        // Notify parent only once after successful vote
        onVoteSuccess(finalVoteType, finalVoteValue);
      }
    } catch (error) {
      // Handle error
    } finally {
      setIsVoting(false);
    }
  };

  const handleRightClick = (e: React.MouseEvent, voteType: string) => {
    e.preventDefault();
    if (isAnimating) {
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
      return;
    }
    if (!username) {
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
      return (
        <span id={uniqueId}>
          <FaRegHeart />
        </span>
      );
    }
    if (isUpvoted) {
      return (
        <span id={uniqueId}>
          <FaHeart />
        </span>
      );
    }
    return (
      <span id={uniqueId}>
        <FaRegHeart />
      </span>
    );
  };

  return (
    <>
      {isLoginModalOpen && (
        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
        />
      )}
      <HStack spacing={4} cursor="pointer" color="#A5D6A7">
        <HStack
          spacing={1}
          cursor={isUpvoted ? "not-allowed" : "pointer"} // Cursor disabled for repeated votes
          style={{
            userSelect: "none",
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
            fontSize={"14px"}
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
            style={{ userSelect: "none" }}
          >
            {isDownvoted && <FaHeartBroken color="#ff0000" />}
            <Text as="span" fontSize="14px" color="#ad4848">
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
          onSuccess={(voteType) =>
            updateVotes(voteType, calculatedVoteValue || voteValue)
          }
          currentVoteType={
            isUpvoted ? "upvote" : isDownvoted ? "downvote" : "none"
          }
        />
      )}
    </>
  );
};

export default VotingButton;
