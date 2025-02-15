'use client';

import MarkdownRenderer from '@/components/ReactMarkdown/page';
import { PINATA_URL } from '@/utils/constants';
import React from 'react';

type ClientMarkdownRendererProps = {
    content: string;
};

const ClientMarkdownRenderer: React.FC<ClientMarkdownRendererProps> = ({ content }) => {
    const transformedContent = content.replace("ipfs.skatehive.app", PINATA_URL);

    return (
      <div style={{ fontSize: '16px', lineHeight: '1.6', color: 'white' }}>
            <MarkdownRenderer content={transformedContent} />
      </div>
  );
};

export default ClientMarkdownRenderer;
