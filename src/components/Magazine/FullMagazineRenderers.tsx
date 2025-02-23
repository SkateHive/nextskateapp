import React from 'react';
import VideoRenderer from '@/app/upload/utils/VideoRenderer';
import { Divider, Image } from '@chakra-ui/react';

type MarkdownProps = {
    node?: any;
    alt?: any;
    src?: any;
    title?: any;
};

type RendererProps = MarkdownProps & {
    children?: React.ReactNode;
    ordered?: any;
    href?: any;
};


export const FullMagazineRenderers = {
    img: ({ alt, src, title, ...props }: RendererProps) => (
        <span style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Image
                {...props}
                alt={alt}
                src={src}
                title={title}
                width="100%"
                height="auto"
                loading="lazy"
                style={{
                    display: 'inline-block',
                    maxWidth: '100%',
                    marginTop: '20px',
                    marginBottom: '20px',
                }}
            />
        </span>
    ),

    p: ({ children, ...props }: RendererProps) => (
        <div {...props} style={{ color: 'white', fontSize: '16px', paddingBottom: '5px' }}>
            {children}
        </div>
    ),
    a: ({ href, children, ...props }: RendererProps) => (
        <a style={{ color: "yellow", textWrap: "wrap", wordBreak: "break-all" }} href={href} {...props}>{children}</a>
    ),
    h1: ({ children, ...props }: RendererProps) => (
        <h1 {...props} style={{ fontWeight: 'bold', color: '#A5D6A7', fontSize: '22px', paddingBottom: '8px', paddingTop: "8px", paddingLeft: '4px' }}>🛹 {children}</h1>
    ),
    h3: ({ children, ...props }: RendererProps) => (
        <h3 {...props} style={{ fontWeight: 'bold', color: '#A5D6A7', fontSize: '20px', paddingBottom: '4px', paddingTop: "4px", paddingLeft: '4px' }}>🛹 {children}</h3>
    ),
    h2: ({ children, ...props }: RendererProps) => (
        <h2 {...props} style={{ fontWeight: 'bold', color: '#A5D6A7', fontSize: '18px', paddingBottom: '2px', paddingTop: "2px", paddingLeft: '4px' }}>🛹 {children}</h2>
    ),
    h4: ({ children, ...props }: RendererProps) => (
        <h4 {...props} style={{ fontWeight: 'bold', color: '#A5D6A7', fontSize: '16px', paddingBottom: '1px', paddingTop: "1px", paddingLeft: '4px' }}>🛹 {children}</h4>
    ),
    em: ({ children, ...props }: RendererProps) => (
        <em {...props} style={{ color: '#A5D6A7' }}>{children}</em>
    ),
    blockquote: ({ children, ...props }: RendererProps) => (
        <div
            style={{
                backgroundColor: '#004d1a',
                padding: '10px',
                borderLeft: '4px solid  #A5D6A7',
                margin: '10px',
                borderRadius: '8px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)',
                fontStyle: 'italic',
                fontWeight: 'bold',
                fontSize: '14px',
                lineHeight: '1',
            }}
        >
            {children}
        </div>
    ),
    ol: ({ ordered, children, ...props }: RendererProps) => {
        const listType = ordered ? "1" : "decimal";
        return <ol {...props} style={{ listStyleType: listType, paddingLeft: '10%' }}>{children}</ol>;
    },
    ul: ({ ordered, children, ...props }: RendererProps) => {
        const listType = ordered ? "1" : "decimal";
        return <ul {...props} data-ordered={listType} style={{ padding: '5%', paddingLeft: '10%', color: 'white' }}>{children}</ul>;
    },
    li: ({ children, ...props }: RendererProps) => (
        <li {...props} style={{ paddingBottom: '5px', color: '#A5D6A7' }}>{children}</li>
    ),
    sub: ({ children, ...props }: RendererProps) => (
        <sub {...props} style={{ color: 'gray' }}>{children}</sub>
    ),
    hr: ({ children, ...props }: RendererProps) => (
        <Divider {...props} variant={'dashed'} style={{ paddingBottom: '20px', color: 'limegreen', marginBottom: '5px' }}>{children}</Divider>
    ),
    br: ({ children, ...props }: RendererProps) => (
        <br {...props} style={{ paddingBottom: '20px' }}>{children}</br>
    ),
    pre: ({ children, ...props }: RendererProps) => (
        <div
            style={{
                backgroundColor: '#1E1E1E',
                padding: '16px',
                borderRadius: '8px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)',
                overflowX: 'auto',
            }}
        >
            <center>
                <code
                    {...props}
                    style={{
                        color: 'red',
                        fontFamily: 'monospace',
                        fontSize: '14px',
                        lineHeight: '1.5',
                    }}
                >
                    {children}
                </code>
            </center>
        </div>
    ),
    sup: ({ children, ...props }: RendererProps) => (
        <sup {...props} style={{ color: 'lightgray', fontSize: '14px' }}>{children}</sup>
    ),
    iframe: ({ src, ...props }: RendererProps) => {
        const zoraRegex = /https:\/\/zora\.co\/.*/;
        const threeSpeakRegex = /https:\/\/3speak\.tv\/.*/;
        const youtubeRegex = /https:\/\/(www\.)?youtube\.com\/.*/;

        if (zoraRegex.test(String(src)) || threeSpeakRegex.test(String(src)) || youtubeRegex.test(String(src))) {
            return (
                <center>
                    <iframe
                        {...props}
                        src={src}
                        style={{ marginBottom: '10px', maxWidth: '100%', minWidth: '100%', aspectRatio: '16/9', height: '100%', border: '2px grey solid' }}
                    />
                </center>
            );
        } else {
            return <VideoRenderer src={src} {...props} />;
        }
    },
    video: VideoRenderer, // Use the imported VideoRenderer
    table: ({ children, ...props }: RendererProps) => (
        <div style={{
            display: 'flex', justifyContent: 'center',
            border: '1px solid none',
            borderRadius: '10px',
            padding: '10px',
            overflowX: 'auto',
        }}>
            <table
                {...props}
                style={{
                    border: '1px solid transparent',
                    borderCollapse: 'collapse',
                    margin: '0 auto',
                    width: '100%',
                    maxWidth: '100%',
                }}
            >
                {children}
            </table>
        </div>
    ),
    tbody: ({ children, ...props }: RendererProps) => (
        <tbody {...props}>{children}</tbody>
    ),
    tr: ({ children, ...props }: RendererProps) => (
        <tr {...props}>{children}</tr>
    ),
    th: ({ children, ...props }: RendererProps) => (
        <th
            {...props}
            style={{
                border: '1px solid black',
                backgroundColor: '#009933',
                padding: '8px',
                fontWeight: 'bold',
                textAlign: 'left',
                color: '#004d1a',
            }}
        >
            {children}
        </th>
    ),
    td: ({ children, ...props }: RendererProps) => (
        <td
            {...props}
            style={{
                border: '1px solid #A6E22E',
                backgroundColor: '#001a09',
                padding: '8px',
                textAlign: 'left',
                color: '#A5D6A7',
            }}
        >
            {children}
        </td>
    ),
    strong: ({ children, ...props }: RendererProps) => (
        <strong {...props} style={{ color: '#A5D6A7' }}>{children}</strong>
    ),
    code: ({ children, ...props }: RendererProps) => (
        <code {...props} style={{ color: '#A6E22E', backgroundColor: '#001a09', padding: '2px', borderRadius: '4px' }}>{children}</code>
    )
};
