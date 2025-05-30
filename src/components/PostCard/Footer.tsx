import VotingButton from "@/components/ButtonVoteComponent/VotingButton";
import { usePostContext } from "@/contexts/PostContext";
import { useUserData, useVoteValue } from "@/contexts/UserContext";
import { HiveAccount } from "@/lib/useHiveAuth";
import { Badge, CardFooter, HStack, Text, Tooltip } from "@chakra-ui/react";
import { useState } from "react";

interface FooterProps {
  username?: string;
}

export default function Footer({ username }: FooterProps) {
  const { post } = usePostContext();
  const [postEarnings, setPostEarnings] = useState(Number(post.getEarnings().toFixed(2)));
  const [isValueTooltipOpen, setIsValueTooltipOpen] = useState(false);
  const hiveUser = useUserData();
  const voteValue = useVoteValue();

  const usernameString = username
    ? typeof username === "string"
      ? username
      : (username as HiveAccount)?.name || ""
    : hiveUser?.name || "";

  const handleVoteSuccess = (voteType: string, voteValue: number) => {
    if (voteType === 'upvote') {
      setPostEarnings((prev) => prev + voteValue);
    } else if (voteType === 'cancel') {
      setPostEarnings((prev) => prev - voteValue);
    }
  };

  return (
    <CardFooter p={2} flexDirection={"column"} gap={1} key={hiveUser?.name}>
      <HStack justifyContent="space-between" width="100%">
        <VotingButton comment={post} username={usernameString} onVoteSuccess={handleVoteSuccess} />

        <Tooltip
          label={`+$${voteValue.toFixed(6)}`}
          placement="top"
          isOpen={isValueTooltipOpen}
          hasArrow
        >
          <Badge
            fontWeight={"bold"}
            colorScheme="green"
            cursor={"pointer"}
            fontSize={"1rem"}
          >
            ${postEarnings.toFixed(2)}
          </Badge>
        </Tooltip>
      </HStack>
    </CardFooter>
  );
}
