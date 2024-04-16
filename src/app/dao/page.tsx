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

const DaoPage = () => {
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [loadingProposals, setLoadingProposals] = useState(true)
  const [loadingSummaries, setLoadingSummaries] = useState(false)
  const [mainProposal, setMainProposal] = useState<Proposal | null>(null)
  const ethAccount = useAccount()
  const [avatar, setAvatar] = useState<string | null>(null)
  const [connectedUserEnsName, setConnectedUserEnsName] = useState<
    string | null
  >(null)
  const [confirmationModalOpen, setConfirmationModalOpen] = useState(false)
  const [ProposerName, setProposerName] = useState<string | null>(null)
  const [proposerAvatar, setProposerAvatar] = useState<string | null>(null)

  const ensProposerName = useEnsName({
    address: (ProposerName || "0x0") as `0x${string}`,
    chainId: mainnet.id,
  })
  const ensProposerAvatar = useEnsAvatar({
    name: normalize(ensProposerName.data || ""),
    chainId: mainnet.id,
  })

  console.log("ens", ProposerName, ensProposerName.data)

  const [isCreateProposalModalOpen, setIsCreateProposalModalOpen] =
    useState(false)

  const result = useEnsName({
    address: "0x41CB654D1F47913ACAB158a8199191D160DAbe4A",
    chainId: mainnet.id,
  })
  //   console.log("ens", { result })

  useEffect(() => {
    setMainProposal(proposals[0])
    console.log(proposals)
  }, [proposals])

  const getConnectedUserAvatar = async (address: string) => {
    try {
      // Fetch ENS name and avatar in parallel
      const [connectedUserEnsName, ensAvatar] = await Promise.all([
        getENSnamefromAddress(address),
        getENSavatar(address),
      ])

      // Update state with fetched data
      setConnectedUserEnsName(connectedUserEnsName)
      setAvatar(ensAvatar)

      return ensAvatar
    } catch (error) {
      console.error("Failed to fetch ENS data:", error)
      // Handle errors or set default values as necessary
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

  const formatEthAddress = (address: string) => {
    // if address is not end with .eth
    if (!address.endsWith(".eth")) {
      return address
    }
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }
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
        border="0.6px solid limegreen"
        borderRadius="none"
        width={"100%"}
      >
        <Grid templateColumns="1fr 2fr 1fr" gap={6} alignItems="center">
          <GridItem colSpan={2} display="flex" alignItems="center">
            <HStack spacing={4}>
              <Image boxSize="86px" src={avatar || "/infinitypepe.gif"} />
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
              colorScheme="green"
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
            </Box>

            <Text fontSize="24px" color="limegreen">
              Proposer
            </Text>
            {mainProposal?.author && (
              <>
                <VStack>
                  {ensProposerAvatar.data ? (
                    <Image boxSize={"86px"} src={ensProposerAvatar.data} />
                  ) : (
                    <Image boxSize={"86px"} src={"/pepenation.gif"} />
                  )}

                  <Text>
                    {/* {(ProposerName ?? "") ||
                      formatEthAddress(mainProposal?.author)} */}
                    {ensProposerName.data || ProposerName}
                  </Text>
                </VStack>
                <Text fontSize={"28px"}> {mainProposal?.title}</Text>
                <VStack justifyContent="flex-start">
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
                </VStack>
              </>
            )}

            <ReactMarkdown
              components={MarkdownRenderers}
              rehypePlugins={[rehypeRaw, rehypeSanitize]}
              remarkPlugins={[remarkGfm]}
            >
              {mainProposal?.body ?? ""}
            </ReactMarkdown>
          </Box>
        </HStack>
      )}
    </Box>
  )
}

interface ProposerAvatarProps {
  authorAddress: string
}

const ProposerAvatar: React.FC<ProposerAvatarProps> = ({ authorAddress }) => {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  useEffect(() => {
    const loadAvatar = async () => {
      try {
        const url = await getENSavatar(authorAddress)
        setAvatarUrl(url || "/infinitypepe.gif") // Ensure fallback to a default avatar if none is found
      } catch (error) {
        console.error(
          "Failed to fetch avatar for address:",
          authorAddress,
          error
        )
        setAvatarUrl("infinitypepe.gif") // Use default avatar on error
      }
    }

    if (authorAddress) {
      loadAvatar()
    }
  }, [authorAddress])

  return (
    <Avatar
      borderRadius={5}
      boxSize={"22px"}
      src={avatarUrl || "/infinitypepe.gif"}
      name={authorAddress}
    />
  )
}

function ProposalListItem({
  proposal,
  setMainProposal,
  setProposerName,
}: {
  proposal: Proposal
  setMainProposal: (proposal: Proposal) => void
  setProposerName: (author: string) => void
}) {
  const handleSelectProposal = (proposal: Proposal) => {
    setMainProposal(proposal)
    setProposerName(proposal.author)
  }
  const result = useEnsName({
    address: proposal.author as `0x${string}`,
    chainId: mainnet.id,
  })
  const resultAvatar = useEnsAvatar({
    name: normalize(result.data || ""),
    chainId: mainnet.id,
  })
  const ethAccount = useAccount()
  // console.log("ens", result.data)
  // console.log("avatar", resultAvatar)
  return (
    <Box
      cursor={"pointer"}
      onClick={() => handleSelectProposal(proposal)}
      key={proposal.id}
      bg="black"
      p={4}
      border="0.6px solid limegreen"
      borderRadius="none"
    >
      <HStack justifyContent={"flex-start"}>
        <Text>{proposal.title}</Text>
        <Badge> {proposal.state} </Badge>
      </HStack>
      <HStack ml={2}>
        <Center>
          <ProposerAvatar authorAddress={proposal.author} />
          <Text ml={2}> {result.data || proposal.author}</Text>
        </Center>
      </HStack>

      <Text
        border={"0.6px solid darkgrey"}
        p={2}
        mt={2}
        mb={2}
        borderRadius={5}
        fontSize={"12px"}
      >
        Summary: {decodeURIComponent(proposal.summary ?? "")}
      </Text>
      {proposal.choices.map((choice, choiceIndex) => (
        <Button
          colorScheme={choice.toUpperCase() == "FOR" ? "green" : "red"}
          variant="outline"
          key={choiceIndex}
          onClick={() =>
            voteOnProposal(ethAccount, proposal.id, choiceIndex + 1)
          }
        >
          {choice.toUpperCase()}
        </Button>
      ))}
    </Box>
  )
}

export default DaoPage
