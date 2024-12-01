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
  toggleValueTooltip
}: {
  comment: any;
  username: string;
  toggleValueTooltip: () => void;
}) => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isVoteModalOpen, setIsVoteModalOpen] = useState(false);
  const [clickPosition, setClickPosition] = useState<{ x: number; y: number } | undefined>(undefined);
  const [touchTimer, setTouchTimer] = useState<NodeJS.Timeout | null>(null);

  // Waiting time (1 second) before showing the modal
  const TOUCH_TIMEOUT = 1000;

  // Referência para o botão de voto
  const voteButtonRef = useRef<HTMLDivElement | null>(null);

  // Checks if the user has already upvoted or downvoted
  const initialUpvoted = comment.active_votes?.some(
    (vote: any) => vote.voter === username && vote.percent > 0
  );
  const initialDownvoted = comment.active_votes?.some(
    (vote: any) => vote.voter === username && vote.percent < 0
  );

  const [isUpvoted, setIsUpvoted] = useState(initialUpvoted);
  const [isDownvoted, setIsDownvoted] = useState(initialDownvoted);

  // Separate counters for upvotes and downvotes
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


  // Função para lidar com o clique do voto
  const handleVoteClick = (e: React.MouseEvent, voteType: 'upvote' | 'downvote') => {
    e.preventDefault();
    if (!username) {
      setIsLoginModalOpen(true);
      toggleValueTooltip();
      return;
    }

    const { clientX, clientY, button } = e;
    setClickPosition({ x: clientX, y: clientY });

    if (button === 0) {
      handleVote(comment.author, comment.permlink, username ?? "", 10000);
    } else if (button === 2) {
      setIsVoteModalOpen(true);
      toggleValueTooltip();
    }

    if (touchTimer) {
      clearTimeout(touchTimer);
    }
  };

  // Function to detect the beginning of a touch on the mobile
  const handleTouchStart = (e: TouchEvent) => {
    e.preventDefault();

    const startTouchTime = Date.now();

    const handleTouchEnd = () => {
      const duration = Date.now() - startTouchTime;
      if (duration > TOUCH_TIMEOUT) {
        setIsVoteModalOpen(true);
        toggleValueTooltip();
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
        e.preventDefault();
        handleTouchStart(e);
      };

      const handleContextMenuListener = (e: MouseEvent) => {
        e.preventDefault();
      };

      voteButtonElement.addEventListener("touchstart", handleTouchStartListener, { passive: false });
      voteButtonElement.addEventListener("contextmenu", handleContextMenuListener);  // Previne o menu de contexto

      return () => {
        voteButtonElement.removeEventListener("touchstart", handleTouchStartListener);
        voteButtonElement.removeEventListener("contextmenu", handleContextMenuListener);
      };
    }
  }, []);

  return (
    <>
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />

      <HStack spacing={4} cursor="pointer" color="#A5D6A7">
        {/* Upvote Button */}
        <HStack
          ref={voteButtonRef}
          onClick={(e) => handleVoteClick(e, 'upvote')}
          onContextMenu={(e) => handleVoteClick(e, 'upvote')}
          spacing={1}
          cursor="pointer"
          style={{ userSelect: 'none' }}
        >
          <Text fontSize="18px" color="#A5D6A7">
            {isUpvoted ? <FaHeart /> : <FaRegHeart />}
          </Text>
          <Text fontSize="18px" color="#A5D6A7">
            {upvoteCount || 0}
          </Text>
        </HStack>

        {/* Downvote Button - Only appears when the user has already downvoted */}
        {isDownvoted && (
          <HStack
            onClick={(e) => handleVoteClick(e, 'downvote')}
            onContextMenu={(e) => handleVoteClick(e, 'downvote')}
            spacing={1}
            cursor="pointer"
            style={{ userSelect: 'none' }}
          >
            <Text fontSize="18px" color="#A5D6A7">
              <FaHeartBroken />
            </Text>
            <Text fontSize="18px" color="#A5D6A7">
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
          onSuccess={() => setIsVoteModalOpen(false)}
          currentVoteType={isUpvoted ? 'upvote' : isDownvoted ? 'downvote' : 'none'}
        />
      )}
    </>
  );
};

export default VotingButton;
