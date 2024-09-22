import { Box, Stack, Center, Text } from "@chakra-ui/react";
import ProposalListItem from "./proposalListItem";
import { Proposal } from "../utils/fetchProposals";

interface ProposalListPanelProps {
    proposals: Proposal[];
    loadingProposals: boolean;
    setMainProposal: (proposal: Proposal) => void;
    mainProposal: Proposal | null;
}

const ProposalListPanel = ({ proposals, loadingProposals, setMainProposal, mainProposal }: ProposalListPanelProps) => {
    return (
        <Box mt={2} h={'85vh'}>
            <Stack
                overflow={"auto"}
                sx={{
                    "&::-webkit-scrollbar": {
                        display: "none",
                    },
                }}
            >
                {loadingProposals ? (
                    <Center>
                        <Text fontSize="28px" color="#A5D6A7">
                            Loading...
                        </Text>
                    </Center>
                ) : (
                    proposals.map((proposal, i) => (
                        <ProposalListItem
                            key={i}
                            proposal={proposal}
                            isSelected={proposal === mainProposal}
                            onSelect={() => setMainProposal(proposal)}
                            setSelectedChoice={() => { }}
                        />
                    ))
                )}
            </Stack>
        </Box>
    );
};

export default ProposalListPanel;
