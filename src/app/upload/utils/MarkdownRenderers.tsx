import { SkateHivePreviewCard } from '@/app/mainFeed/components/SkatehivePreviewCard';
import { Box, Divider, Image } from '@chakra-ui/react';
import React from 'react';
import ProfileLink from './ProfileLink';
import VideoRenderer from './VideoRenderer'; // Import the VideoRenderer

type MarkdownProps = {
  node?: any;
  alt?: string;
  src?: string;
  title?: string;
};

type RendererProps = MarkdownProps & {
  children?: React.ReactNode;
  ordered?: any;
  href?: string;
};

const MentionRenderer = ({ children }: { children: React.ReactNode }) => {
  const parts = React.Children.toArray(children);
  console.log(parts, 'parts', children, 'children');
  return (
    <>
      {parts.map((part, index) => {
        if (typeof part === 'string') {
          return part.split(/(@[a-zA-Z0-9!_\-]+)/g).map((subPart, subIndex) => {
            if (subPart.startsWith('@')) {
              return (
                <span key={`${index}-${subIndex}`} style={{ color: 'limegreen', fontWeight: 'bold' }}>
                  {subPart}
                </span>
              );
            }
            return subPart;
          });
        }
        return part;
      })}
    </>
  );
};

export const MarkdownRenderers = {
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
    <div {...props} style={{ color: 'white', fontSize: '18px', paddingBottom: '15px' }}>
      <MentionRenderer>{children}</MentionRenderer>
    </div>
  ),
  a: ({ href, children, ...props }: RendererProps) => {
    const skateHivePostRegex = /https:\/\/www\.skatehive\.app\/post\/([^/]+)\/@([^/]+)\/([^/]+)/;
    const match = skateHivePostRegex.exec(String(href));

    const skatehiveProfileRegex = /https:\/\/(www\.)?(skatehive\.app|beta\.skatehive\.app)\/(profile|skater)\/([^/]+)/;
    const profileMatch = skatehiveProfileRegex.exec(String(href));

    if (match) {
      const [, , username, postPermlink] = match;
      return <SkateHivePreviewCard postId={postPermlink} username={username} />;
    } else if (profileMatch) {
      const [, , , , username] = profileMatch;

      return (
        <Box>
          <ProfileLink username={username} />
        </Box>
      );
    }

    return (
      <a
        style={{ color: 'yellow', wordBreak: 'break-all' }}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        {...props}
      >
        {children}
      </a>
    );
  },
  h1: ({ children, ...props }: RendererProps) => (
    <h1 {...props} style={{ fontWeight: 'bold', color: '#A5D6A7', fontSize: '28px', padding: '10px 0 10px 8px' }}>{children}</h1>
  ),
  h3: ({ children, ...props }: RendererProps) => (
    <h3 {...props} style={{ fontWeight: 'bold', color: '#A5D6A7', fontSize: '24px', padding: '12px 0 6px 8px' }}>{children}</h3>
  ),
  h2: ({ children, ...props }: RendererProps) => (
    <h2 {...props} style={{ fontWeight: 'bold', color: '#A5D6A7', fontSize: '26px', padding: '10px 0 8px 8px' }}>{children}</h2>
  ),
  h4: ({ children, ...props }: RendererProps) => (
    <h4 {...props} style={{ fontWeight: 'bold', color: '#A5D6A7', fontSize: '22px', padding: '12px 0 6px 8px' }}>{children}</h4>
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
        fontSize: '18px',
        lineHeight: '1',
      }}
    >
      {children}
    </div>
  ),
  ol: ({ ordered, children, ...props }: RendererProps) => (
    <ol {...props} style={{ listStyleType: ordered ? "1" : "decimal", paddingLeft: '10%' }}>{children}</ol>
  ),
  ul: ({ ordered, children, ...props }: RendererProps) => (
    <ul {...props} data-ordered={ordered ? "1" : "decimal"} style={{ padding: '5%', paddingLeft: '10%', color: 'white' }}>{children}</ul>
  ),
  sub: ({ children, ...props }: RendererProps) => (
    <sub {...props} style={{ color: 'gray' }}>{children}</sub>
  ),
  hr: ({ children, ...props }: RendererProps) => (
    <Divider {...props} style={{ paddingBottom: '20px', color: '#A5D6A7', marginBottom: '5px' }}>{children}</Divider>
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
  iframe: ({ src, ...props }: RendererProps) => {
    const zoraRegex = /https:\/\/zora\.co\/.*/;
    const threeSpeakRegex = /https:\/\/3speak\.tv\/.*/;

    if (zoraRegex.test(String(src)) || threeSpeakRegex.test(String(src))) {
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
  video: VideoRenderer,
  table: ({ children, ...props }: RendererProps) => (
    <div style={{
      display: 'flex', justifyContent: 'center',
      borderRadius: '10px',
      padding: '10px',
      overflowX: 'auto',
    }}>
      <table
        {...props}
        style={{
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
