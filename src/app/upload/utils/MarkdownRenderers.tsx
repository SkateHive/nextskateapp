'use client'
import { Box, Divider, Image } from '@chakra-ui/react';
import React, { useEffect, useRef, useState } from 'react';
import { SkateHivePreviewCard } from '@/app/mainFeed/components/SkatehivePreviewCard';

import ProfileLink from './ProfileLink';



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

const VideoRenderer = ({ src, ...props }: RendererProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [poster, setPoster] = useState<string>('/home_animation_body.gif');
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      const captureThumbnail = () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext('2d');
        if (context) {
          video.currentTime = 2;
          video.addEventListener('seeked', function capture() {
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            setPoster(canvas.toDataURL('image/jpeg'));
            video.removeEventListener('seeked', capture);
          });
        }
      };
      if (video.readyState >= 2) {
        captureThumbnail();
      } else {
        video.addEventListener('loadeddata', captureThumbnail);
      }
    }
  }, [src]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => {
      if (!videoRef.current) return;
      videoRef.current.play();
      setIsPlaying(true);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            handlePlay();
          } else {
            handlePause();
          }
        });
      },
      { threshold: 0.5 }
    );

    observer.observe(video);

    return () => {
      observer.unobserve(video);
    };
  }, [src]);

  return (
    <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', paddingTop: '10px', minWidth: '100%', minHeight: 'auto' }}>
      <picture>
        <video
          {...props}
          muted={true}
          loop={false}
          ref={videoRef}
          src={src}
          poster={poster}
          crossOrigin='anonymous'
          playsInline={true}
          style={{ background: 'transparent', borderRadius: '10px', marginBottom: '20px', border: '0px grey solid', width: '100%', minHeight: '50%', maxHeight: '420px' }}
        />
      </picture>
    </div>
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
        style={{
          display: 'inline-block',
          maxWidth: '100%',
          height: '100%',
          maxHeight: '345px',
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
  a: ({ href, children, ...props }: RendererProps) => {
    const skateHivePostRegex = /https:\/\/www\.skatehive\.app\/post\/([^/]+)\/@([^/]+)\/([^/]+)/;
    const match = skateHivePostRegex.exec(href);

    // Profile link example: skatehive.app/skater/barracaoshop or skatehive.app/profile/barracaoshop
    const skatehiveProfileRegex = /https:\/\/(www\.)?(skatehive\.app|beta\.skatehive\.app)\/(profile|skater)\/([^/]+)/;
    const profileMatch = skatehiveProfileRegex.exec(href);

    if (match) {
      const [fullMatch, parentPermlink, username, postPermlink] = match;
      return <SkateHivePreviewCard postId={postPermlink} username={username} />;
    } else if (profileMatch) {
      const [fullMatch, subdomain, type, username] = profileMatch;

      return (
        <Box>
          <ProfileLink username={username} />
        </Box>
      );
    }

    return (
      <a
        style={{ color: 'yellow', textWrap: 'wrap', wordBreak: 'break-all' }}
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
  video: VideoRenderer, // Use the new VideoRenderer component
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
