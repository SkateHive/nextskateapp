import { Divider, Image } from '@chakra-ui/react';
import React from 'react';

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

export const MarkdownRenderers = {
  img: ({ alt, src, title, ...props }: RendererProps) => (
    <span style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <Image
        {...props}
        alt={alt}
        src={src}
        title={title}
        style={{
          display: 'inline-block',
          maxWidth: '100%',
          height: 'auto',
          borderRadius: '10px',
          marginTop: '20px',
          marginBottom: '20px',
        }}
      />
    </span>
  ),
  p: ({ children, ...props }: RendererProps) => (
    <div {...props} style={{ color: 'white', fontSize: '18px', paddingBottom: '15px' }}>
      {children}
    </div>
  ),
  a: ({ href, children, ...props }: RendererProps) => (
    <a style={{ color: "yellow" }} href={href} {...props}>{children}</a>
  ),
  h1: ({ children, ...props }: RendererProps) => (
    <h1 {...props} style={{ fontWeight: 'bold', color: '#A5D6A7', fontSize: '28px', paddingBottom: '10px', paddingTop: "10px", paddingLeft: '8px' }}>{children}</h1>
  ),
  h3: ({ children, ...props }: RendererProps) => (
    <h3 {...props} style={{ fontWeight: 'bold', color: '#A5D6A7', fontSize: '24px', paddingBottom: '6px', paddingTop: "12px", paddingLeft: '8px' }}>{children}</h3>
  ),
  h2: ({ children, ...props }: RendererProps) => (
    <h2 {...props} style={{ fontWeight: 'bold', color: '#A5D6A7', fontSize: '26px', paddingBottom: '8px', paddingTop: "10px", paddingLeft: '8px' }}>{children}</h2>
  ),
  h4: ({ children, ...props }: RendererProps) => (
    <h4 {...props} style={{ fontWeight: 'bold', color: '#A5D6A7', fontSize: '22px', paddingBottom: '6px', paddingTop: "12px", paddingLeft: '8px' }}>{children}</h4>
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
  ol: ({ ordered, children, ...props }: RendererProps) => {
    const listType = ordered ? "1" : "decimal";
    return <ol {...props} style={{ listStyleType: listType, paddingLeft: '10%' }}>{children}</ol>;
  },
  ul: ({ ordered, children, ...props }: RendererProps) => {
    const listType = ordered ? "1" : "decimal";
    return <ul {...props} data-ordered={listType} style={{ padding: '5%', paddingLeft: '10%', color: 'white' }}>{children}</ul>;
  },
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
  iframe: ({ src, ...props }: RendererProps) => (
    <center>
      <iframe
        {...props}
        src={src}
        style={{ borderRadius: '10px', marginBottom: '10px', maxWidth: '100%', minWidth: '100%', aspectRatio: '16/9', height: '100%', border: '2px grey solid' }}
      />
    </center>
  ),
  video: ({ src, ...props }: RendererProps) => (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', paddingTop: '10px', minWidth: '100%', minHeight: 'auto' }}>
      <video
        {...props}
        autoPlay={true}
        muted={true}
        src={src}
        style={{ background: 'transparent', borderRadius: '10px', marginBottom: '20px', border: '2px grey solid', minWidth: '70%', minHeight: '50%' }}
      />
    </div>
  ),
  table: ({ children, ...props }: RendererProps) => (
    <div style={{
      display: 'flex', justifyContent: 'center',
      border: '1px solid none',
      borderRadius: '10px',
      padding: '10px',
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
