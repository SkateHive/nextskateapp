'use client';
import FullMag from "@/components/Magazine/test/fullMag";
import { Button, Flex } from "@chakra-ui/react";
import React from "react";

const CommunityMagPage = () => {
    const handleBackClick = () => {
        if (window) {
            window.history.back();
        }
    };

    return (
        <>
            <Flex>
                <Button m={2} colorScheme="green" variant={'outline'} onClick={handleBackClick}>
                    Back
                </Button>
            </Flex>
            <FullMag tag={[{ tag: 'hive-173115', limit: 33 }]} query="created" />
        </>
    );
};

export default CommunityMagPage;

