import React, { useCallback, useEffect, useRef, useState } from "react";
import { Avatar, List, ListItem, Spinner, Text } from "@chakra-ui/react";
import debounce from "lodash/debounce";
import HiveClient from "@/lib/hive/hiveclient";

const MentionListComponent = ({ comment, setComment, isListVisible, setIsListVisible, authors, setAuthors, selectedIndex, setSelectedIndex, isLoading, localIsLoading, setLocalIsLoading, mentionIndex, setMentionIndex, onCommentChange }: any) => {
    const client = HiveClient;
    const cacheRef = useRef<{ [key: string]: string[] }>({});

    const fetchAuthors = async (query: string) => {
        if (!query) return;
        if (query.length > 16) query = query.slice(0, 16);
        if (cacheRef.current[query]) {
            setAuthors(cacheRef.current[query]);
            return;
        }
        setLocalIsLoading(true);
        try {
            const sanitizedQuery = query.startsWith("@") ? query.slice(1) : query;
            const result = await client.database.call("lookup_accounts", [sanitizedQuery, 5]);
            cacheRef.current[query] = result;
            setAuthors(result);
        } catch (error) {
            console.error("Error fetching authors:", error);
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
                setSelectedIndex((prev: number) => (prev + 1) % authors.length);
            } else if (event.key === "ArrowUp") {
                event.preventDefault();
                setSelectedIndex((prev: number) => (prev - 1 + authors.length) % authors.length);
            } else if (event.key === "Enter") {
                event.preventDefault();
                if (authors[selectedIndex]) {
                    handleSelectUser(authors[selectedIndex]);
                }
            }
        }
    };

    return (
        isListVisible && authors.length > 0 && (
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
                    authors.map((author: string, index: number) => (
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
        )
    );
};

export default MentionListComponent;
