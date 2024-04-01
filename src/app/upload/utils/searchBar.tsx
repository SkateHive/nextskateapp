import React, { useState, useEffect } from "react";
import { Input, Box, List, ListItem, Avatar, Text } from "@chakra-ui/react";
import { Client } from "@hiveio/dhive";

interface AuthorSearchBarProps {
    onSearch: (selectedUsername: string) => void;
}

const AuthorSearchBar: React.FC<AuthorSearchBarProps> = ({ onSearch }) => {
    const [username, setUsername] = useState("");
    const [authors, setAuthors] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const client = new Client(["https://api.hive.blog"]);

    const fetchAuthors = async (query: string) => {
        setIsLoading(true);
        try {
            const result = await client.database.call("lookup_accounts", [query, 10]);
            setAuthors(result);
        } catch (error) {
            console.error(error);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        if (username.trim() !== "") {
            fetchAuthors(username);
        } else {
            setAuthors([]);
        }
    }, [username]);

    const handleSearch = (selectedUsername: string) => {
        setUsername(selectedUsername);
        setAuthors([]);
        onSearch(selectedUsername);
    };

    return (
        <Box position="relative">
            <Input
                placeholder="Search by username..."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                borderColor={"green.600"}
                color={"limegreen"}
                _placeholder={{ color: "limegreen", opacity: 0.4 }}
                focusBorderColor="limegreen"
            />
            {isLoading ? (
                <div>Loading...</div>
            ) : (
                <List
                    position="absolute"
                    top="100%"
                    left="0"
                    right="0"
                    bg="white"
                    boxShadow="md"
                    zIndex="999"
                >
                    {authors.map((author) => (
                        <ListItem
                            key={author}
                            onClick={() => handleSearch(author)}
                            p={2}
                            cursor="pointer"
                            display="flex"
                            backgroundColor={"black"}
                            border="1px limegreen solid"
                            alignItems="center"
                            _hover={{ bg: "gray.100" }}
                        >
                            <Avatar
                                size="sm"
                                src={`https://images.ecency.com/webp/u/${author}/avatar/small`}
                                // @ts-ignore
                                alt="author"
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
