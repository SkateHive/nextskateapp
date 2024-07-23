import { Center, Table, Tbody, Td, Th, Thead, Tr } from '@chakra-ui/react';
import React from 'react';
import Tags from './Tags';

interface TagsTableProps {
    tags: string[];
}

const TagsTable: React.FC<TagsTableProps> = ({ tags }) => (
    <Table>
        <Thead >
            <Tr>
                <Th color={'white'}><Center> Tags</Center> </Th>
            </Tr>
        </Thead>
        <Tbody>
            <Tr>
                <Td>
                    <Tags tags={tags} />
                </Td>
            </Tr>
        </Tbody>
    </Table>
);

export default TagsTable;
