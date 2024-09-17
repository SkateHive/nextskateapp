"use client";
import { Box, Flex } from "@chakra-ui/react";
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

  useEffect(() => {
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

  const handleCreateProposalButton = () => {
    setIsCreateProposalModalOpen(!isCreateProposalModalOpen);
  };

  return (
    <Box mt={5} h={"100%"} w={"100%"} overflowY={"hidden"} overflowX={"hidden"}>

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
