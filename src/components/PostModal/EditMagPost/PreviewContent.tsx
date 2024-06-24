import { MarkdownRenderers } from '@/app/upload/utils/MarkdownRenderers';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';

interface PreviewContentProps {
    content: string;
}

const PreviewContent: React.FC<PreviewContentProps> = ({ content }) => {
    return (
        <ReactMarkdown
            rehypePlugins={[rehypeRaw]}
            remarkPlugins={[remarkGfm]}
            components={MarkdownRenderers}
        >
            {content}
        </ReactMarkdown>
    );
};

export default PreviewContent;