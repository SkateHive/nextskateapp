"use client";

import LoadingComponent from "@/app/mainFeed/components/loadingComponent";
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
  return (
    <Box
      color={"white"}
      w={{ base: "100%", lg: "60vw" }}
      h={"100vh"}
      overflow={"scroll"}
      id="SkaterPage"
      mt={4}
    >
      {!hiveAccount ? (<Box w={"100%"}><LoadingComponent /></Box>) : (
        <>
          <SkaterHeader user={hiveAccount} />
          <SkaterTabs user={hiveAccount} />
        </>
      )}
    </Box>
  );
}
