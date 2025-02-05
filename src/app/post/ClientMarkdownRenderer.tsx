'use client';

import MarkdownRenderer from '@/components/ReactMarkdown/page';
import { MarkdownRenderers } from '@/app/upload/utils/MarkdownRenderers';
import { PINATA_URL } from '@/utils/constants';
import React from 'react';

type ClientMarkdownRendererProps = {
    content: string;
};

const ClientMarkdownRenderer: React.FC<ClientMarkdownRendererProps> = ({ content }) => {
    return (
        <>
            <MarkdownRenderer content={content.replace("ipfs.skatehive.app", PINATA_URL)} />
        </>
    );
};

export default ClientMarkdownRenderer;
