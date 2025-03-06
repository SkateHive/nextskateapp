'use client';

import MarkdownRenderer from '@/components/ReactMarkdown/page';
import React from 'react';

type ClientMarkdownRendererProps = {
    content: string;
};

const ClientMarkdownRenderer: React.FC<ClientMarkdownRendererProps> = ({ content }) => {

    return (
        <>
            <MarkdownRenderer content={content} />
        </>
    );
};

export default ClientMarkdownRenderer;
