import { Web3Provider } from '@ethersproject/providers';
import snapshot from '@snapshot-labs/snapshot.js';

const hub = 'https://hub.snapshot.org';

const client = new snapshot.Client712(hub);


const voteOnProposal = async (ethAccount: any, proposalId: string, choiceId: number) => {

    if (!ethAccount.isConnected) {
        alert('Please connect your wallet');
        return;
    }
    const web3 = new Web3Provider(window.ethereum);
    const [account] = await web3.listAccounts();
    const receipt = await client.vote(web3, account, {
        space: 'skatehive.eth',
        proposal: proposalId,
        type: 'single-choice',
        choice: choiceId,
        reason: 'I believe this choice makes the most sense.',
        app: 'Skatehive App'
    });
    console.log('Voting receipt:', receipt);
    if (receipt) {
        alert('Vote submitted!');
    }
};

export default voteOnProposal;