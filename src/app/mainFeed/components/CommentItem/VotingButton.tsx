import LoginModal from "@/components/Hive/Login/LoginModal";
import { Button } from "@chakra-ui/react";
import { useState } from "react";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { useReward } from "react-rewards";
import { handleVote } from "../../utils/handleFeedVote";

const VotingButton = ({
    comment,
    username,
    toggleValueTooltip,
}: {
    comment: any;
    username: any;
    toggleValueTooltip: () => void;
}) => {
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const initialIsVoted = comment.active_votes?.some(
        (vote: any) => vote.voter === username,
    );
    const [isVoted, setIsVoted] = useState(initialIsVoted);
    const [voteCount, setVoteCount] = useState(comment.active_votes?.length || 0);
    const rewardId = `reward-${comment.id}`;
    const { reward } = useReward(rewardId, "emoji", {
        emoji: ["$", "*", "#"],
        spread: 60,
    });

    const handleVoteClick = async () => {
        if (username === "") {
            setIsLoginModalOpen(true);
            return;
        } else {
            const newIsVoted = !isVoted;
            await handleVote(comment.author, comment.permlink, username ?? "", 10000);
            setIsVoted(newIsVoted);
            toggleValueTooltip();
            setVoteCount((prevVoteCount: number) =>
                newIsVoted ? prevVoteCount + 1 : prevVoteCount - 1,
            );

            if (newIsVoted) {
                reward();
            }
        }
    };

    return (
        <>
            <LoginModal
                isOpen={isLoginModalOpen}
                onClose={() => setIsLoginModalOpen(false)}
            />
            <Button
                onClick={handleVoteClick}

                colorScheme="green"
                variant="ghost"
                _hover={{
                    background: "transparent",
                    color: "green.400",
                }}

                leftIcon={isVoted ? <FaHeart /> : <FaRegHeart />}
            >
                <span
                    id={rewardId}
                    style={{
                        position: "absolute",
                        left: "50%",
                        bottom: "15px",
                        transform: "translateX(-50%)",
                        zIndex: 5,
                    }}
                />
                {voteCount}
            </Button>
        </>
    );
};

export default VotingButton;