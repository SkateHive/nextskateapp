import { handleVote } from "@/app/mainFeed/utils/handleFeedVote";
import LoginModal from "@/components/Hive/Login/LoginModal";
import { HStack, Text } from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { FaHeart, FaHeartBroken, FaRegHeart } from "react-icons/fa";
import { useReward } from "react-rewards";
import VoteButton from "./VoteButton";

const VotingButton = ({
  comment,
  username,
  toggleValueTooltipButton
}: {
  comment: any;
  username: string;
  toggleValueTooltipButton: () => void;
}) => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isVoteModalOpen, setIsVoteModalOpen] = useState(false);
  const [clickPosition, setClickPosition] = useState<{ x: number; y: number } | undefined>(undefined);
  const [touchTimer, setTouchTimer] = useState<NodeJS.Timeout | null>(null);
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const [isVoting, setIsVoting] = useState(false); 

  const toggleValueTooltip = () => {
    setIsTooltipVisible(prev => !prev);
  };

  const TOUCH_TIMEOUT = 1000;

  const voteButtonRef = useRef<HTMLDivElement | null>(null);

  const initialUpvoted = comment.active_votes?.some(
    (vote: any) => vote.voter === username && vote.percent > 0
  );
  const initialDownvoted = comment.active_votes?.some(
    (vote: any) => vote.voter === username && vote.percent < 0
  );

  const [isUpvoted, setIsUpvoted] = useState(initialUpvoted);
  const [isDownvoted, setIsDownvoted] = useState(initialDownvoted);

  const [upvoteCount, setUpvoteCount] = useState(comment.active_votes?.filter(
    (vote: any) => vote.percent > 0
  ).length || 0);

  const [downvoteCount, setDownvoteCount] = useState(comment.active_votes?.filter(
    (vote: any) => vote.percent < 0
  ).length || 0);

  const rewardId = `reward-${comment.id}`;
  const { reward, isAnimating } = useReward(rewardId, "emoji", {
    emoji: ["$", "*", "#"],
    spread: 60,
  });

  const updateVotes = () => {
    setUpvoteCount((prev: number) => prev + 1);
    setDownvoteCount((prev: number) => prev - (isDownvoted ? 1 : 0));
  };

  const handleRightClick = (e: React.MouseEvent, voteType: 'upvote' | 'downvote') => {
    e.preventDefault();
    // Block interaction during animation
    if (isAnimating) {
      console.log("Animation in progress, please wait.");
      return;
    }
    if (!username) {
      setIsLoginModalOpen(true);
      return;
    }
    const { clientX, clientY, button } = e;
    setClickPosition({ x: clientX, y: clientY });
    if (button === 2) { // Right click to open vote modal
      setIsVoteModalOpen(true);
    }
    toggleValueTooltip();
    // Cleaning touchTimer if necessary
    if (touchTimer) {
      clearTimeout(touchTimer);
    }
  };
  const handleLeftClick = (e: React.MouseEvent) => {
    try {
      const { button } = e;

      if (isVoting) {
        console.log("Voting, please wait...");
        return;
      }

      // Block interaction during animation
      if (isAnimating) {
        console.log("Animation in progress, please wait.");
        return;
      }
      if (!username) {
        console.error("Error: The user is not logged in.");
        setIsLoginModalOpen(true); // Abre o modal de login
        return;
      }
      if (button === 0) { // Left click to upvote
        setIsVoting(true);
        handleVote(comment.author, comment.permlink, username, 10000, updateVotes, setIsVoting)
          .then(() => {
            setIsUpvoted(true);
            setIsDownvoted(false);
            setUpvoteCount(upvoteCount + 1);
            setDownvoteCount(downvoteCount - (isDownvoted ? 1 : 0));
            reward();
          })
          .catch(error => console.error("Error during voting:", error));

        toggleValueTooltip();
      }
    } catch (error) {
      console.error("Error handling vote:", error);
    }
  };

  // function that registers votes on mobile
  const handleTouchStart = (e: TouchEvent) => {
    e.preventDefault();

    const startTouchTime = Date.now();

    const handleTouchEnd = () => {
      const duration = Date.now() - startTouchTime;
      if (duration > TOUCH_TIMEOUT) {
        setIsVoteModalOpen(true);
      }
    };

    const touchEndListener = () => {
      handleTouchEnd();
      voteButtonRef.current?.removeEventListener('touchend', touchEndListener);
    };

    voteButtonRef.current?.addEventListener('touchend', touchEndListener, { once: true });
  };

  useEffect(() => {
    const voteButtonElement = voteButtonRef.current;

    if (voteButtonElement) {

      const handleTouchStartListener = (e: TouchEvent) => {
        e.preventDefault(); // don't let default behavior happen
        handleTouchStart(e); // call logic from the beginning of the ring
      };

      // const handleContextMenuListener = (e: MouseEvent) => {
      //   e.preventDefault();
      // };

      voteButtonElement.addEventListener("touchstart", handleTouchStartListener, { passive: false });


      return () => {
        voteButtonElement.removeEventListener("touchstart", handleTouchStartListener);
        // voteButtonElement.removeEventListener("contextmenu", handleContextMenuListener);
      };
    }
  }, []);


  // Função chamada quando o voto é confirmado no modal
  const onVoteSuccess = (voteType: 'upvote' | 'downvote') => {
    if (voteType === 'upvote') {
      setIsUpvoted(true);
      setIsDownvoted(false);
      setUpvoteCount(upvoteCount + 1);
      setDownvoteCount(downvoteCount - (isDownvoted ? 1 : 0));
      reward();
    } else if (voteType === 'downvote') {
      setIsDownvoted(true);
      setIsUpvoted(false);
      setDownvoteCount(downvoteCount + 1);
      setUpvoteCount(upvoteCount - (isUpvoted ? 1 : 0));
    }
    setIsVoteModalOpen(false); // Closing the modal
  };




  return (
    <>
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />

      <HStack spacing={4} cursor="pointer" color="#A5D6A7">
        <HStack
          id={rewardId}
          ref={voteButtonRef}
          onClick={(e) => handleLeftClick(e)} 
          onContextMenu={(e) => handleRightClick(e, "downvote")} 
          spacing={1}
          cursor={isVoting ? "not-allowed" : "pointer"} 
          style={{ userSelect: 'none', pointerEvents: isVoting ? "none" : "auto" }} 
          onMouseLeave={toggleValueTooltip}
        >
          <Text fontSize="18px" color={isVoting ? "gray" : "limegreen"}>
            {isVoting ? "Voting..." : isUpvoted ? <FaHeart /> : <FaRegHeart />}
          </Text>
          <Text fontSize="18px" color={isVoting ? "gray" : "#61ad64"}>
            {isVoting ? "..." : upvoteCount}
          </Text>
        </HStack>



        {isDownvoted && (
          <HStack
            id={rewardId}
            onClick={(e) => handleRightClick(e, "downvote")}
            onContextMenu={(e) => handleRightClick(e, "downvote")}
            spacing={1}
            cursor="pointer"
            style={{ userSelect: 'none' }}
            onMouseLeave={toggleValueTooltip}
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

      {isVoteModalOpen && (

        <VoteButton
          author={comment.author}
          permlink={comment.permlink}
          comment={comment}
          isModal={true}
          onClose={() => setIsVoteModalOpen(false)}
          onSuccess={onVoteSuccess}
          currentVoteType={isUpvoted ? 'upvote' : isDownvoted ? 'downvote' : 'none'}
        />

      )}
    </>
  );
};

export default VotingButton;
