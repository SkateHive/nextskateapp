import React from "react";
import { Divider, Flex } from "@chakra-ui/react";
import UserAvatar from "@/components/UserAvatar";
import MainInput from "../../../components/MainInput";
import { Discussion } from "@hiveio/dhive";

interface UserInputSectionProps {
  user: any;
  isLoading: boolean;
  onCommentSubmit: (comment: Discussion) => void;
}

const UserInputSection: React.FC<UserInputSectionProps> = ({
  user,
  isLoading,
  onCommentSubmit,
}) => {
  if (!user.hiveUser) return null;

  return (
    <>
      <Flex width="full" p={2}>
        <UserAvatar
          hiveAccount={user.hiveUser}
          boxSize={12}
          borderRadius={5}
        />
        <MainInput
          username={user.hiveUser.name}
          isLoading={isLoading}
          onCommentSubmit={onCommentSubmit}
        />
      </Flex>
      <Divider />
    </>
  );
};

export default UserInputSection;
