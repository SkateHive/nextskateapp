'use client';

import React from 'react';
import { Box, Text, VStack, HStack, Badge, Collapse, useDisclosure } from '@chakra-ui/react';
import { AirdropStats } from './AirdropManager';

interface AirdropDebugStatsProps {
    stats: AirdropStats;
    sortOption: string;
    limit: number;
}

export const AirdropDebugStats: React.FC<AirdropDebugStatsProps> = ({ 
    stats, 
    sortOption, 
    limit 
}) => {
    const { isOpen, onToggle } = useDisclosure();

    const getFilterReduction = (before: number, after: number) => {
        if (before === 0) return '0%';
        const reduction = ((before - after) / before * 100).toFixed(1);
        return `-${reduction}%`;
    };

    return (
        <Box 
            bg="gray.900" 
            border="1px solid" 
            borderColor="gray.600" 
            borderRadius="md" 
            p={4} 
            mb={4}
            onClick={onToggle}
            cursor="pointer"
            _hover={{ bg: "gray.800" }}
        >
            <HStack justify="space-between" mb={2}>
                <Text color="yellow.400" fontWeight="bold" fontSize="sm">
                    🔍 Airdrop Debug Stats (Click to {isOpen ? 'hide' : 'expand'})
                </Text>
                <Badge colorScheme="green" fontSize="xs">
                    {stats.limitedUsers} final users
                </Badge>
            </HStack>
            
            <Collapse in={isOpen}>
                <VStack align="stretch" spacing={2} mt={3}>
                    <HStack justify="space-between">
                        <Text color="gray.300" fontSize="xs">Sort Option:</Text>
                        <Badge colorScheme="blue" fontSize="xs">{sortOption}</Badge>
                    </HStack>
                    
                    <HStack justify="space-between">
                        <Text color="gray.300" fontSize="xs">Limit:</Text>
                        <Badge colorScheme="purple" fontSize="xs">{limit}</Badge>
                    </HStack>
                    
                    <Box borderTop="1px solid" borderColor="gray.600" pt={2}>
                        <Text color="gray.300" fontSize="xs" fontWeight="bold" mb={2}>
                            Filtering Pipeline:
                        </Text>
                        
                        <VStack align="stretch" spacing={1}>
                            <HStack justify="space-between">
                                <Text color="gray.400" fontSize="xs">1. Initial Users:</Text>
                                <Badge colorScheme="gray" fontSize="xs">{stats.totalUsers}</Badge>
                            </HStack>
                            
                            {stats.afterSpecialFilter !== stats.totalUsers && (
                                <HStack justify="space-between">
                                    <Text color="gray.400" fontSize="xs">2. After Special Filter:</Text>
                                    <HStack>
                                        <Badge colorScheme="orange" fontSize="xs">
                                            {stats.afterSpecialFilter}
                                        </Badge>
                                        <Text color="red.400" fontSize="xs">
                                            {getFilterReduction(stats.totalUsers, stats.afterSpecialFilter)}
                                        </Text>
                                    </HStack>
                                </HStack>
                            )}
                            
                            <HStack justify="space-between">
                                <Text color="gray.400" fontSize="xs">3. After Username Check:</Text>
                                <HStack>
                                    <Badge colorScheme="orange" fontSize="xs">
                                        {stats.afterUsernameValidation}
                                    </Badge>
                                    <Text color="red.400" fontSize="xs">
                                        {getFilterReduction(stats.afterSpecialFilter || stats.totalUsers, stats.afterUsernameValidation)}
                                    </Text>
                                </HStack>
                            </HStack>
                            
                            <HStack justify="space-between">
                                <Text color="gray.400" fontSize="xs">4. After ETH Check:</Text>
                                <HStack>
                                    <Badge colorScheme="orange" fontSize="xs">
                                        {stats.afterEthValidation}
                                    </Badge>
                                    <Text color="red.400" fontSize="xs">
                                        {getFilterReduction(stats.afterUsernameValidation, stats.afterEthValidation)}
                                    </Text>
                                </HStack>
                            </HStack>
                            
                            <HStack justify="space-between">
                                <Text color="gray.400" fontSize="xs">5. Final Valid Users:</Text>
                                <Badge colorScheme="green" fontSize="xs">
                                    {stats.finalFilteredUsers}
                                </Badge>
                            </HStack>
                            
                            <HStack justify="space-between">
                                <Text color="gray.400" fontSize="xs" fontWeight="bold">6. After Limit Applied:</Text>
                                <Badge colorScheme="green" fontSize="xs" fontWeight="bold">
                                    {stats.limitedUsers}
                                </Badge>
                            </HStack>
                        </VStack>
                        
                        <Box mt={3} p={2} bg="gray.800" borderRadius="sm">
                            <Text color="green.400" fontSize="xs" fontWeight="bold">
                                Success Rate: {stats.totalUsers > 0 ? ((stats.limitedUsers / stats.totalUsers) * 100).toFixed(1) : 0}%
                            </Text>
                            <Text color="gray.400" fontSize="xs">
                                ({stats.limitedUsers} users selected from {stats.totalUsers} total)
                            </Text>
                        </Box>
                    </Box>
                </VStack>
            </Collapse>
        </Box>
    );
};
