import { Table, Tbody, Td, Th, Thead, Tr } from '@chakra-ui/react';
import React from 'react';
import BeneficiariesCard from './BeneficiariesCard';

interface BeneficiariesTableProps {
    beneficiariesArray: any[];
}

const BeneficiariesTable: React.FC<BeneficiariesTableProps> = ({ beneficiariesArray }) => (
    <Table>
        <Thead>
            <Tr>
                <Th>Beneficiaries</Th>
            </Tr>
        </Thead>
        <Tbody>
            <Tr>
                <Td>
                    <BeneficiariesCard beneficiariesArray={beneficiariesArray} />
                </Td>
            </Tr>
        </Tbody>
    </Table>
);

export default BeneficiariesTable;
