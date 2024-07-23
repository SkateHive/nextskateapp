import { Badge, Flex } from '@chakra-ui/react';
import React from 'react';

interface TagsProps {
    tags: string[];
}

const Tags: React.FC<TagsProps> = ({ tags }) => {
    return (
        <Flex flexWrap="wrap">
            {tags.map((tag, index) => (
                <Badge key={index} colorScheme="green" variant="solid" fontSize={'6px'} m={1}>
                    {tag}
                </Badge>
            ))}
        </Flex>
    );
};

export default Tags;
