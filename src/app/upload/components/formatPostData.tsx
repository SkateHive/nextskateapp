import { CommentOperation, CommentOptionsOperation } from '@hiveio/dhive';

export const formatBeneficiaries = (beneficiariesArray: any[]) => {
    let seen = new Set();
    return beneficiariesArray.filter(({ account }: { account: string }) => {
        const duplicate = seen.has(account);
        seen.add(account);
        return !duplicate;
    }).map(beneficiary => ({
        account: beneficiary.account,
        weight: parseInt(beneficiary.weight, 10) // Ensure weight is an integer
    })).sort((a, b) => a.account.localeCompare(b.account));
};

export const createCommentOptions = (user: any, permlink: string, finalBeneficiaries: any[]): CommentOptionsOperation => [
    'comment_options',
    {
        author: user.name,
        permlink: permlink,
        max_accepted_payout: '10000.000 HBD',
        percent_hbd: 10000,
        allow_votes: true,
        allow_curation_rewards: true,
        extensions: [
            [0, {
                beneficiaries: finalBeneficiaries
            }]
        ]
    }
];

export const createPostOperation = (user: any, permlink: string, title: string, body: string, tags: string[], thumbnailUrl: string): CommentOperation => [
    'comment',
    {
        parent_author: '',
        parent_permlink: 'hive-173115',
        author: user.name,
        permlink: permlink,
        title: title,
        body: body,
        json_metadata: JSON.stringify({
            tags: tags,
            app: 'Skatehive App',
            image: thumbnailUrl,
        }),
    },
];
