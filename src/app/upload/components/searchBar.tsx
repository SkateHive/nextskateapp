import {
    Avatar,
    Box,
    Input,
    InputGroup,
    InputLeftElement,
    List,
    ListItem,
    Spinner,
    Text,
} from "@chakra-ui/react";
import { Client } from "@hiveio/dhive";
import debounce from "lodash/debounce";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { FaSearch } from "react-icons/fa";

interface AuthorSearchBarProps {
    onSearch: (selectedUsername: string) => void;
}

const AuthorSearchBar: React.FC<AuthorSearchBarProps> = ({ onSearch }) => {
    const [username, setUsername] = useState("");
    const [authors, setAuthors] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isListVisible, setIsListVisible] = useState(false);
    const cacheRef = useRef<{ [key: string]: string[] }>({}); // Cache to store queries

    const client = useRef(new Client(["https://api.hive.blog"]))

    // Function to search for authors
    const fetchAuthors = async (query: string) => {
        if (!query) return;

        // Use cache if available
        if (cacheRef.current[query]) {
            setAuthors(cacheRef.current[query]);
            return;
        }

        setIsLoading(true);
        try {
            const sanitizedQuery = query.startsWith("@") ? query.slice(1) : query;
            const result = await client.current.database.call("lookup_accounts", [
                sanitizedQuery,
                5,
            ]);

            // Saves to cache and updates authors
            cacheRef.current[query] = result;

            // Update only if results are different
            setAuthors((prevAuthors) =>
                JSON.stringify(prevAuthors) !== JSON.stringify(result) ? result : prevAuthors
            );
        } catch (error) {
            console.error("Erro ao buscar autores:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const debouncedFetchAuthors = useCallback(
        debounce((search: string) => {
            fetchAuthors(search);
        }, 800),
        []
    );

    useEffect(() => {
        if (username.trim()) {
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

    const hideList = (event: MouseEvent) => {
        if (!containerRef.current?.contains(event.target as Node)) {
            setIsListVisible(false);
        }
    };
    const containerRef = useRef<HTMLDivElement>(null); // Ref to detect clicks outside the component

    useEffect(() => {
        document.addEventListener("mousedown", hideList);
        return () => {
            document.removeEventListener("mousedown", hideList);
        };
    }, []);

    return (
        <Box position="relative" ref={containerRef}>
            <InputGroup>
                {isLoading ? (
                    <InputLeftElement pointerEvents="none">
                        <Spinner color="#A5D6A7" />
                    </InputLeftElement>
                ) : (
                    <InputLeftElement pointerEvents="none">
                        <FaSearch color="#A5D6A7" />
                    </InputLeftElement>
                )}
                <Input
                    placeholder="Find a Skater/Photographer..."
                    value={username}
                    onChange={(e) => {
                        const value = e.target.value.replace(/^@/, "");
                        setUsername(value);
                        setIsListVisible(value.trim() !== ""); // Display list only if there is text
                    }}
                    borderColor="green.600"
                    color="#A5D6A7"
                    minW={{ base: "100%", md: "40%" }}
                    _placeholder={{ color: "#A5D6A7", opacity: 0.4 }}
                    focusBorderColor="#A5D6A7"
                />
            </InputGroup>

            {isListVisible && authors.length > 0 && (
                <List
                    position="absolute"
                    top="100%"
                    left={{ base: "0", md: "0" }}
                    right={{ base: "0", md: "0" }}
                    bg="white"
                    boxShadow="md"
                    zIndex="999"
                    width={{ base: "100%", md: "auto" }}
                >
                    {authors.map((author) => (
                        <ListItem
                            key={author}
                            onClick={() => {
                                handleSearch(author);
                                setIsListVisible(false);
                            }}
                            p={2}
                            cursor="pointer"
                            color={"#ABE4B8"}
                            display="flex"
                            backgroundColor={"black"}
                            alignItems="center"
                            _hover={{ bg: "#A5D6A7", color: "black" }}
                        >
                            <Avatar
                                borderRadius={"5px"}
                                size="sm"
                                src={`https://images.ecency.com/webp/u/${author}/avatar/small`}
                                mr={2}
                            />
                            <Text>{author}</Text>
                        </ListItem>
                    ))}
                </List>
            )}
        </Box>
    );
};

export default AuthorSearchBar;
