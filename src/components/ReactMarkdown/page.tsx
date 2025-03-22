import React from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import { MarkdownRenderers } from "@/app/upload/utils/MarkdownRenderers";
import { transform3SpeakContent, transformEcencyImages, transformNormalYoutubeLinksinIframes, transformShortYoutubeLinksinIframes } from "@/lib/utils";

/**
 * Function to convert <center>![](image_url)</center> into a custom Markdown syntax
 */
const preprocessMarkdown = (content: string) => {
    return content.replace(/<center>\s*!?\[(.*?)\]\((.*?)\)\s*<\/center>/gi, (_, alt, src) => {
        return `\n![${alt}](${src})\n`;
    });
};

interface MarkdownRendererProps {
    key?: number | string;
    content: string;
    className?: string;
    renderers?: any;
    useDecryptedText?: boolean; // Add new prop
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
    key,
    content,
    className,
    renderers = MarkdownRenderers,
    useDecryptedText = false // Default to false
}) => {
    const transformedContent = React.useMemo(() => {
        let preprocessedContent = preprocessMarkdown(content);

        const transformed = transform3SpeakContent(
            transformEcencyImages(
                transformNormalYoutubeLinksinIframes(
                    transformShortYoutubeLinksinIframes(preprocessedContent)
                )
            )
        );
        return transformed;
    }, [content]);

    return (
        <div className={className}>
            <ReactMarkdown
                key={key ? key : "markdown-renderer"}
                components={renderers(useDecryptedText)} // Ensure MarkdownRenderers is passed here
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
            >
                {transformedContent}
            </ReactMarkdown>
        </div>
    );
};

export default MarkdownRenderer;
