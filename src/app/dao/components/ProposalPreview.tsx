'use client';
import MarkdownRenderer from "@/components/ReactMarkdown/page";
import { Box } from "@chakra-ui/react";
import React from "react";

interface ProposalPreviewProps {
    value: string;
}

const ProposalPreview: React.FC<ProposalPreviewProps> = ({ value }) => {
    return (
        <Box
            width="100%"
            border="1px solid limegreen"
            overflow={'auto'}
            borderRadius={8}
            p={4}
            h={{ base: '60vh', md: '80vh' }}
        >
            <MarkdownRenderer content={value} />
        </Box>
    );
};

export default ProposalPreview;
