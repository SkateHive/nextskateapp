import { Proposal } from "./fetchProposals"

export const checkProposalOutcome = (proposal: Proposal): { hasWon: boolean, quorumReached: boolean, totalVotes: number } => {
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