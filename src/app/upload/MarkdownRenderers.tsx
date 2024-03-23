import React from 'react';
import { Box, Flex, Text, Image, Link, VStack, HStack, Badge } from '@chakra-ui/react';
import axios, { AxiosResponse } from 'axios'; // Import AxiosResponse
import { useState, useEffect } from 'react';
type MarkdownProps = {
  node?: any;
  alt?: any;
  src?: any;
  title?: any;
};

type RendererProps = MarkdownProps & {
  children?: React.ReactNode;
  ordered?: any;
  href?: any; // Add this line to include href in RendererProps
};
type FetchedDetailsObject = {
  [key: string]: PostDetails;
};
type PostDetails = {
  post_id: number;
  author: string;
  permlink: string;
  category: string;
  title: string;
  body: string;
  json_metadata: {
    tags: string[];
    users: string[];
    image: string[];
    links: string[];
    app: string;
    format: string;
    description: string;
  };
  created: string;
  updated: string;
  depth: number;
  children: number;
  net_rshares: number;
  is_paidout: boolean;
  payout_at: string;
  payout: number;
  pending_payout_value: string;
  author_payout_value: string;
  curator_payout_value: string;
  promoted: string;
  replies: any[];
  author_reputation: number;
  stats: {
    hide: boolean;
    gray: boolean;
    total_votes: number;
    flag_weight: number;
  };
  url: string;
  beneficiaries: any[];
  max_accepted_payout: string;
  percent_hbd: number;
  active_votes: any[];
  newProperty: string;
};

const getPost = async (author: string, permlink: string): Promise<PostDetails | null> => {
  try {
    const response: AxiosResponse = await axios.post('https://api.hive.blog/', {
      jsonrpc: '2.0',
      id: 1,
      method: 'bridge.get_discussion',
      params: [author, permlink],
    });
    if (response.status === 200 && response.data.result) {
      return response.data.result as PostDetails;
    } else {
      console.error('Failed to fetch post details:', response.status, response.data.error);
      return null;
    }
  } catch (error: any) {
    console.error('Error fetching post details:', error.message);
    return null;
  }
};

export const MarkdownRenderers = {
  img: ({ alt, src, title, ...props }: RendererProps) => {
    // if the image is inline, it will have position start column > 1
    let isInline = false;
    if (props.node.position.start.column > 1) {
      isInline = true;
    }

    let image = (
      <img
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
        onError={(e) => {
          // Handle image loading error by replacing the source with a default image
          e.currentTarget.src = 'https://remote-image.decentralized-content.com/image?url=https%3A%2F%2Fipfs.decentralized-content.com%2Fipfs%2Fbafkreidxxr42k6sff4ppctl4l3xvh52rf2m7vzdrjmyqhoijveevwafkau&w=3840&q=75'; // Replace with the URL of your default image
        }}
      />
    );

    if (isInline) {
      return image;
    }

    return (
      <span style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', }}>
        {image}
      </span>
    );
  },
  p: ({ children, ...props }: RendererProps) => <p {...props} style={{ color: 'white', fontSize: '18px', paddingBottom: '15px' }}>{children}</p>,
  a: ({ children, href, ...props }: RendererProps) => {
    try {
      const url = new URL(href);
      if (url.pathname.startsWith('/post/hive-173115')) {
        const pathSegments = url.pathname.split('/').filter(segment => segment !== '');
        const author = (pathSegments[2] || '').replace(/^@/, '');
        const permlink = pathSegments[3] || '';
        const [fetchedDetails, setFetchedDetails] = useState<FetchedDetailsObject | null>(null);
        useEffect(() => {
          if (author && permlink) {
            const fetchPostDetails = async () => {
              const postDetailsResponse = await getPost(author, permlink);
              if (postDetailsResponse) {
                setFetchedDetails({ [`${author}/${permlink}`]: postDetailsResponse });
              }
            };
            fetchPostDetails();
          } else {
            console.warn('Author or permlink is empty. Unable to fetch post details.');
          }
        }, [author, permlink]);

        if (!fetchedDetails) {
          return <Box>Loading post details...</Box>;
        }

        const fetchedPost: any = fetchedDetails[`${author}/${permlink}`];
        return (
          <Flex>

            <Box
              border="1px solid orange"
              borderRadius="10px"
              padding="10px"
              display="flex"
              alignItems="center"
              backgroundColor="#1E1E1E"
              marginBottom="10px"
              minW={"100%"}
            >
              <Image
                src={fetchedPost[`${author}/${permlink}`].json_metadata['image'][0]}
                alt={`${fetchedPost.author}'s avatar`}
                width="80px"
                height="auto"
                borderRadius="10%"
                margin="5px"
              />
              <VStack marginLeft={"5px"}>
                <Link href={`https://www.skatehive.app/post${fetchedPost[`${author}/${permlink}`].url}`} color="orange">
                  {fetchedPost[`${author}/${permlink}`].title}
                </Link>
                <HStack>
                  <Text fontSize="16px" color="white">
                    {' '} App: {' '}
                    {fetchedPost[`${author}/${permlink}`].json_metadata['app']}
                  </Text>
                  <Badge border={"1px dashed limegreen"} color="limegreen" bg={"transparent"} borderRadius="5px" padding="5px">
                    {fetchedPost[`${author}/${permlink}`].payout.toFixed(2)} USD
                  </Badge>
                </HStack>
              </VStack>
            </Box>
          </Flex>
        );
      }
    } catch (error) {
      console.error('Error parsing SkateHive URL:', error);
    }

    // If not a SkateHive link, or if there's an error parsing the URL, render the link as usual
    return <a {...props} href={href} style={{ color: 'orange' }}>{children}</a>;
  },
  h1: ({ children, ...props }: RendererProps) => <h1 {...props} style={{ fontWeight: 'bold', color: 'white', fontSize: '28px', paddingBottom: '10px', paddingTop: "10px" }}>{children}</h1>,
  h2: ({ children, ...props }: RendererProps) => <h2 {...props} style={{ fontWeight: 'bold', color: 'white', fontSize: '26px', paddingBottom: '8px', paddingTop: "10px" }}>{children}</h2>,
  h3: ({ children, ...props }: RendererProps) => <h3 {...props} style={{ fontWeight: 'bold', color: 'white', fontSize: '24px', paddingBottom: '6px', paddingTop: "12px" }}>{children}</h3>,
  h4: ({ children, ...props }: RendererProps) => <h4 {...props} style={{ fontWeight: 'bold', color: 'white', fontSize: '22px', paddingBottom: '6px', paddingTop: "12px" }}>{children}</h4>,
  blockquote: ({ children, ...props }: RendererProps) => (
    <div
      style={{
        backgroundColor: '#333',
        padding: '16px',
        borderLeft: '4px solid #FFD700', // Gold border
        margin: '20px 0',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)',
        color: '#FFF',
        fontStyle: 'italic',
        fontSize: '18px',
        lineHeight: '1.5',
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
    return <ul {...props} data-ordered={listType} style={{ paddingLeft: '10%' }}>{children}</ul>;
  },
  sub: ({ children, ...props }: RendererProps) => (<sub {...props} style={{ color: 'gray' }}>{children}</sub>),
  hr: ({ children, ...props }: RendererProps) => <hr {...props} style={{ paddingBottom: '20px' }}>{children}</hr>,
  br: ({ children, ...props }: RendererProps) => <br {...props} style={{ paddingBottom: '20px' }}>{children}</br>,
  pre: ({ children, ...props }: RendererProps) => (
    <div
      style={{
        backgroundColor: '#1E1E1E', // Dark gray background
        padding: '16px',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)',
        overflowX: 'auto', // Horizontal scrollbar for long code lines
      }}
    >
      <code
        {...props}
        style={{
          color: '#A9B7C6', // Light gray text color
          fontFamily: 'monospace',
          fontSize: '14px',
          lineHeight: '1.5',
        }}
      >
        {children}
      </code>
    </div>
  ),
  iframe: ({ src, ...props }: RendererProps) => (
    <Box>

      <iframe
        {...props}
        src={src}
        style={{ borderRadius: '20px', marginBottom: '10px', minWidth: '100%', minHeight: '352px' }}
      />
    </Box>
  ),
  table: ({ children, ...props }: RendererProps) => (
    <div style={{
      display: 'flex', justifyContent: 'center',
      border: '1px solid orange',
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
  video: ({ src, ...props }: RendererProps) => (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', paddingTop: '10px', minWidth: '100%', minHeight: 'auto' }}>
      <video
        {...props}
        src={src}
        style={{ borderRadius: '10px', marginBottom: '20px', border: '2px grey solid', minWidth: '60%', minHeight: '40%' }}
      />
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
        border: '1px solid green',
        padding: '8px',
        fontWeight: 'bold',
        textAlign: 'left',
      }}
    >
      {children}
    </th>
  ),
  td: ({ children, ...props }: RendererProps) => (
    <td
      {...props}
      style={{
        border: '1px solid black',
        backgroundColor: '#1E1E1E',
        padding: '8px',
        textAlign: 'left',
      }}
    >
      {children}
    </td>

  ),
  strong: ({ children, ...props }: RendererProps) => (
    <strong {...props} style={{ color: 'orange' }}>{children}</strong>
  ),
};

