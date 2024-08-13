"use client";

import SkaterHeader from "@/components/Skater/SkaterHeader";
import SkaterTabs from "@/components/Skater/SkaterTabs";
import useHiveAccount from "@/hooks/useHiveAccount";
import { Box } from "@chakra-ui/react";

interface ProfilePageProps {
  params: {
    username: string;
  };
}

export default function SkaterPage({ params }: ProfilePageProps) {
  const { hiveAccount } = useHiveAccount(params.username);
  if (!hiveAccount) return <Box w={"100%"}>Loading...</Box>;
  return (
    <Box
      color={"white"}
      w={"100%"}
      h={"100vh"}
      overflow={"scroll"}
      id="SkaterPage"
    >
      <SkaterHeader user={hiveAccount} />
      <SkaterTabs user={hiveAccount} />
    </Box>
  );
}
