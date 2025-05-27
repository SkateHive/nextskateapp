import React from 'react';
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Button,
    VStack,
    HStack,
    Select,
    Text,
    Box,
    Divider,
    Badge,
    useColorModeValue
} from '@chakra-ui/react';

interface AirdropFilterModalProps {
    isOpen: boolean;
    onClose: () => void;
    sortOption: string;
    setSortOption: (value: string) => void;
    limit: number;
    setLimit: (value: number) => void;
    userCount: { total: number; limited: number };
    onConfirm: () => void;
}

const AirdropFilterModal: React.FC<AirdropFilterModalProps> = React.memo(({
    isOpen,
    onClose,
    sortOption,
    setSortOption,
    limit,
    setLimit,
    userCount,
    onConfirm
}) => {

    const getSortOptionLabel = (value: string) => {
        const labels: { [key: string]: string } = {
            'points': 'Points',
            'hp_balance': 'Hive Power',
            'hive_balance': 'Hive Balance',
            'hbd_savings_balance': 'HBD Savings',
            'post_count': 'Post Count',
            'has_voted_in_witness': 'Witness Voters',
            'gnars_balance': 'Gnars Balance',
            'skatehive_nft_balance': 'Skatehive NFTs',
            'airdrop_the_poor': '🍃 Airdrop the Poor'
        };
        return labels[value] || value;
    };

    const getDescription = (value: string) => {
        const descriptions: { [key: string]: string } = {
            'points': 'Users with the highest points on the platform',
            'hp_balance': 'Users with the most Hive Power (HP)',
            'hive_balance': 'Users with the highest Hive token balance',
            'hbd_savings_balance': 'Users with the most HBD in savings',
            'post_count': 'Most active content creators',
            'has_voted_in_witness': 'Users who have voted for witnesses (governance participants)',
            'gnars_balance': 'Users with the most Gnars NFTs',
            'skatehive_nft_balance': 'Users with the most SkateHive NFTs',
            'airdrop_the_poor': 'Users with low balances but valid wallets (total Hive value < 100, NFTs < 5, Gnars < 1)'
        };
        return descriptions[value] || '';
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
            <ModalOverlay bg="blackAlpha.800" />
            <ModalContent bg={"gray.900"} border="1px" borderColor={"green.500"} boxShadow='0 0 10px green'>
                <ModalHeader>       
                    <Text fontSize="xl" fontWeight="bold">
                        🎯 Configure Airdrop Filters
                    </Text>
                </ModalHeader>
                <ModalCloseButton />
                
                <ModalBody>
                    <VStack spacing={6} align="stretch">
                        <Box>
                            <Text fontSize="md" fontWeight="semibold" mb={3}>
                                Sort Recipients By:
                            </Text>
                            <Select 
                                value={sortOption} 
                                onChange={(e) => setSortOption(e.target.value)}
                                bg="green.50"
                                _dark={{ bg: "green.700" }}
                                size="lg"
                            >
                                <option value="points">Points</option>
                                <option value="hp_balance">Hive Power</option>
                                <option value="hive_balance">Hive Balance</option>
                                <option value="hbd_savings_balance">HBD Savings</option>
                                <option value="post_count">Post Count</option>
                                <option value="has_voted_in_witness">Witness Voters</option>
                                <option value="gnars_balance">Gnars Balance</option>
                                <option value="skatehive_nft_balance">Skatehive NFTs</option>
                                <option value="airdrop_the_poor">🍃 Airdrop the Poor</option>
                            </Select>
                            
                            {sortOption && (
                                <Box mt={3} p={3} bg="blue.50" _dark={{ bg: "yellow.300" }} borderRadius="md">
                                    <Text fontSize="sm" color="black" _dark={{ color: "black" }}>
                                        <strong>{getSortOptionLabel(sortOption)}:</strong> {getDescription(sortOption)}
                                    </Text>
                                </Box>
                            )}
                        </Box>

                        <Divider />

                        <Box>
                            <Text fontSize="md" fontWeight="semibold" mb={3}>
                                Number of Recipients:
                            </Text>
                            <Select 
                                value={limit} 
                                onChange={(e) => setLimit(Number(e.target.value))}
                                bg="green.50"
                                _dark={{ bg: "green.700" }}
                                size="lg"
                            >
                                <option value={10}>Top 10</option>
                                <option value={25}>Top 25</option>
                                <option value={50}>Top 50</option>
                                <option value={100}>Top 100</option>
                            </Select>
                        </Box>

                        <Divider />

                        <Box>
                            <Text fontSize="md" fontWeight="semibold" mb={3}>
                                Airdrop Preview:
                            </Text>
                            <HStack spacing={4} justify="center">
                                <VStack>
                                    <Text fontSize="sm" color="gray.600" _dark={{ color: "gray.400" }}>
                                        Total Eligible
                                    </Text>
                                    <Badge colorScheme="blue" fontSize="md" p={2}>
                                        {userCount.total} users
                                    </Badge>
                                </VStack>
                                <Text fontSize="lg" color="gray.400">→</Text>
                                <VStack>
                                    <Text fontSize="sm" color="gray.600" _dark={{ color: "gray.400" }}>
                                        Will Receive Airdrop
                                    </Text>
                                    <Badge colorScheme="green" fontSize="md" p={2}>
                                        {userCount.limited} users
                                    </Badge>
                                </VStack>
                            </HStack>
                            
                            {userCount.limited === 0 && (
                                <Box mt={3} p={3} bg="red.50" _dark={{ bg: "red.900" }} borderRadius="md">
                                    <Text fontSize="sm" color="red.700" _dark={{ color: "red.200" }} textAlign="center">
                                        ⚠️ No users match the current filter criteria
                                    </Text>
                                </Box>
                            )}
                        </Box>
                    </VStack>
                </ModalBody>

                <ModalFooter>
                    <HStack spacing={3}>
                        <Button 
                        variant="ghost" 
                        onClick={onClose} 
                        size="lg"
                        colorScheme="gray"
                        >
                            Cancel
                        </Button>
                        <Button 
                            colorScheme="green" 
                            onClick={onConfirm}
                            disabled={userCount.limited === 0}
                            size="lg"
                        >
                            Confirm Selection ({userCount.limited} users)
                        </Button>
                    </HStack>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
});

AirdropFilterModal.displayName = 'AirdropFilterModal';

export default AirdropFilterModal;
