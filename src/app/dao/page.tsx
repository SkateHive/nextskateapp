"use client";
import { Box, Flex, Center, Image, VStack, Progress, Text } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import CreateProposalModal from "./components/createProposalModal";
import DaoTreasure from "./components/daoTreasure";
import DaoHeader from "./components/daoHeader";
import ProposalListPanel from "./components/ProposalListPanel";
import ProposalDetailPanel from "./components/ProposalDetailPanel";
import fetchProposals, { Proposal } from "./utils/fetchProposals";

const DaoPage = () => {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loadingProposals, setLoadingProposals] = useState(true);
  const [loadingSummaries, setLoadingSummaries] = useState(false);
  const [mainProposal, setMainProposal] = useState<Proposal | null>(null);
  const { address: ethAccount } = useAccount();
  const [isCreateProposalModalOpen, setIsCreateProposalModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [progressValue, setProgressValue] = useState(0);

  useEffect(() => {
    fetchProposals({
      setProposals,
      setLoadingProposals,
      setLoadingSummaries,
    });
  }, []);

  useEffect(() => {
    if (proposals.length > 0) {
      setMainProposal(proposals[0]);
    }
  }, [proposals]);

  // Set the loading state based on proposals and summaries loading status
  useEffect(() => {
    if (!loadingProposals) {
      setIsLoading(false);
    }
  }, [loadingProposals]);

  // Progress bar animation logic
  useEffect(() => {
    const interval = setInterval(() => {
      setProgressValue((oldValue) => {
        const newValue = oldValue + 5; // Increment by 5
        if (newValue >= 100) {
          clearInterval(interval); // Stop interval at 100%
          return 100;
        }
        return newValue;
      });
    }, 69); // Change this to control the speed of the progress

    return () => clearInterval(interval); // Cleanup the interval on unmount
  }, []);

  const handleCreateProposalButton = () => {
    setIsCreateProposalModalOpen(!isCreateProposalModalOpen);
  };

  // Render the loading image and progress bar while the data is being fetched
  if (isLoading) {
    return (
      <Center w={'100%'} h={"100vh"}>
        <VStack>
          <Image
            src="/loading_data.gif"
            objectFit="contain"
            alt="Loading data..."
            h={'100%'}
            w={'auto'}
          />
          <Box w="100%" mt={4}>
            <Progress value={progressValue} size="lg" colorScheme="green" hasStripe isAnimated />
          </Box>
          <Text fontSize="18px" color="#A5D6A7">{progressValue}%</Text>
        </VStack>
      </Center>
    );
  }
  return (
    <Box mt={5} w={"100%"} overflowY={"hidden"} overflowX={"hidden"}>
      {isCreateProposalModalOpen ? (
        <CreateProposalModal connectedUserAddress={ethAccount || ""} />
      ) : (
        <Flex gap={1} flexDirection={{ base: "column", md: "row" }}>
          <Box maxW={{ base: "100%", md: "40%" }} h={"100%"}>
            <DaoHeader
              isMobile={false}
              handleCreateProposalButton={handleCreateProposalButton}
              isCreateProposalModalOpen={isCreateProposalModalOpen}
            />
            <DaoTreasure />

            <ProposalListPanel
              proposals={proposals}
              loadingProposals={loadingProposals}
              setMainProposal={setMainProposal}
              mainProposal={mainProposal}
              ethAccount={ethAccount}
            />
          </Box>
          <Box w={"100%"} h={"100%"}>
            <ProposalDetailPanel
              mainProposal={mainProposal}
            />s
          </Box>
        </Flex>
      )}
    </Box>
  );
};

export default DaoPage;
