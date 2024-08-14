"use client";
import { MarkdownRenderers } from "@/app/upload/utils/MarkdownRenderers";
import AuthorAvatar from "@/components/AuthorAvatar";
import LoginModal from "@/components/Hive/Login/LoginModal";
import TipButton from "@/components/PostCard/TipButton";
import { useHiveUser } from "@/contexts/UserContext";
import { useComments } from "@/hooks/comments";
import { commentWithPrivateKey } from "@/lib/hive/server-functions";
import {
  LinkWithDomain,
  extractCustomLinks,
  extractIFrameLinks,
  extractLinksFromMarkdown,
} from "@/lib/markdown";
import {
  formatDate,
  getTotalPayout,
  transformIPFSContent,
  transformNormalYoutubeLinksinIframes,
  transformShortYoutubeLinksinIframes,
} from "@/lib/utils";
import {
  Box,
  Button,
  Center,
  Flex,
  HStack,
  IconButton,
  Text,
  Textarea,
  Tooltip,
  VStack
} from "@chakra-ui/react";
import * as dhive from "@hiveio/dhive";
import { ReactNode, useEffect, useRef, useState } from "react";
import { FaEye, FaEyeSlash, FaHeart, FaRegComment, FaRegHeart } from "react-icons/fa";
import { FaPencil } from "react-icons/fa6";
import { LuArrowLeftSquare, LuArrowRightSquare } from "react-icons/lu";
import ReactMarkdown from "react-markdown";
import Carousel from "react-multi-carousel";
import { useReward } from "react-rewards";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import { handleVote } from "../utils/handleFeedVote";
import { EditCommentModal } from "./EditCommentModal";
import ToggleComments from "./ToggleComments";

const CustomLeftArrow = ({ onClick }: { onClick: () => void }) => {
  return (
    <div
      onClick={onClick}
      style={{
        position: 'absolute',
        left: '0px',
        zIndex: '10',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '40px',
        height: '100%',
        cursor: 'pointer',
        opacity: 0,
        transition: 'opacity 0.3s ease',
        backdropFilter: 'blur(3px)',
        borderTopLeftRadius: '10px',
        borderBottomLeftRadius: '10px',
      }}
      className="custom-arrow"
    >
      <LuArrowLeftSquare color="white" size="20px" />
    </div>
  );
};

const CustomRightArrow = ({ onClick }: { onClick: () => void }) => {
  return (
    <div
      onClick={onClick}
      style={{
        position: 'absolute',
        right: '0',
        zIndex: '10',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '40px',
        height: '100%',
        cursor: 'pointer',
        opacity: 0,
        transition: 'opacity 0.3s ease',
        backdropFilter: 'blur(3px)',
        borderTopRightRadius: '10px',
        borderBottomRightRadius: '10px',
      }}
      className="custom-arrow"
    >
      <LuArrowRightSquare color="white" size="20px" />
    </div>
  );
};

const CarouselContainer = ({ children }: { children: ReactNode }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    if (containerRef.current) {
      const arrows = containerRef.current.querySelectorAll<HTMLDivElement>('.custom-arrow');
      arrows.forEach((arrow: HTMLDivElement) => {
        arrow.style.opacity = '1';
      });
    }
  };

  const handleMouseLeave = () => {
    if (containerRef.current) {
      const arrows = containerRef.current.querySelectorAll<HTMLDivElement>('.custom-arrow');
      arrows.forEach((arrow: HTMLDivElement) => {
        arrow.style.opacity = '0';
      });
    }
  };

  return (
    <Box
      m={4}
      maxW={'80%'}
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      borderRadius={'10px'}
      _hover={
        {
          border: "3px solid limegreen",
        }
      }
    >
      {children}
    </Box>
  );
};


interface CommentItemProps {
  comment: any;
  username: string;
  handleVote: (author: string, permlink: string) => void;
  onClick?: () => void;
  onNewComment: (comment: any) => void;
  onClose: () => void;


}

const responsive = {
  mobile: {
    breakpoint: { max: 4200, min: 0 },
    items: 1,
  },
};

const VotingButton = ({
  comment,
  username,
  toggleValueTooltip,
}: {
  comment: any;
  username: any;
  toggleValueTooltip: () => void;
}) => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const initialIsVoted = comment.active_votes?.some(
    (vote: any) => vote.voter === username,
  );
  const [isVoted, setIsVoted] = useState(initialIsVoted);
  const [voteCount, setVoteCount] = useState(comment.active_votes?.length || 0);
  const rewardId = `reward-${comment.id}`;
  const { reward } = useReward(rewardId, "emoji", {
    emoji: ["$", "*", "#"],
    spread: 60,
  });

  const handleVoteClick = async () => {
    if (username === "") {
      setIsLoginModalOpen(true);
      return;
    } else {
      const newIsVoted = !isVoted;
      await handleVote(comment.author, comment.permlink, username ?? "");
      setIsVoted(newIsVoted);
      toggleValueTooltip();
      setVoteCount((prevVoteCount: number) =>
        newIsVoted ? prevVoteCount + 1 : prevVoteCount - 1,
      );

      if (newIsVoted) {
        reward();
      }
    }
  };

  return (
    <>
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
      <Button
        onClick={handleVoteClick}
        colorScheme="green"
        variant="ghost"
        leftIcon={isVoted ? <FaHeart /> : <FaRegHeart />}
      >
        <span
          id={rewardId}
          style={{
            position: "absolute",
            left: "50%",
            bottom: "15px",
            transform: "translateX(-50%)",
            zIndex: 5,
          }}
        />
        {voteCount}
      </Button>
    </>
  );
};

const CommentItem = ({ comment, username, handleVote, onNewComment, onClose }: CommentItemProps) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isValueTooltipOpen, setIsValueTooltipOpen] = useState(false);
  const [numberOfComments, setNumberOfComments] = useState(0);
  const [editedCommentBody, setEditedCommentBody] = useState(comment.body);
  const [commentReplies, setCommentReplies] = useState<any[]>([]);
  const [visiblePosts, setVisiblePosts] = useState(5);
  const [isEyeClicked, setIsEyeClicked] = useState(false);
  const [isCommentFormVisible, setIsCommentFormVisible] = useState(false);
  const user = useHiveUser();
  const [replyBody, setReplyBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { comments } = useComments(comment.author, comment.permlink);
  
  const toggleValueTooltip = () => {
    setIsValueTooltipOpen(true);
    setTimeout(() => {
      setIsValueTooltipOpen(false);
    }, 3000);
  };

  useEffect(() => {
    setCommentReplies(comments);
    setNumberOfComments(comments.length);
  }, [comments]);



  const handleEyeClick = () => {
    setIsEyeClicked(prev => !prev);
  };

  const handleEditSave = async (editedBody: string) => {
    try {
      console.log("Edit saved:", editedBody);
      setEditedCommentBody(editedBody);
      setIsEditModalOpen(false);
      console.log("Updated comment body:", editedBody);
    } catch (error) {
      console.error("Erro ao salvar edição do comentário:", error);
    }
  };



  const { voteValue } = useHiveUser();

  const imageLinks = extractLinksFromMarkdown(editedCommentBody);
  const iframeLinks = extractIFrameLinks(editedCommentBody);
  const tSpeakLinks = extractCustomLinks(editedCommentBody);
  let videoLinks: LinkWithDomain[] = [];

  if (["samuelvelizsk8", "mark0318"].includes(comment.author)) {
    videoLinks = [...iframeLinks, ...tSpeakLinks];
  }

  const uniqueImageUrls = new Set();
  const filteredImages = imageLinks.filter((image) => {
    if (!uniqueImageUrls.has(image.url)) {
      uniqueImageUrls.add(image.url);
      return true;
    }
    return false;
  });

  const markdownWithoutImages = editedCommentBody.replace(/!\[.*?\]\((.*?)\)/g, "");

  const carouselRef = useRef<any>(null);

  const handleImageClick = () => {
    if (carouselRef.current) {
      carouselRef.current.next();
    }
  };

  const handleReply = async () => {
    const loginMethod = localStorage.getItem("LoginMethod");
    const newPermLink = `${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;

    try {
      if (loginMethod === "keychain") {
        if (!window.hive_keychain) {
          throw new Error("Hive Keychain extension not found!");
        }
        const username = user.hiveUser?.name;
        if (!username) {
          throw new Error("Username is missing");
        }

        const postData = {
          parent_author: comment.author,
          parent_permlink: comment.permlink,
          author: username,
          permlink: newPermLink,
          title: "reply",
          body: replyBody,
          json_metadata: JSON.stringify({
            tags: ["skateboard"],
            app: "skatehive",
          }),
        };
        const operations = [
          [
            "comment",
            postData,
          ],
        ];

        window.hive_keychain.requestBroadcast(
          username,
          operations,
          "posting",
          (response: any) => {
            if (response.success) {
              console.log("onNewComment function:", onNewComment); 
              if (typeof onNewComment === 'function') {
                onNewComment({
                  ...postData,
                  id: newPermLink,
                });
              } else {
                console.error("onNewComment is not a function");
              }
              setReplyBody("");
              onClose();
            } else {
              throw new Error("Error posting comment: " + response.message);
            }
          }
        );
      } else if (loginMethod === "privateKey") {
        const commentOptions: dhive.CommentOptionsOperation = [
          "comment_options",
          {
            author: String(user.hiveUser?.name),
            permlink: newPermLink,
            max_accepted_payout: "10000.000 HBD",
            percent_hbd: 10000,
            allow_votes: true,
            allow_curation_rewards: true,
            extensions: [
              [
                0,
                {
                  beneficiaries: [{ account: "skatehacker", weight: 1000 }],
                },
              ],
            ],
          },
        ];

        const postOperation: dhive.CommentOperation = [
          "comment",
          {
            parent_author: comment.author,
            parent_permlink: comment.permlink,
            author: String(user.hiveUser?.name),
            permlink: newPermLink,
            title: `Reply to ${comment.author}`,
            body: replyBody,
            json_metadata: JSON.stringify({
              tags: ["skateboard"],
              app: "Skatehive App",
              image: "/skatehive_square_green.png",
            }),
          },
        ];

        await commentWithPrivateKey(localStorage.getItem("EncPrivateKey")!, postOperation, commentOptions);
        if (typeof onNewComment === 'function') {
          onNewComment({
            ...postOperation[1],
            id: newPermLink,
          });
        } else {
          console.error("onNewComment is not a function");
        }
        setReplyBody("");
        onClose();
      }
    } catch (error: any) {
      setError(error.message);
    }
  };


  return (
    <Box key={comment.id} p={4} bg="black" color="white">
      <Flex>
        <AuthorAvatar username={comment.author} />
        <VStack w={"80%"} ml={4} alignItems={"start"} marginRight={"16px"}>
          <HStack justify={"space-between"} width={"full"}>
            <HStack
              cursor="pointer"
              onClick={() =>
                window.open(
                  `/post/test/@${comment.author}/${comment.permlink}`,
                  "_self"
                )
              }
              gap="2px"
            >
              <Text fontWeight="bold">{comment.author}</Text>
              <Text ml={2} color="gray.400" fontSize="14px">
                · {formatDate(String(comment.created))}
              </Text>
            </HStack>

            <IconButton
              icon={isEyeClicked ? <FaEye /> : <FaEyeSlash />}
              onClick={handleEyeClick}
              aria-label={isEyeClicked ? "Hide Content" : "Show Content"}
              variant="ghost"
              colorScheme="green"
            />
          </HStack>
          <Box w={"100%"} bg="black" color="white" id="flexxx">
            <ReactMarkdown
              components={MarkdownRenderers}
              rehypePlugins={[rehypeRaw]}
              remarkPlugins={[remarkGfm]}
            >
              {transformNormalYoutubeLinksinIframes(
                transformIPFSContent(
                  transformShortYoutubeLinksinIframes(markdownWithoutImages)
                )
              )}
            </ReactMarkdown>
            {(filteredImages.length >= 2 || videoLinks.length >= 2 || filteredImages.length > 1 && videoLinks.length > 1) && (
              <Box maxW={'100%'} >
                <CarouselContainer>
                  <Carousel
                    ref={carouselRef}
                    responsive={responsive}
                    arrows
                    customLeftArrow={<CustomLeftArrow onClick={() => carouselRef.current?.previous()} />}
                    customRightArrow={<CustomRightArrow onClick={() => carouselRef.current?.next()} />}
                    containerClass="carousel-container" 
                  >
                    {videoLinks.map((video, i) => (
                      <iframe
                        key={i}
                        src={video.url}
                        width="100%"
                        height="100%"
                        style={{
                          aspectRatio: "16/9",
                          border: "0",
                          maxWidth: "100%",
                          overflow: "hidden",
                        }}
                      />
                    ))}
                    {filteredImages.map((image, i) => (
                      <Box
                        key={i}
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                        style={{
                          height: "100%",
                          overflow: "hidden",
                          maxWidth: "100%",
                        }}
                      >
                        <img
                          key={i}
                          src={image.url}
                          alt="Post media"
                          style={{
                            width: "100%",
                            maxWidth: "100%",
                            objectFit: "cover",
                            borderRadius: "8px",
                            maxHeight: '445px',
                            display: "block",
                            margin: "3px",
                            overflow: "hidden",
                          }}
                          onClick={handleImageClick}
                        />
                      </Box>
                    ))}
                  </Carousel>
                </CarouselContainer>


              </Box>
            )}
          </Box>

        </VStack>
      </Flex>

      <Flex m={4} justifyContent={"space-between"}>
        {comment.author === username ? (
          <Button
            _hover={{
              background: "transparent",
              color: "green.200",
            }}
            colorScheme="green"
            variant="ghost"
            leftIcon={<FaPencil />}
            onClick={() => setIsEditModalOpen(true)}
            aria-label="Edit Comment"
          >
            Edit
          </Button>
        ) : (
          <TipButton author={comment.author} />
        )}

        <Button
          _hover={{
            background: "transparent",
            color: "green.200",
          }}
          colorScheme="green"
          variant="ghost"
          leftIcon={<FaRegComment />}
          onClick={() => setIsCommentFormVisible(prev => !prev)}
          aria-label="Toggle Comment Form"
        >
          {numberOfComments}
        </Button>

        <VotingButton
          comment={comment}
          username={username}
          toggleValueTooltip={toggleValueTooltip}
        />
        <Tooltip
          label={`+$${voteValue.toFixed(6)}`}
          placement="top"
          isOpen={isValueTooltipOpen}
          hasArrow
        >
          <Text
            fontWeight={"bold"}
            color={"green.400"}
            onClick={() =>
              window.open(
                `/post/test/@${comment.author}/${comment.permlink}`,
                "_self"
              )
            }
            cursor={"pointer"}
            mt={2}
          >
            ${getTotalPayout(comment)}
          </Text>
        </Tooltip>
      </Flex>
      {isCommentFormVisible && (
        <Box>
          <VStack align="start" spacing={4} position="relative">
            <Flex align="start" w="full">
              <AuthorAvatar username={comment.author} borderRadius={100} />
              <VStack>
                <Center>
                  <Box ml={3}>
                    <ReactMarkdown components={MarkdownRenderers} rehypePlugins={[rehypeRaw]} remarkPlugins={[remarkGfm]}>
                      {transformIPFSContent(comment.body)}
                    </ReactMarkdown>
                  </Box>
                </Center>
              </VStack>
            </Flex>
            <Box position="absolute" left="24px" top="60px" bottom="120px" width="2px" bg="gray.600" />
            <Flex align="start" w="full" direction={{ base: "column", md: "row" }}>
              <Box position="relative" w="full">
                <Textarea
                  value={replyBody}
                  onChange={(e) => setReplyBody(e.target.value)}
                  placeholder="Write your reply here"
                  bg="transparent"
                  
                  resize="none"
                  minHeight="100px"
                  borderRadius="xl"
                  border="1px solid grey"
                  paddingRight="80px" 
                />
              </Box>
              <Button
                onClick={handleReply}
                variant="outline"
                colorScheme="green"
                position="absolute"
                right="10px"
                bottom="10px"
                zIndex="1" 
              >
                Reply
              </Button>

            </Flex>
          </VStack>

        </Box>
      )}
      <EditCommentModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        commentBody={editedCommentBody}
        onSave={handleEditSave}
        post={comment}
        username={username}
      />

      <ToggleComments
        isEyeClicked={isEyeClicked}
        setIsEyeClicked={setIsEyeClicked}
        commentReplies={commentReplies}
        visiblePosts={visiblePosts}
        setVisiblePosts={setVisiblePosts}
        username={username}
        handleVote={handleVote}
      />
    </Box>
  );
};

export default CommentItem;


