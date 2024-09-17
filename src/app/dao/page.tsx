"use client";
import { Box, Flex, Center, Image, Text, VStack } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import CreateProposalModal from "./components/createProposalModal";
import DaoTreasure from "./components/daoTreasure";
import DaoHeader from "./components/daoHeader";
import ProposalListPanel from "./components/ProposalListPanel";
import ProposalDetailPanel from "./components/ProposalDetailPanel";
import fetchProposals, { Proposal } from "./utils/fetchProposals";
import voteOnProposal from "./utils/voteOnProposal";

const DaoPage = () => {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loadingProposals, setLoadingProposals] = useState(true);
  const [loadingSummaries, setLoadingSummaries] = useState(false); // New state for summaries
  const [mainProposal, setMainProposal] = useState<Proposal | null>(null);
  const { address: ethAccount } = useAccount();
  const [isCreateProposalModalOpen, setIsCreateProposalModalOpen] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [reason, setReason] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true); // New state for loading everything

  useEffect(() => {
    // Fetch proposals and summaries
    fetchProposals({
      setProposals,
      setLoadingProposals,
      setLoadingSummaries, // Pass setLoadingSummaries here
    });
  }, []);

  useEffect(() => {
    if (proposals.length > 0) {
      setMainProposal(proposals[0]);
    }
  }, [proposals]);

  // Set the loading state based on proposals and summaries loading status
  useEffect(() => {
    if (!loadingProposals && !loadingSummaries) {
      setIsLoading(false);
    }
  }, [loadingProposals, loadingSummaries]);

  const handleCreateProposalButton = () => {
    setIsCreateProposalModalOpen(!isCreateProposalModalOpen);
  };

  // Render the loading image while the data is being fetched
  if (isLoading) {
    return (
      <Center w={'100%'} h={"100vh"}>
        <VStack>
          <Image
            src="https://cdn.dribbble.com/users/921277/screenshots/13742833/media/98615054c34087c21144640c23c4d9fa.gif"
            objectFit="contain"
            alt="Loading data..."
            h={'100%'}
          />
          <Text fontSize="28px" color="#A5D6A7">
            Loading Proposals...
          </Text>
        </VStack>
      </Center>
    );
  }

  return (
    <Box mt={5} h={"100vh"} w={"100%"} overflowY={"hidden"} overflowX={"hidden"}>
      {isCreateProposalModalOpen ? (
        <CreateProposalModal connectedUserAddress={ethAccount || ""} />
      ) : (
        <Flex gap={1} flexDirection={{ base: "column", md: "row" }}>
          <Box maxW={{ base: "100%", md: "40%" }} h={"100%"}>
            <DaoHeader
              avatar={null}
              connectedUserEnsName={null}
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
            />
          </Box>
          <Box w={"100%"} h={"100%"}>
            <ProposalDetailPanel
              mainProposal={mainProposal}
              selectedChoice={selectedChoice}
              reason={reason}
              setReason={setReason}
              ethAccount={ethAccount ?? null} // Use null if ethAccount is undefined
              voteOnProposal={voteOnProposal}
            />
          </Box>
        </Flex>
      )}
    </Box>
  );
};

export default DaoPage;
