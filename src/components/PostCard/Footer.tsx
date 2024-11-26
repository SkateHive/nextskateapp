import VotingButton from "@/components/ButtonVoteComponent/VotingButton";
import { usePostContext } from "@/contexts/PostContext";
import { useHiveUser } from "@/contexts/UserContext";
import { HiveAccount } from "@/lib/useHiveAuth";
import { CardFooter, HStack, Text, Tooltip } from "@chakra-ui/react";
import { useState } from "react";

interface FooterProps {
  username?: string;
}

export default function Footer({ username }: FooterProps) {
  const { post } = usePostContext();
  const [postEarnings, setPostEarnings] = useState(Number(post.getEarnings().toFixed(2)));
  const [isValueTooltipOpen, setIsValueTooltipOpen] = useState(false);
  const { hiveUser, voteValue } = useHiveUser();

  const usernameString = username
    ? typeof username === "string"
      ? username
      : (username as HiveAccount)?.name || ""
    : hiveUser?.name || "";

  const toggleValueTooltip = () => {
    setIsValueTooltipOpen(true);
    setTimeout(() => {
      setIsValueTooltipOpen(false);
    }, 3000);
  };

  return (
    <CardFooter pt={0} flexDirection={"column"} gap={2} key={hiveUser?.name}>
      <HStack justifyContent="space-between" width="100%">
        <VotingButton comment={post} username={usernameString} toggleValueTooltip={toggleValueTooltip} />

        <Tooltip
          label={`+$${voteValue.toFixed(6)}`}
          placement="top"
          isOpen={isValueTooltipOpen}
          hasArrow
        >
          <Text
            fontWeight={"bold"}
            color={"green.400"}
            cursor={"pointer"}
            mt={2}
          >
            ${postEarnings.toFixed(2)}
          </Text>
        </Tooltip>
      </HStack>
    </CardFooter>
  );
}
