import Zine from "@/components/Magazine/test/page";
import { Flex } from "@chakra-ui/react";
import React from "react";

const CommunityMagPage = () => {
    return (
        <Zine tag={[{ tag: 'hive-173115', limit: 33 }]} query="created" />
    )
}

export default CommunityMagPage;