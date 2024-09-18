import { Web3Provider } from '@ethersproject/providers';
import snapshot from '@snapshot-labs/snapshot.js';

const hub = 'https://hub.snapshot.org';

const client = new snapshot.Client712(hub);


const voteOnProposal = async (ethAccount: any, proposalId: string, choiceId: number, reason: string) => {
    console.log('voteOnProposal', ethAccount, proposalId, choiceId, reason);


    const web3 = new Web3Provider(window.ethereum);
    const [account] = await web3.listAccounts();
    console.log('account', account);
    const receipt = await client.vote(web3, account, {
        space: 'skatehive.eth',
        proposal: proposalId,
        type: 'single-choice',
        choice: choiceId,
        reason: reason,
        app: 'Skatehive App'
    });
    console.log('receipt', receipt);
    if (receipt) {
        alert('Vote submitted!');
    }
};

export default voteOnProposal;