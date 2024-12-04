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

  const handleRightClick = (e: React.MouseEvent, voteType: 'upvote' | 'downvote') => {
    e.preventDefault();

    if (!username) {

      setIsLoginModalOpen(true);
      return;
    }


    const { clientX, clientY, button } = e;
    setClickPosition({ x: clientX, y: clientY });


    if (button === 2) {  // Clique direito para downvote
      setIsVoteModalOpen(true);  // Aqui é onde o modal é ativado
    }
    toggleValueTooltip();


    // Limpeza do touchTimer se necessário
    if (touchTimer) {
      clearTimeout(touchTimer);
    }
  };


  const handleLeftClick = (e: React.MouseEvent) => {

    try {
      const { clientX, clientY, button } = e;
      if (button === 0) {  // Clique esquerdo para upvote
        handleVote(comment.author, comment.permlink, username ?? "", 10000).then(() => {
          setIsUpvoted(true);
          setIsDownvoted(false);
          setUpvoteCount(upvoteCount + 1);
          setDownvoteCount(downvoteCount - (isDownvoted ? 1 : 0));
          reward();
        });
        toggleValueTooltip();
      }
    } catch (error) {
      console.error("Error handling vote:", Error);
    }

  }

  //funcao que registra voto no no mobile 
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
        e.preventDefault(); // nao deixa comportamento padrao acontecer
        handleTouchStart(e); // chama logica do inicio do toque
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
    } else if (voteType === 'downvote') {
      setIsDownvoted(true);
      setIsUpvoted(false);
      setDownvoteCount(downvoteCount + 1);
      setUpvoteCount(upvoteCount - (isUpvoted ? 1 : 0));
    }
    reward();
    setIsVoteModalOpen(false); // Fechando o modal
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
          onClick={(e) => handleLeftClick(e,)}
          onContextMenu={(e) => handleRightClick(e, "downvote")}
          spacing={1}
          cursor="pointer"
          style={{ userSelect: 'none' }}
          onMouseLeave={toggleValueTooltip}
        >
          <Text fontSize="18px" color="#A5D6A7">
            {isUpvoted ? <FaHeart /> : <FaRegHeart />}
          </Text>
          <Text fontSize="18px" color="#A5D6A7">
            {upvoteCount}
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
            <Text fontSize="18px" color="#A5D6A7">
              {isDownvoted ? <FaHeartBroken /> : ""}
            </Text>
            <Text fontSize="18px" color="#A5D6A7">
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
