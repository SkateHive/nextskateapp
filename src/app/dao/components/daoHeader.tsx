// src/app/dao/components/DaoHeader.tsx

import { Box, Grid, GridItem, HStack, Image, Text, VStack, Button } from "@chakra-ui/react";
import { FaPencil } from "react-icons/fa6";

interface DaoHeaderProps {
    avatar: string | null;
    connectedUserEnsName: string | null;
    isMobile: boolean;
    handleCreateProposalButton: () => void;
    isCreateProposalModalOpen: boolean;
}

const DaoHeader: React.FC<DaoHeaderProps> = ({
    avatar,
    connectedUserEnsName,
    isMobile,
    handleCreateProposalButton,
    isCreateProposalModalOpen,
}) => {
    console.log(connectedUserEnsName);
    return (
        <Box
            bg="black"
            border="1px solid grey"
            borderTopRadius="10px"
        >
            <Grid templateColumns="1fr 2fr 1fr" gap={6} alignItems="center">
                <GridItem colSpan={2} display="flex" alignItems="center">
                    <HStack spacing={4}>
                        <Image alt="Connected User Avatar" borderRadius={'5px'} boxSize="86px" src={avatar || "/infinitypepe.gif"} />
                        <VStack>
                            <Text fontSize="16px" color="#A5D6A7">
                                {connectedUserEnsName}
                            </Text>
                            <Text color={"white"} fontSize="10px" mb={2}>
                                Voting Power: Loading...
                            </Text>
                        </VStack>
                    </HStack>
                </GridItem>
                <GridItem
                    colSpan={1}
                    display="flex"
                    flexDirection="column"
                    alignItems="flex-end"
                >
                    {isMobile ? (
                        <Button
                            bg={"black"}
                            leftIcon={<FaPencil />}
                            p={2}
                            color={"yellow"}
                            borderRadius="full"
                            variant="outline"
                            onClick={() => handleCreateProposalButton()}
                            _hover={{ color: 'black', backgroundColor: 'yellow' }}
                            mr={1}
                        >
                            {isCreateProposalModalOpen ? "Go Back" : "create"}
                        </Button>
                    ) : (
                        <Button
                            color={"yellow"}
                            mr={1}
                            variant="outline"
                            onClick={() => handleCreateProposalButton()}
                            _hover={{ color: 'black', backgroundColor: 'yellow' }}
                        >
                            {isCreateProposalModalOpen ? "Go Back" : "Create Proposal"}
                        </Button>
                    )}
                </GridItem>
            </Grid>
        </Box>
    );
};

export default DaoHeader;
