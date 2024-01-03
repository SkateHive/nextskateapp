import { PostActiveVotes } from "@/lib/models/post"
import { calculateHumanReadableReputation } from "@/lib/utils"
import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react"

interface PostVotersProps {
  activeVoters: PostActiveVotes[]
  modalIsOpen: boolean
  modalOnOpen: any
  modalOnClose: any
}

export default function PostVoters({
  activeVoters,
  modalIsOpen,
  modalOnOpen,
  modalOnClose,
}: PostVotersProps) {
  const votes = activeVoters.sort((a, b) => b.reputation - a.reputation)
  const bestReputationVoter: string = votes[0].voter
  const qtdVotes = votes.length - 1

  return (
    <Text fontSize={"sm"}>
      {!activeVoters || !activeVoters.length ? (
        "No votes"
      ) : (
        <Text as={"span"} cursor={"pointer"} onClick={modalOnOpen}>
          Voted by <b>{bestReputationVoter}</b>
          {qtdVotes > 0 && (
            <span>
              {" and "}
              <b>{qtdVotes}</b> other{qtdVotes > 1 ? "s" : ""}
            </span>
          )}
        </Text>
      )}
      <PostVotersModal
        votes={activeVoters}
        onClose={modalOnClose}
        isOpen={modalIsOpen}
      />
    </Text>
  )
}

interface PostVotersModalProps {
  votes: PostActiveVotes[]
  onClose: any
  isOpen: any
}

function PostVotersModal({ votes, onClose, isOpen }: PostVotersModalProps) {
  return (
    <Modal
      onClose={onClose}
      isOpen={isOpen}
      isCentered
      scrollBehavior="inside"
      size={{ base: "full", md: "md" }}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Voters</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <TableContainer>
            <Table variant="simple" size={"sm"}>
              <Thead>
                <Tr>
                  <Th>Voter</Th>
                  <Th isNumeric>Reputation</Th>
                  <Th isNumeric>Percent</Th>
                </Tr>
              </Thead>
              <Tbody>
                {votes.map((vote) => (
                  <Tr key={vote.voter}>
                    <Td>{vote.voter}</Td>
                    <Td isNumeric>
                      {calculateHumanReadableReputation(vote.reputation)}
                    </Td>
                    <Td isNumeric>{parseInt(vote.percent) / 100}%</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
