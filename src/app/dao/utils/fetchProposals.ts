import getSummary from "@/lib/getSummaryAI";
import { proposalsQuery } from "./queries";

export interface Proposal {
    id: string;
    author: string;
    title: string;
    body: string;
    choices: string[];
    start: number;
    created: number;
    scores: number[];
    scores_total: number;
    scores_updated: number;
    end: number;
    snapshot: number;
    state: string;
    summary?: string;
}

interface FetchProposalsParams {
    setProposals: (proposals: Proposal[]) => void;
    setLoadingProposals: (loading: boolean) => void;
    setLoadingSummaries: (loading: boolean) => void;
}

const fetchProposals = async ({
    setProposals,
    setLoadingProposals,
    setLoadingSummaries
}: FetchProposalsParams): Promise<void> => {
    try {
        const response = await fetch('https://hub.snapshot.org/graphql', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: proposalsQuery }),
        });
        if (response.ok) {
            const data = await response.json();
            if (data.errors) {
                console.error('GraphQL Proposals Error:', data.errors);
                return;
            }
            const fetchedProposals = data.data.proposals;
            setProposals(fetchedProposals);
            setLoadingProposals(false);
            setLoadingSummaries(true);
            for (let proposal of fetchedProposals) {
                proposal.summary = await getSummary(proposal.body);
            }
            setLoadingSummaries(false);
            localStorage.setItem('proposals', JSON.stringify(fetchedProposals));
        } else {
            console.error('Error fetching proposals:', await response.text());
        }
    } catch (error) {
        console.error('Error fetching proposals:', error);
        setLoadingProposals(false);
    }
};

export default fetchProposals;
