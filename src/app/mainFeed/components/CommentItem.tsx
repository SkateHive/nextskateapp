"use client";
import { MarkdownRenderers } from "@/app/upload/utils/MarkdownRenderers";
import AuthorAvatar from "@/components/AuthorAvatar";
import TipButton from "@/components/PostCard/TipButton";
import { useHiveUser } from "@/contexts/UserContext";
import { useComments } from "@/hooks/comments";
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
  Flex,
  HStack,
  Text,
  Tooltip,
  VStack
} from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { FaRegComment } from "react-icons/fa";
import { FaPencil } from "react-icons/fa6";
import ReactMarkdown from "react-markdown";
import Carousel from "react-multi-carousel";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import CarouselContainer from "./CommentItem/CarouselContainer";
import CustomLeftArrow from "./CommentItem/CustomLeftArrow";
import CustomRightArrow from "./CommentItem/CustomRightArrow";
import VotingButton from "./CommentItem/VotingButton";
import { EditCommentModal } from "./EditCommentModal";
import ReplyModal from "./replyModal";
import ToggleComments from "./ToggleComments";

interface CommentItemProps {
  comment: any;
  username: string;
  handleVote: (author: string, permlink: string) => void;
  onClick?: () => void;
  onNewComment?: (comment: any) => void;
  onClose?: () => void;
}

const responsive = {
  mobile: {
    breakpoint: { max: 4200, min: 0 },
    items: 1,
  },
};

const CommentItem = ({ comment, username, handleVote, onNewComment, onClose = () => { } }: CommentItemProps) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
  const [isValueTooltipOpen, setIsValueTooltipOpen] = useState(false);
  const [numberOfComments, setNumberOfComments] = useState(0);
  const [editedCommentBody, setEditedCommentBody] = useState(comment.body);
  const [commentReplies, setCommentReplies] = useState<any[]>([]);
  const [visiblePosts, setVisiblePosts] = useState(5);
  const [isEyeClicked, setIsEyeClicked] = useState(false);
  const [isCommentFormVisible, setIsCommentFormVisible] = useState(false);
  const [shouldShowAllComments, setShouldShowAllComments] = useState(false);
  const user = useHiveUser();

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

  useEffect(() => {
    if (isCommentFormVisible) {
      setShouldShowAllComments(false);
    }
  }, [isCommentFormVisible]);


  const handleNewComment = (newComment: any) => {
    setCommentReplies((prevComments) => [newComment, ...prevComments]);
    setNumberOfComments((prevCount: number) => prevCount + 1);
  };

  const handleEditSave = async (editedBody: string) => {
    try {
      setEditedCommentBody(editedBody);
      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Erro ao salvar edição do comentário:", error);
    }
  };

  const { voteValue } = useHiveUser();

  const extractLinksFromMarkdown = (markdown: string) => {
    const regex = /!\[.*?\]\((.*?)\)/g;
    const links = [];
    let match;
    while ((match = regex.exec(markdown))) {
      links.push({ url: match[1] });
    }
    return links;
  }

  const extractIFrameLinks = (markdown: string) => {
    const regex = /<iframe src="(.*?)"/g;
    const links = [];
    let match;
    while ((match = regex.exec(markdown))) {
      links.push({ url: match[1] });
    }
    return links;
  }

  const extractLinksAndIFrameLinksFromMarkdown = (markdown: string) => {
    const imageLinks = extractLinksFromMarkdown(markdown);
    const iframeLinks = extractIFrameLinks(markdown);
    const uniqueImageUrls = new Set();
    const filteredImages = imageLinks.filter((image) => {
      if (!uniqueImageUrls.has(image.url)) {
        uniqueImageUrls.add(image.url);
        return true;
      }
      return false;
    });
    return { imageLinks, iframeLinks, filteredImages };
  }

  const { imageLinks, iframeLinks, filteredImages } = extractLinksAndIFrameLinksFromMarkdown(editedCommentBody);

  const markdownWithoutImagesAndVideos = editedCommentBody.replace(/!\[.*?\]\((.*?)\)/g, "").replace(/<iframe src="(.*?)"/g, "").replace(/allowfullscreen>/g, "");


  const carouselRef = useRef<any>(null);

  const handleImageClick = () => {
    if (carouselRef.current) {
      carouselRef.current.next();
    }
  };

  const mediaItems = [
    ...iframeLinks.map((video) => ({ type: "video", url: video.url })),
    ...filteredImages.map((image) => ({ type: "image", url: image.url }))
  ];
  const toggleCommentVisibility = () => {
    setIsCommentFormVisible((prev) => !prev);
  };

  return (
    <Box key={comment.id} p={4} bg="black" color="white">

      <ReplyModal
        comment={comment}
        isOpen={isReplyModalOpen}
        onClose={() => setIsReplyModalOpen(false)}
        onNewComment={handleNewComment}
      />

      <Flex cursor="pointer">
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
          </HStack>
          <Box w={"100%"} bg="black" color="white" onClick={() => { toggleCommentVisibility(); }}>
            {((filteredImages.length <= 1 && iframeLinks.length === 0) ||
              (iframeLinks.length <= 1 && filteredImages.length === 0)) ? (
              <ReactMarkdown
                components={MarkdownRenderers}
                rehypePlugins={[rehypeRaw]}
                remarkPlugins={[remarkGfm]}

              >
                {transformNormalYoutubeLinksinIframes(
                  transformIPFSContent(
                    // is that right ? editedCommentBody here ?
                    transformShortYoutubeLinksinIframes(editedCommentBody)
                  )
                )}
              </ReactMarkdown>
            ) : (
              <>
                <Box onClick={() => { toggleCommentVisibility(); console.log(comment); }}>

                  <ReactMarkdown
                    components={MarkdownRenderers}
                    rehypePlugins={[rehypeRaw]}
                    remarkPlugins={[remarkGfm]}
                  >
                    {transformNormalYoutubeLinksinIframes(
                      transformIPFSContent(
                        transformShortYoutubeLinksinIframes(markdownWithoutImagesAndVideos)
                      )
                    )}
                  </ReactMarkdown>
                </Box>
                {(filteredImages.length > 0 || iframeLinks.length > 0) && (
                  <Box maxW={'100%'}>
                    <center>

                      <CarouselContainer>
                        <Carousel
                          ref={carouselRef}
                          responsive={responsive}
                          arrows
                          customLeftArrow={<CustomLeftArrow onClick={() => carouselRef.current?.previous()} />}
                          customRightArrow={<CustomRightArrow onClick={() => carouselRef.current?.next()} />}
                          containerClass="carousel-container"
                        >
                          {mediaItems.map((media, i) =>
                            media.type === "video" ? (
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
                                <video
                                  key={i}
                                  src={media.url}
                                  controls
                                  style={{
                                    width: "100%",
                                    maxWidth: "100%",
                                    aspectRatio: "16/9",
                                    border: "0",
                                    borderRadius: "8px",
                                    overflow: "hidden",
                                  }}
                                />
                              </Box>
                            ) : (
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
                                  src={media.url}
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
                            )
                          )}
                        </Carousel>
                      </CarouselContainer>
                    </center>

                  </Box>
                )}
              </>
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
            onClick={(e: any) => {
              e.stopPropagation();
              setIsEditModalOpen(true);
            }}
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
          onClick={(e: any) => {
            e.stopPropagation();
            setIsReplyModalOpen(true);
          }}
          aria-label="Comments"
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
            onClick={(e: any) => {
              e.stopPropagation();
              window.open(
                `/post/test/@${comment.author}/${comment.permlink}`,
                "_self"
              );
            }}
            cursor={"pointer"}
            mt={2}
          >
            ${getTotalPayout(comment)}
          </Text>
        </Tooltip>
      </Flex>

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
        commentReplies={commentReplies}
        visiblePosts={visiblePosts}
        setVisiblePosts={setVisiblePosts}
        username={username}
        handleVote={handleVote}
        shouldShowAllComments={shouldShowAllComments}
        isCommentFormVisible={isCommentFormVisible}
      />

    </Box>
  );
};


export default CommentItem;


