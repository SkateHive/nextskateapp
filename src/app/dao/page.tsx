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
import { FaPencil } from "react-icons/fa6"
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

  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    if (window) {
      const isMobile = window.innerWidth < 768
      setIsMobile(isMobile)
    }
  }, [])

  return (
    <Box mt={5}
      h={"100vh"}
      w={"100%"}
      overflowY={"hidden"}
      overflowX={"hidden"}
    >

      {/* HEADER PANEL */}
      <Box
        bg="black"
        border="1px solid grey"
        borderTopRadius="10px"
        width={"100%"}
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
              <Button color={"yellow"} mr={1}
                variant="outline" onClick={() => handleCreateProposalButton()} _hover={{ color: 'black', backgroundColor: 'yellow' }}>
                {isCreateProposalModalOpen ? "Go Back" : "Create Proposal"}
              </Button>
            )}
          </GridItem>
        </Grid>
      </Box>
      <DaoTreasure />

      {isCreateProposalModalOpen ? (
        <CreateProposalModal connectedUserAddress={formattedAddress} />

      ) : (
        <Flex gap={1} flexDirection={{ base: 'column', md: 'row' }} >
          <Box mt={2} minW={"50%"}>
            <Stack
              h={"65vh"}
              overflow={"auto"}
              sx={{
                "&::-webkit-scrollbar": {
                  display: "none",
                },
              }}>
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
            h={"65vh"}
            mt={2}
            overflow={"auto"}
            sx={{
              "&::-webkit-scrollbar": {
                width: "8px",
              },
              "&::-webkit-scrollbar-track": {
                width: "6px",
              },
              "&::-webkit-scrollbar-thumb": {
                background: "#A5D6A7",
                borderRadius: "24px",
              },
            }}

          >
            {mainProposal?.author && (
              <>
                <HStack justifyContent="space-between">
                  <Text color={"white"}>
                    Start:{" "}
                    <Badge bg={"black"} colorScheme="green" >
                      {new Date(
                        mainProposal?.start * 1000
                      ).toLocaleDateString()}
                    </Badge>
                  </Text>
                  <Text color={"white"}>
                    End:
                    <Badge bg={"black"} colorScheme="green" >
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
              color={"green.200"}
            >

              <Text fontSize={"18px"}> {mainProposal?.title}</Text>
            </Box>
            {/* <Box
              bg="#201d21"
              p={0}
              border="0.6px solid #A5D6A7"
              borderBottom={"none"}
              borderRadius="none"
            > */}
            {/* <HStack>
                {ensProposerAvatar.data ? (
                  <Image alt="" boxSize={"46px"} src={ensProposerAvatar.data} />
                ) : (
                  <Image alt="" boxSize={"46px"} src={"/pepenation.gif"} />
                )}

                <Text color={"white"}>
                  {(ProposerName ?? "") ||
                    (mainProposal?.author)}
                </Text>
              </HStack> */}
            {/* </Box> */}
            <Box
              bg="#201d21"
              p={4}
              border="0.6px solid #A5D6A7"
              borderRadius="none"
              borderTop={"none"}
            >
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
                    <Badge variant={"outline"} bg={"black"} fontSize="12px" color={checkProposalOutcome(mainProposal).hasWon ? "green.200" : "red"}>
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
              h={"100%"}

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
