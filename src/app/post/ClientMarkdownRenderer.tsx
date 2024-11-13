'use client';

import { MarkdownRenderers } from '@/app/upload/utils/MarkdownRenderers';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';

type ClientMarkdownRendererProps = {
    content: string;
};
const pinata_url = process.env.NEXT_PUBLIC_PINATA_URL || "";

const ClientMarkdownRenderer: React.FC<ClientMarkdownRendererProps> = ({ content }) => {
    return (
        <ReactMarkdown
            components={MarkdownRenderers}
            rehypePlugins={[rehypeRaw]}
            remarkPlugins={[remarkGfm]}
        >
            {content.replace("ipfs.skatehive.app", pinata_url)}
            </ReactMarkdown>
    );
};

export default ClientMarkdownRenderer;
