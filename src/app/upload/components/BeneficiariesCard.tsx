import { Box, Card, CardHeader, Progress, Text, VStack } from '@chakra-ui/react';
import React from 'react';

interface BeneficiaryForBroadcast {
    account: string;
    weight: string;
}

interface BeneficiariesCardProps {
    beneficiariesArray: BeneficiaryForBroadcast[];
}

const BeneficiariesCard: React.FC<BeneficiariesCardProps> = ({ beneficiariesArray }) => {
    return (
        <Card bg='darkseagreen' border="1px solid #A5D6A7">
            <CardHeader>
                <VStack spacing={4} align="stretch">
                    <Box>
                        <Text color={"black"}>
                            You - {100 - beneficiariesArray.reduce((acc, cur) => acc + Number(cur.weight), 0) / 100}%
                        </Text>
                        <Progress colorScheme="green" size="sm" value={100 - beneficiariesArray.reduce((acc, cur) => acc + Number(cur.weight), 0) / 100} />
                    </Box>
                    {beneficiariesArray.map((beneficiary, index) => (
                        <Box key={index}>
                            <Text color="black">
                                {beneficiary.account} - {Number(beneficiary.weight) / 100}%
                            </Text>
                            <Progress colorScheme="green" size="sm" value={Number(beneficiary.weight) / 100} />
                        </Box>
                    ))}
                </VStack>
            </CardHeader>
        </Card>
    );
};

export default BeneficiariesCard;
