import { MarkdownRenderers } from "@/app/upload/utils/MarkdownRenderers";
import { transform3SpeakContent, transformEcencyImages, transformNormalYoutubeLinksinIframes, transformShortYoutubeLinksinIframes } from "@/lib/utils";
import React from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";

interface MarkdownRendererProps {
    content: string;
    className?: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className }) => {
    return (
        <div className={className}>
        <ReactMarkdown
            components={MarkdownRenderers}
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
        >
            {transform3SpeakContent(
                transformEcencyImages(
                    transformNormalYoutubeLinksinIframes(
                        transformShortYoutubeLinksinIframes(content)
                    )
                )
            )}
        </ReactMarkdown>
        </div>
    );
};

export default MarkdownRenderer;
