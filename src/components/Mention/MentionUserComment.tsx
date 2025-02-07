import {
    Avatar,
    Box,
    List,
    ListItem,
    Spinner,
    Text,
    Textarea,
} from "@chakra-ui/react";
import debounce from "lodash/debounce";
import React, { forwardRef, useCallback, useEffect, useRef, useState } from "react";

interface MentionCommentProps {
    value?: string;
    children?: React.ReactNode;
    onCommentChange?: (comment: string) => void;
    onCommentSubmit?: React.Dispatch<React.SetStateAction<string>>;
    placeholder?: string;
    isLoading?: boolean;
    onPaste?: React.ClipboardEventHandler<HTMLTextAreaElement>;
    textareaProps?: React.TextareaHTMLAttributes<HTMLTextAreaElement>;
    ref?: React.RefObject<HTMLTextAreaElement>;
    overflow?: string;
    resize?: "none" | "both" | "horizontal" | "vertical";
    _focus?: { border: string; boxShadow: string };
    bg?: string;
    minHeight?: string;
    borderRadius?: string;
    border?: string;
    background?: string;
    _placeholder?: { fontSize: string | undefined; color: string; }
    width?: {
        base: string;
        md: string;
    }
    ml?: {
        base: number;
        md: number;
    }
    mb?: {
        base: number;
        md: number;
    }
}

const MentionComment = forwardRef<HTMLTextAreaElement, MentionCommentProps>(({
    onCommentChange,
    placeholder,
    isLoading,
    border,
    borderRadius,
    _focus,
    minHeight,
    overflow,
    resize,
    _placeholder,
    width,
    ml,
    mb,
}, ref) => {
    const [comment, setComment] = useState("");
    const [authors, setAuthors] = useState<string[]>([]);
    const [isListVisible, setIsListVisible] = useState(false);
    const [mentionIndex, setMentionIndex] = useState<number | null>(null);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const cacheRef = useRef<{ [key: string]: string[] }>({});
    const [localIsLoading, setLocalIsLoading] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const shadowRef = useRef<HTMLDivElement>(null);

    const fetchAuthors = async (query: string) => {
        if (!query) return;
        if (query.length > 16) query = query.slice(0, 16);

        if (cacheRef.current[query]) {
            setAuthors(cacheRef.current[query]);
            return;
        }

        setLocalIsLoading(true);
        try {
            const response = await fetch("https://api.skatehive.app/api/skatehive");
            if (!response.ok) throw new Error("Error searching for authors");

            const users = await response.json();
            const sanitizedQuery = query.startsWith("@") ? query.slice(1) : query;

            // Filter users that start with the query entered
            const filteredAuthors = users
                .filter((user: any) => user.hive_author.toLowerCase().startsWith(sanitizedQuery.toLowerCase()))
                .map((user: any) => user.hive_author)
                .slice(0, 5);

            cacheRef.current[query] = filteredAuthors;
            setAuthors(filteredAuthors);
        } catch (error) {
            console.error("Error searching for authors:", error);
        } finally {
            setLocalIsLoading(false);
        }
    };


    const debouncedFetchAuthors = useCallback(
        debounce((search: string) => fetchAuthors(search), 300),
        []
    );

    useEffect(() => {
        const match = comment.match(/@([a-zA-Z0-9!_\-]*)$/);
        if (match) {
            setMentionIndex(match.index ?? null);
            debouncedFetchAuthors(match[1]);
            setIsListVisible(true);
        } else {
            setAuthors([]);
            setIsListVisible(false);
        }
    }, [comment, debouncedFetchAuthors]);

    const handleSelectUser = (username: string) => {
        if (mentionIndex !== null) {
            const beforeMention = comment.substring(0, mentionIndex);
            const afterMention = comment.substring(mentionIndex).replace(/@\S*/, `@${username} `);
            const newComment = beforeMention + afterMention;

            setComment(newComment);
            setIsListVisible(false);
            setSelectedIndex(0);
            onCommentChange?.(newComment);
        }
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (isListVisible) {
            if (event.key === "ArrowDown") {
                event.preventDefault();
                setSelectedIndex((prev) => (prev + 1) % authors.length);
            } else if (event.key === "ArrowUp") {
                event.preventDefault();
                setSelectedIndex((prev) => (prev - 1 + authors.length) % authors.length);
            } else if (event.key === "Enter") {
                event.preventDefault();
                if (authors[selectedIndex]) {
                    handleSelectUser(authors[selectedIndex]);
                }
            }
        }
    };

    useEffect(() => {
        if (shadowRef.current && textareaRef.current) {
            shadowRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [comment]);

    const highlightMentions = (text: string) => {
        return text.split(/(@[a-zA-Z0-9!_\-]+)/g).map((part, index) => {
            if (part.startsWith("@")) {
                return (
                    <span key={index} style={{ color: "limegreen", fontWeight: "bold" }}>
                        {part}
                    </span>
                );
            }
            return part;
        });
    };

    return (
        <Box position="relative" width="100%">
            <Textarea
                ref={ref}
                value={comment}
                onChange={(e) => {
                    const newComment = e.target.value;
                    setComment(newComment);
                    onCommentChange?.(newComment);
                }}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                bg="transparent"
                _focus={_focus}
                resize={resize ?? "none"}
                minHeight={minHeight}
                borderRadius={borderRadius}
                border={border}
                overflow={overflow}
                width={width ?? { base: "100%", md: "100%" }}
                ml={ml ?? 0}
                mb={mb ?? 4}
                _placeholder={_placeholder}
                padding="15px"
                fontSize="16px"
                lineHeight="1.5"
                style={{
                    backgroundColor: "transparent",
                    color: "transparent",
                    caretColor: "white",
                }}
            />

            <Box
                ref={shadowRef}
                position="absolute"
                top="0"
                left="0"
                padding="15px"
                width="100%"
                minHeight={minHeight}
                background="black"
                pointerEvents="none"
                fontSize="16px"
                lineHeight="1.5"
                whiteSpace="pre-wrap"
                wordBreak="break-word"
                overflow="hidden"
                color="white"
            >
                {comment ? highlightMentions(comment) : (
                    <Text color="gray.500">{placeholder}</Text>
                )}
            </Box>

            {isListVisible && authors.length > 0 && (
                <List
                    position="absolute"
                    top="100%"
                    left={0}
                    bg="white"
                    boxShadow="md"
                    zIndex="999"
                    width="100%"
                    borderRadius="md"
                    border="1px solid #ddd"
                    maxHeight="200px"
                    overflowY="auto"
                >
                    {isLoading || localIsLoading ? (
                        <Spinner color="#A5D6A7" />
                    ) : (
                        authors.map((author, index) => (
                            <ListItem
                                key={author}
                                onMouseEnter={() => setSelectedIndex(index)}
                                onMouseDown={(e) => {
                                    e.preventDefault();
                                    handleSelectUser(author);
                                }}
                                p={2}
                                cursor="pointer"
                                display="flex"
                                backgroundColor={index === selectedIndex ? "#2C3E50" : "black"}
                                alignItems="center"
                                transition="background 0.2s"
                                color="white"
                            >
                                <Avatar
                                    src={`https://images.hive.blog/u/${author}/avatar`}
                                    name={author}
                                    size="sm"
                                    mr={2}
                                />

                                <Text fontSize="14px">{author}</Text>
                            </ListItem>
                        ))
                    )}
                </List>
            )}
        </Box>
    );
});

MentionComment.displayName = "MentionComment";

export default MentionComment;

