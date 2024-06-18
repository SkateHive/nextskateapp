'use client';
import { MarkdownRenderers } from "@/app/upload/utils/MarkdownRenderers";
import { Box } from "@chakra-ui/react";
import React from "react";
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';

interface ProposalPreviewProps {
    value: string;
}

const ProposalPreview: React.FC<ProposalPreviewProps> = ({ value }) => {
    return (
        <Box
            width="100%"
            height="100%"
            border="1px solid limegreen"
            minHeight="60vh"
        >
            <ReactMarkdown
                components={MarkdownRenderers}
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
            >
                {value}
            </ReactMarkdown>
        </Box>
    );
};

export default ProposalPreview;
