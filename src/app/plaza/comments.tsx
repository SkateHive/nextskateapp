import React, { useEffect, useState } from 'react';
import { Box, Text, Image, Flex, Button, Tooltip, Badge, Link } from '@chakra-ui/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize'; // Add this import

// import useAuthUser from '../../../../components/auth/useAuthUser';
// import voteOnContent from '../../../utils/hiveFunctions/voting';

import { CommentProps, CommentsProps } from './types';
// import comment box
import CommentBox from './commentBox';
import { MarkdownRenderers } from '../upload/MarkdownRenderers';



const Comment: React.FC<CommentProps> = ({ author, body, created, net_votes, permlink, repliesFetched, payout }) => {
    const avatarUrl = `https://images.ecency.com/webp/u/${author}/avatar/small`;
    // const { user } = useAuthUser();
    const [localNetVotes, setNetVotes] = useState(net_votes);

    // const handleVote = async () => {
    //     if (!user || !user.name) {
    //         console.error("Username is missing");
    //         return;
    //     }

    //     try {
    //         // Perform the vote operation
    //         // await voteOnContent(user.name, permlink, author, 10000);

    //         if (author) {
    //             const author_alert = author;
    //             alert("You just voted on " + author_alert + "'s comment! 🛹");
    //         }

    //         // Update the net_votes only if the vote operation is successful
    //         setNetVotes(net_votes + 1);
    //     } catch (error: any) {
    //         console.error("Error voting:", error);

    //         // Check if the error code is -32003 and handle it differently
    //         if (error.code === -32003) {
    //             // Handle this specific error case (optional)
    //             // You can add custom logic here if needed
    //             // await voteOnContent(user.name, permlink, author, 0);
    //             setNetVotes(localNetVotes - 1);
    //         } else {
    //             // Handle other errors (if any)
    //             // You can add custom error handling logic here
    //         }
    //     }
    // };

    // add a comment box below the comment on click of reply button
    const [showCommentBox, setShowCommentBox] = useState(false);
    const handleReplyClick = () => {
        setShowCommentBox(!showCommentBox);
    };

    return (
        <Box>
            <Box border="1px solid gray" borderRadius="10px" padding="15px" margin="10px">
                <Flex justifyContent="space-between" alignItems="">
                    {/* <Link to={`https://skatehive.app/profile/${author}`}> */}
                    <Flex padding="5px" alignItems="center">
                        <Image src={avatarUrl} borderRadius="full" boxSize="40px" mr="3" />
                        <Text fontWeight="bold">@{author}</Text>
                    </Flex>
                    {/* </Link> */}
                    <Tooltip
                        label="Yes you can earn $ by commenting, make sure you comment cool stuff that people will fire up!"
                        aria-label="A tooltip"
                        placement="top"
                        bg={"black"}
                        color={"yellow"}
                        border={"1px dashed yellow"}
                    >
                        <Badge marginBottom={"27px"} colorScheme="yellow" fontSize="sm">  {(payout)} USD</Badge>
                    </Tooltip>
                </Flex>
                <ReactMarkdown

                    rehypePlugins={[rehypeRaw, rehypeSanitize]}
                    remarkPlugins={[remarkGfm]}
                    components={MarkdownRenderers}


                // components={{
                //     img: ({ node, alt, src, title, ...props }) => (
                //         <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                //             <img {...props} alt={alt} src={src} title={title} style={{ maxWidth: '100%', height: 'auto', borderRadius: "10px", border: '1px solid limegreen' }} />
                //         </div>
                //     ),
                //     a: ({ node, children, ...props }) => <a {...props} style={{ color: 'yellow' }}>{children}</a>,
                //     p: ({ node, children, ...props }) => <p {...props} style={{ color: 'white' }}>{children}</p>,
                //     h1: ({ node, children, ...props }) => <h1 {...props} style={{ fontWeight: 'bold', color: 'yellow', fontSize: '24px' }}>{children}</h1>,
                //     h2: ({ node, children, ...props }) => <h2 {...props} style={{ fontWeight: 'bold', color: 'yellow', fontSize: '20px' }}>{children}</h2>,
                //     h3: ({ node, children, ...props }) => <h3 {...props} style={{ fontWeight: 'bold', color: 'yellow', fontSize: '18px' }}>{children}</h3>,
                //     blockquote: ({ node, children, ...props }) => <blockquote {...props} style={{ borderLeft: '3px solid limegreen', paddingLeft: '10px', fontStyle: 'italic' }}>{children}</blockquote>,
                //     ol: ({ node, children, ...props }) => <ol {...props} style={{ paddingLeft: '20px' }}>{children}</ol>,
                //     ul: ({ node, children, ...props }) => <ul {...props} style={{ paddingLeft: '20px' }}>{children}</ul>,
                // }}
                >
                    {body}
                </ReactMarkdown>
                <Flex justifyContent="space-between" alignItems="center">
                    <Text fontSize="sm">{new Date(created).toLocaleString()}</Text>
                    <Flex gap={3}>
                        {/* reply button */}
                        <Button leftIcon={<span></span>} variant="outline" size="sm" onClick={handleReplyClick}>
                            <p>Reply</p>
                        </Button>

                        {/* <Button leftIcon={<span></span>} variant="outline" size="sm" onClick={handleVote}> */}
                        {/* 
                        <img
                            src='https://cdn.discordapp.com/emojis/1060351346416554136.gif?size=240&quality=lossless'
                            alt="Vote"
                            style={{
                                maxWidth: '24px',
                                maxHeight: '24px',
                                marginRight: '5px',
                            }}
                        />
                        <p>{localNetVotes}</p>

                    </Button> */}
                    </Flex>
                </Flex>

                {/* comment box */}
                {showCommentBox && (
                    <CommentBox
                        user={'user'}
                        parentAuthor={author}
                        parentPermlink={permlink}
                        onCommentPosted={() => setShowCommentBox(false)}
                    />
                )}
            </Box>

            {/* if any sub replies are present, render them recursively */}
            {
                repliesFetched && repliesFetched.length > 0 && (
                    <Box style={{
                        borderLeft: '1px solid gray',
                        paddingLeft: '10px',
                        marginLeft: '30px',
                    }}>
                        <Comments
                            comments={repliesFetched}
                            commentPosted={false}
                            blockedUser=""
                            permlink=''
                        />
                    </Box>
                )
            }
        </Box >
    );
};

const Comments: React.FC<CommentsProps> = ({ comments, commentPosted, blockedUser }) => {
    const [localComments, setLocalComments] = useState<CommentProps[]>(comments);
    const blockedUsersList = Array.isArray(blockedUser) ? blockedUser : [blockedUser]; // Convert to an array if it's not already

    useEffect(() => {
        if (commentPosted) {
            // Logic to re-fetch comments when a new one is posted
            // For now, I'm just simulating a re-fetch by setting the local state
            // Replace this with your actual fetch logic
            setLocalComments(comments);
        }
    }, [commentPosted, comments]);

    const filterBlockedUserComments = (comments: CommentProps[], blockedUsers: string[]): CommentProps[] => {
        const filteredComments = comments.filter((comment: CommentProps) => !blockedUsers.includes(comment.author));
        return filteredComments;
    };

    // Filter comments based on blockedUser
    const filteredComments = filterBlockedUserComments(localComments, blockedUsersList);

    return (
        <Box>
            {filteredComments.map((comment, index) => (
                <Comment key={index} {...comment} />
            ))}
        </Box>
    );
};


export default Comments;
