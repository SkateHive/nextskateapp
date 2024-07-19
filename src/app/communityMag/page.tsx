'use client';
import FullMag from "@/components/Magazine/test/fullMag";
import { Box, Button, Flex } from "@chakra-ui/react";
import React from "react";

const CommunityMagPage = () => {
    const handleBackClick = () => {
        if (window) {
            window.location.href = '/';
        }
    };


    return (
        <>

            <FullMag tag={[{ tag: 'hive-173115', limit: 33 }]} query="created" />
            {/* <Box>
                <Button m={2} colorScheme="green" variant={'outline'} onClick={handleBackClick}>
                    Back
                </Button>
            </Box> */}
        </>
    );
};

export default CommunityMagPage;

