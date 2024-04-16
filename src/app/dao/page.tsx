"use client"
import {
  Avatar,
  Badge,
  Box,
  Button,
  Center,
  Grid,
  GridItem,
  HStack,
  Image,
  Progress,
  Stack,
  Text,
  VStack,
  Flex,
} from "@chakra-ui/react"
import { normalize } from "path"
import React, { useEffect, useState } from "react"
import ReactMarkdown from "react-markdown"
import rehypeRaw from "rehype-raw"
import rehypeSanitize from "rehype-sanitize"
import remarkGfm from "remark-gfm"
import { mainnet } from "viem/chains"
import { useAccount, useEnsAvatar, useEnsName } from "wagmi"
import { MarkdownRenderers } from "../upload/utils/MarkdownRenderers"
import CreateProposalModal from "./utils/components/createProposalModal"
import fetchProposals, { Proposal } from "./utils/fetchProposals"
import { getENSavatar } from "./utils/getENSavatar"
import { getENSnamefromAddress } from "./utils/getENSfromAddress"
import voteOnProposal from "./utils/voteOnProposal"
import ProposalListItem from "./utils/components/proposalListItem"



import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/react"

interface VoteConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
}

const VoteConfirmationModal: React.FC<VoteConfirmationModalProps> = ({ isOpen, onClose, onConfirm }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Confirm Vote</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text>
            Are you sure you want to vote on this proposal? This action cannot
            be undone.
          </Text>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="red" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button variant="ghost" onClick={onConfirm}>
            Confirm
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}


const DaoPage = () => {
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [loadingProposals, setLoadingProposals] = useState(true)
  const [loadingSummaries, setLoadingSummaries] = useState(false)
  const [mainProposal, setMainProposal] = useState<Proposal | null>(null)
  const ethAccount = useAccount()
  const [avatar, setAvatar] = useState<string | null>(null)
  const [connectedUserEnsName, setConnectedUserEnsName] = useState<string | null>(null)
  const [confirmationModalOpen, setConfirmationModalOpen] = useState(false)
  const [ProposerName, setProposerName] = useState<string | null>(null)
  const [isCreateProposalModalOpen, setIsCreateProposalModalOpen] = useState(false)

  const ensProposerName = useEnsName({
    address: (ProposerName || "0x0") as `0x${string}`,
    chainId: mainnet.id,
  })
  const ensProposerAvatar = useEnsAvatar({
    name: normalize(ensProposerName.data || ""),
    chainId: mainnet.id,
  })

  useEffect(() => {
    setMainProposal(proposals[0])
    console.log(proposals)
  }, [proposals])

  const getConnectedUserAvatar = async (address: string) => {
    try {
      const [connectedUserEnsName, ensAvatar] = await Promise.all([
        getENSnamefromAddress(address),
        getENSavatar(address),
      ])

      setConnectedUserEnsName(connectedUserEnsName)
      setAvatar(ensAvatar)

      return ensAvatar
    } catch (error) {
      console.error("Failed to fetch ENS data:", error)
      setConnectedUserEnsName("")
      setAvatar(null)
      return null
    }
  }
  useEffect(() => {
    if (ethAccount.address && ethAccount.address.length > 0) {
      getConnectedUserAvatar(ethAccount.address)
        .then((avatar) => {
          console.log("Avatar loaded:")
        })
        .catch((error) => {
          console.error("Error fetching avatar:", error)
        })
    }
  }, [ethAccount.address])


  useEffect(() => {
    fetchProposals({ setProposals, setLoadingProposals, setLoadingSummaries })
  }, [])
  useEffect(() => {
    console.log(proposals)
  }, [proposals])

  const checkProposalOutcome = (proposal: Proposal) => {
    const totalVotes = proposal.scores.reduce((acc, score) => acc + score, 0)
    const votesFor = proposal.scores[0] // Assuming "FOR" votes are stored in the first index
    const quorumReached = totalVotes >= 400
    const majorityFor = votesFor > totalVotes / 2

    return {
      hasWon: quorumReached && majorityFor,
      quorumReached,
      totalVotes,
    }
  }
  const handleCreateProposalButton = () => {
    setIsCreateProposalModalOpen(!isCreateProposalModalOpen)
  }
  return (
    <Box width={"100%"}>
      <Center>
        <Text fontSize="28px" color="limegreen">
          DAO
        </Text>
      </Center>
      <Box
        bg="black"
        p={4}
        border="0.6px solid white"
        borderRadius="10px"
        width={"100%"}
      >
        <Grid templateColumns="1fr 2fr 1fr" gap={6} alignItems="center">
          <GridItem colSpan={2} display="flex" alignItems="center">
            <HStack spacing={4}>
              <Image alt="Connected User Avatar" boxSize="86px" src={avatar || "/infinitypepe.gif"} />
              <VStack>
                <Text fontSize="16px" color="limegreen">
                  {connectedUserEnsName}
                </Text>
                <Text fontSize="10px" mb={2}>
                  Voting Power: 123 Votes
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
            <Button
              colorScheme="yellow"
              variant="outline"
              onClick={() => handleCreateProposalButton()}
            >
              {isCreateProposalModalOpen ? "Go Back" : "Create Proposal"}
            </Button>
          </GridItem>
        </Grid>
      </Box>
      {isCreateProposalModalOpen ? (
        <CreateProposalModal />
      ) : (
        <HStack align={"flex-start"} mt={2}>
          <Box width={"50%"}>
            <Stack>
              {loadingProposals ? (
                <Center>
                  <Text fontSize="28px" color="limegreen">
                    Loading...
                  </Text>
                </Center>
              ) : (
                proposals.map((proposal, i) => (
                  <ProposalListItem
                    key={i}
                    setMainProposal={setMainProposal}
                    setProposerName={setProposerName}
                    proposal={proposal}
                  />
                ))
              )}
            </Stack>
          </Box>
          <Box
            bg="black"
            p={4}
            border="0.6px solid limegreen"
            borderRadius="none"
            width={"50%"}
            minHeight={"100%"}
          >
            <Box
              bg="black"
              p={4}
              border="0.6px solid limegreen"
              borderRadius="none"
            >

              <Text fontSize={"28px"}> {mainProposal?.title}</Text>
            </Box>
            <Box
              bg="black"
              p={0}
              border="0.6px solid limegreen"
              borderRadius="none"
            >
              <HStack>
                {ensProposerAvatar.data ? (
                  <Image boxSize={"46px"} src={ensProposerAvatar.data} />
                ) : (
                  <Image boxSize={"46px"} src={"/pepenation.gif"} />
                )}

                <Text>
                  {/* {(ProposerName ?? "") ||
                      formatEthAddress(mainProposal?.author)} */}
                  {ensProposerName.data || ProposerName}
                </Text>
              </HStack>
            </Box>
            <Box
              bg="black"
              p={4}
              border="0.6px solid limegreen"
              borderRadius="none"
            >
              <Center>
                <Badge fontSize="28px" color="limegreen">
                  Score
                </Badge>
              </Center>
              <Text fontSize="16px" color="limegreen">
                {mainProposal?.scores[0]} For
              </Text>
              <Progress
                value={mainProposal?.scores[0] ?? 0}
                colorScheme="green"
                size="sm"
              ></Progress>
              <Text fontSize="16px" color="limegreen">
                {mainProposal?.scores[1]} Against
              </Text>
              <Progress
                value={mainProposal?.scores[1] ?? 0}
                colorScheme="red"
                size="sm"
              >
                {mainProposal?.scores[1] ?? 0}
              </Progress>
              {mainProposal?.author && (
                <>

                  <HStack justifyContent="space-between">
                    <Text>
                      Start:{" "}
                      <Badge>
                        {new Date(
                          mainProposal?.start * 1000
                        ).toLocaleDateString()}
                      </Badge>
                    </Text>
                    <Text>
                      End:
                      <Badge>
                        {" "}
                        {new Date(mainProposal.end * 1000).toLocaleDateString()}
                      </Badge>
                    </Text>
                  </HStack>
                </>
              )}
              <br />
              {mainProposal && mainProposal.state !== "active" && (
                <>
                  <HStack justifyContent={"space-between"}>
                    <Text fontSize="14px" color="limegreen">
                      Quorum:{" "}
                      {mainProposal &&
                        checkProposalOutcome(mainProposal).quorumReached
                        ? "Reached"
                        : "Not Reached"}{" "}
                      (
                      {mainProposal &&
                        checkProposalOutcome(mainProposal).totalVotes}{" "}
                      Votes)
                    </Text>
                    <Badge fontSize="18px" color="limegreen">
                      {mainProposal && checkProposalOutcome(mainProposal).hasWon
                        ? "Passed"
                        : "Failed"}
                    </Badge>
                  </HStack>
                </>
              )}
              <Flex
                justifyContent="space-between"
                alignItems="center"
                flexDirection="row"
              >

                {mainProposal && mainProposal.state === "active" && (
                  mainProposal.choices.map((choice, choiceIndex) => (
                    <Button
                      colorScheme={choice.toUpperCase() == "FOR" ? "green" : "red"}
                      variant="outline"
                      key={choiceIndex}
                      onClick={() =>
                        voteOnProposal(ethAccount, mainProposal.id, choiceIndex + 1)
                      }
                    >
                      {choice.toUpperCase()}
                    </Button>
                  ))
                )}
              </Flex>
            </Box>


            <Box
              mt={2}
            >

              <ReactMarkdown
                components={MarkdownRenderers}
                rehypePlugins={[rehypeRaw, rehypeSanitize]}
                remarkPlugins={[remarkGfm]}
              >
                {mainProposal?.body ?? ""}
              </ReactMarkdown>
            </Box>
          </Box>
        </HStack>
      )}
    </Box>
  )
}

export default DaoPage
