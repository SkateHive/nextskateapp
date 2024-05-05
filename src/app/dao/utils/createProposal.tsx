import { Web3Provider } from '@ethersproject/providers';
import snapshot from '@snapshot-labs/snapshot.js';

export declare type ProposalType = 'single-choice' | 'approval' | 'quadratic' | 'ranked-choice' | 'weighted' | 'basic';

export interface ProposalData {
    from?: string;
    space: string;
    timestamp?: number;
    type: ProposalType;
    title: string;
    body: string;
    discussion: string;
    choices: string[];
    start: number;
    end: number;
    snapshot: number;
    plugins: string;
    app?: string;
}

const hub = 'https://hub.snapshot.org';
const client = new snapshot.Client712(hub);

export async function createProposal(web3: Web3Provider, proposalData: ProposalData) {
    try {
        const [account] = await web3.listAccounts();
        if (!account) {
            throw new Error("No accounts available.");
        }

        console.log("Submitting proposal with data:", JSON.stringify(proposalData, null, 2));

        const receipt = await client.proposal(web3, account, proposalData);
        console.log('Proposal receipt:', receipt);
        alert('Proposal submitted successfully!');
        return receipt; // Return receipt or any relevant data
    } catch (error: any) {
        console.error("Failed to create proposal:", error);
        alert("Error creating proposal: " + error.message);
        throw error; // Rethrow to handle it in the calling component if necessary
    }
}
