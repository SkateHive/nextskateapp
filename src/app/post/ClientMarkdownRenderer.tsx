'use client';

import MarkdownRenderer from '@/components/ReactMarkdown/page';
import { PINATA_URL } from '@/utils/config';
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
