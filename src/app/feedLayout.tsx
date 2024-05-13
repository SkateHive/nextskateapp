'use client'
import React from "react";
import Feed from "@/components/Feed";
import { Box } from "@chakra-ui/react";
const FeedLayout = () => {
    const [isHomePage, setIsHomePage] = React.useState(false);

    React.useEffect(() => {
        // Assuming homepage is the root URL '/'
        setIsHomePage(window.location.pathname === '/');
    }, []);

    return (
        <Box>
            {isHomePage &&
                <Box className="hide-on-mobile" maxW={"400px"} width={"100%"}>

                    <Feed />
                </Box>
            }
        </Box>
    );
}

export default FeedLayout;
