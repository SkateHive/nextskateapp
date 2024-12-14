export interface Comment {
    id: string;
    author: string;
    body: string;
    children: number;
    net_votes: number;

}

export interface Cast {
    id: string;
    name: string;
    username: string;
    avatar: string;
    content: string;
    image?: string;
    comments: Comment[];
    likes: number;
    recasts: number;
}

export interface SkateCastProps {
    casts?: Cast[];
}

export interface TokenInfo {
    address: `0x${string}`;
    abi: any[];
    tokenLogo?: string;
}