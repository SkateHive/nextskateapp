"use client"
import {
  Badge,
  Box,
  Button,
  Center,
  Flex,
  Grid,
  GridItem,
  HStack,
  Image,
  Progress,
  Stack,
  Text,
  VStack
} from "@chakra-ui/react"
import { normalize } from "path"
import { useEffect, useState } from "react"
import ReactMarkdown from "react-markdown"
import rehypeRaw from "rehype-raw"
import remarkGfm from "remark-gfm"
import { mainnet } from "viem/chains"
import { useAccount, useEnsAvatar, useEnsName } from "wagmi"
import { MarkdownRenderers } from "../upload/utils/MarkdownRenderers"
import CreateProposalModal from "./components/createProposalModal"
import DaoTreasure from "./components/daoTreasure"
import ProposalListItem from "./components/proposalListItem"
import VoteConfirmationModal from "./components/voteWithReasonModal"
import { checkProposalOutcome } from "./utils/checkProposalOutcome"
import fetchProposals, { Proposal } from "./utils/fetchProposals"
import { getENSavatar } from "./utils/getENSavatar"
import { getENSnamefromAddress } from "./utils/getENSfromAddress"
import voteOnProposal from "./utils/voteOnProposal"

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
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [reason, setReason] = useState<string>("");
  const [formattedAddress, setFormattedAddress] = useState<string>("")

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

      const formattedAddress = ethAccount.address.toString()
      setFormattedAddress(formattedAddress)
      getConnectedUserAvatar(ethAccount.address)
        .catch((error) => {
          console.error("Error fetching avatar:", error)
        })
    }
  }, [ethAccount.address])


  useEffect(() => {
    fetchProposals({ setProposals, setLoadingProposals, setLoadingSummaries })
  }, [])


  const handleCreateProposalButton = () => {
    setIsCreateProposalModalOpen(!isCreateProposalModalOpen)
  }

  const extractPermlink = (proposal: Proposal) => {
    if (proposal) {

      const body = proposal.body
      const permlink = body.split(" ")[body.split(" ").length - 1]
    }
  }
  return (
    <Box width={"100%"}>
      <br />
      <Box
        bg="black"
        p={4}
        border="1px solid grey"
        borderTopRadius="10px"
        width={"100%"}
      >
        <Grid templateColumns="1fr 2fr 1fr" gap={6} alignItems="center">
          <GridItem colSpan={2} display="flex" alignItems="center">
            <HStack spacing={4}>
              <Image alt="Connected User Avatar" boxSize="86px" src={avatar || "/infinitypepe.gif"} />
              <VStack>
                <Text fontSize="16px" color="#A5D6A7">
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
      <DaoTreasure />

      {isCreateProposalModalOpen ? (
        <CreateProposalModal connectedUserAddress={formattedAddress} />

      ) : (
        <Flex flexDirection={{ base: 'column', md: 'row' }} >
          <Box minW={"50%"}>
            <Stack>
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
                  />
                ))
              )}
            </Stack>
          </Box>
          <Box
            p={4}
            bg={"#201d21"}
            borderRadius="10px"
            minW={"50%"}
            minHeight={"100%"}
          >
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
            <Box
              bg="#201d21"
              p={4}
              border="0.6px solid #A5D6A7"
              borderRadius="none"
            >

              <Text fontSize={"28px"}> {mainProposal?.title}</Text>
            </Box>
            <Box
              bg="#201d21"
              p={0}
              border="0.6px solid #A5D6A7"
              borderRadius="none"
            >
              <HStack>
                {ensProposerAvatar.data ? (
                  <Image alt="" boxSize={"46px"} src={ensProposerAvatar.data} />
                ) : (
                  <Image alt="" boxSize={"46px"} src={"/pepenation.gif"} />
                )}

                <Text>
                  {/* {(ProposerName ?? "") ||
                      formatEthAddress(mainProposal?.author)} */}
                  {ensProposerName.data || ProposerName}
                </Text>
              </HStack>
            </Box>
            <Box
              bg="#201d21"
              p={4}
              border="0.6px solid #A5D6A7"
              borderRadius="none"
            >
              <Center>
                <Badge fontSize="28px" color="#A5D6A7">
                  Score
                </Badge>
              </Center>
              <Text fontSize="16px" color="#A5D6A7">
                {mainProposal?.scores[0]} For
              </Text>
              <Progress
                value={mainProposal?.scores[0] ?? 0}
                colorScheme="green"
                size="sm"
              ></Progress>
              <Text fontSize="16px" color="#A5D6A7">
                {mainProposal?.scores[1]} Against
              </Text>
              <Progress
                value={mainProposal?.scores[1] ?? 0}
                colorScheme="red"
                size="sm"
              >
                {mainProposal?.scores[1] ?? 0}
              </Progress>

              <br />
              {mainProposal && mainProposal.state !== "active" && (
                <>
                  <HStack justifyContent={"space-between"}>
                    <Text fontSize="14px" color="#A5D6A7">
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
                    <Badge fontSize="18px" color="#A5D6A7">
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
                      colorScheme={choice.toUpperCase() === "FOR" ? "green" : "red"}
                      variant="outline"
                      key={choiceIndex}
                      onClick={() => {
                        setSelectedChoice(choiceIndex);
                        setConfirmationModalOpen(true);
                      }}
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
                rehypePlugins={[rehypeRaw]}
                remarkPlugins={[remarkGfm]}
              >
                {mainProposal?.body ?? ""}
              </ReactMarkdown>
            </Box>
          </Box>
        </Flex>
      )}
      {confirmationModalOpen && mainProposal && (
        <VoteConfirmationModal
          isOpen={confirmationModalOpen}
          onClose={() => setConfirmationModalOpen(false)}
          choice={mainProposal.choices[selectedChoice ?? 0]}
          onConfirm={(reason: string) => {
            if (selectedChoice !== null) {
              voteOnProposal(ethAccount, mainProposal.id, selectedChoice + 1, reason);
              setConfirmationModalOpen(false);
            }
          }}
          setReason={setReason}
          reason={reason}
        />
      )}

    </Box>
  )
}

export default DaoPage
