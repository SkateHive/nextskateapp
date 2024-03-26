export interface CommentsProps {
    comments: CommentProps[];
    commentPosted: boolean;
    blockedUser: string;
    permlink: string;
}

export interface CommentProps {
    author: string;
    body: string;
    created: string;
    net_votes: number;
    permlink: string;
    url: string;
    parentId: string; // Add this field to store the parent ID
    id: string; // Add this field to store the unique identifier of the comment
    replies: CommentProps[];
    children?: number;
    repliesFetched?: any[]; // for child comments
    showCommentBox?: boolean;
    limit: number;
    blockedUser: string;
    parent_permlink: string;
    payout: number;
    total_payout_value: number;
    pending_payout_value: number;
    active_votes: any[];
}

export interface PlazaProps {
    URLPermlink?: string;
    URLAuthor?: string;
    compWidth?: string;
}
