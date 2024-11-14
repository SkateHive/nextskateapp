'use client';

import { MarkdownRenderers } from '@/app/upload/utils/MarkdownRenderers';
import { PINATA_URL } from '@/utils/config';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';

type ClientMarkdownRendererProps = {
    content: string;
};

const ClientMarkdownRenderer: React.FC<ClientMarkdownRendererProps> = ({ content }) => {
    return (
        <ReactMarkdown
            components={MarkdownRenderers}
            rehypePlugins={[rehypeRaw]}
            remarkPlugins={[remarkGfm]}
        >
            {content.replace("ipfs.skatehive.app", PINATA_URL)}
            </ReactMarkdown>
    );
};

export default ClientMarkdownRenderer;
