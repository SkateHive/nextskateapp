import { Table, Td, Th } from '@chakra-ui/react';
import React from 'react';
import Tags from './Tags';

interface TagsTableProps {
    tags: string[];
}

const TagsTable: React.FC<TagsTableProps> = ({ tags }) => (
    <Table>
        <Th>Tags</Th>
        <Td>
            <Tags tags={tags} />
        </Td>
    </Table>
);

export default TagsTable;
