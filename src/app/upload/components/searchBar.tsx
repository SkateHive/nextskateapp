import React, { useState, useRef, useEffect, useCallback } from "react";
import {
    Box, InputGroup, InputLeftElement, Spinner, Input, List, ListItem, Avatar, Text
} from '@chakra-ui/react';
import { Client } from "@hiveio/dhive";
import debounce from 'lodash/debounce';
import { FaSearch } from "react-icons/fa";

interface AuthorSearchBarProps {
    onSearch: (selectedUsername: string) => void;
}

const AuthorSearchBar: React.FC<AuthorSearchBarProps> = ({ onSearch }) => {
    const [username, setUsername] = useState("");
    const [authors, setAuthors] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const client = new Client(["https://api.hive.blog"]);
    const [isListVisible, setIsListVisible] = useState(false);

    const fetchAuthors = async (query: string) => {
        if (!query) return; // Early return if query is empty
        setIsLoading(true);
        try {
            const result = await client.database.call("lookup_accounts", [query, 5]);
            setAuthors(result);
        } catch (error) {
            console.error(error);
        }
        setIsLoading(false);
    };

    // Create a debounced function using useCallback to ensure it doesn't get recreated on each render
    const debouncedFetchAuthors = useCallback(debounce((search: string) => {
        fetchAuthors(search);
    }, 800), []); // Dependency array is empty, so the function is created only once

    useEffect(() => {
        if (username.trim() !== "") {
            debouncedFetchAuthors(username);
        } else {
            setAuthors([]);
        }
    }, [username, debouncedFetchAuthors]);

    const handleSearch = (selectedUsername: string) => {
        setUsername(selectedUsername);
        setAuthors([]);
        onSearch(selectedUsername);
    };
    // Handler for hiding the list
    const containerRef = useRef<HTMLDivElement>(null);

    const hideList = (event: MouseEvent) => {
        if (!containerRef.current?.contains(event.target as Node)) {
            setIsListVisible(false);
        }
    };


    // Effect to add and remove the event listener
    useEffect(() => {
        document.addEventListener('mousedown', hideList);
        return () => {
            document.removeEventListener('mousedown', hideList);
        };
    }, []);
    return (
        <Box position="relative" ref={containerRef}>
            <InputGroup>
                {isLoading ? (
                    <InputLeftElement pointerEvents="none">
                        <Spinner color="limegreen" />
                    </InputLeftElement>
                ) : (
                    <InputLeftElement pointerEvents="none">
                        <FaSearch color="limegreen" />
                    </InputLeftElement>
                )}
                <Input
                    placeholder="Find a Skater/Photographer..."
                    value={username}
                    onChange={(e) => {
                        setUsername(e.target.value);
                        setIsListVisible(true);
                    }}
                    borderColor="green.600"
                    color="limegreen"
                    _placeholder={{ color: "limegreen", opacity: 0.4 }}
                    focusBorderColor="limegreen"
                />
            </InputGroup>

            {isListVisible && (
                <List position="absolute" top="100%" left="0" right="0" bg="white" boxShadow="md" zIndex="999">
                    {authors.map((author) => (
                        <ListItem
                            key={author}
                            onClick={() => {
                                handleSearch(author);
                                setIsListVisible(false);
                            }}
                            p={2}
                            cursor="pointer"
                            display="flex"
                            backgroundColor={"black"}
                            alignItems="center"
                            _hover={{ bg: "limegreen", color: "black" }}
                        >
                            <Avatar borderRadius={"5px"} size="sm" src={`https://images.ecency.com/webp/u/${author}/avatar/small`} mr={2} />
                            <Text>{author}</Text>
                        </ListItem>
                    ))}
                </List>
            )}
        </Box>
    );
};

export default AuthorSearchBar;
