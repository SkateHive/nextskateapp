import React from 'react';
import { Box, HStack, VStack, Badge, Text, Table, Thead, Tr, Th, Tbody, Td, Image } from '@chakra-ui/react';
import { DataBaseAuthor } from './LeaderboardTable';
import { FormattedAddress } from '../NNSAddress';
import { formatNumber } from '@/components/Leaderboard/LeaderboardTable';
import { FaServer } from 'react-icons/fa';
import { FaPencil } from 'react-icons/fa6';
import { formatDate } from '@/lib/utils';
import AuthorAvatar from '../AuthorAvatar';
import { witnessVoteWithKeychain, witnessVoteWithPrivateKey } from "@/lib/hive/client-functions";

interface ConnectedUserBannerProps {
    connectedUser: string;
    userRanking: number;
    userData: DataBaseAuthor;
    openModal: (title: string, content: string, actionText: string, onAction: () => void, data: DataBaseAuthor) => void;
}

const ThComponent: React.FC<{ title: string; icon?: JSX.Element; imageSrc?: string; onClick: () => void }> = ({ title, icon, imageSrc, onClick }) => (
    <Th color="white" textAlign="center" display={['none', 'table-cell']}
        _hover={{ cursor: 'pointer' }}
        onClick={onClick}
    >
        <VStack _hover={{ transform: 'scale(1.1)' }} >
            {icon ? icon : <Image src={imageSrc} alt={title} boxSize={6} _hover={{ transform: 'scale(1.1)' }} />}
            <Text fontSize="xs">{title}</Text>
        </VStack>
    </Th>
);

// TODO: send all references to this fucntion to utils 
const handleWitnessVote = (connectedUser: string) => {
    // lets check which loginmethod the user used 
    const loginMethod = localStorage.getItem("LoginMethod");
    if (loginMethod === "keychain") {
        witnessVoteWithKeychain(connectedUser, "skatehive");
    }
    else if (loginMethod === "privateKey") {
        witnessVoteWithPrivateKey(connectedUser, "skatehive", true);
    }
}


const ConnectedUserBanner: React.FC<ConnectedUserBannerProps> = ({ connectedUser, userRanking, userData, openModal }) => {
    return (
        <Box
            mb={5}
            p={5}
            bg="gray.900"
            borderRadius="md"
            border="2px solid"
            borderColor='green.500'
            boxShadow='0 0 10px green'
        >
            <HStack spacing={4} alignItems="center" mb={4} justifyContent={['center', 'space-between']}>
                <HStack>
                    <AuthorAvatar username={connectedUser} borderRadius={9999} />
                    <VStack align="start" spacing={-2}>
                        <Box position="relative">
                            <Badge
                                position="absolute"
                                top={7}
                                right={-1}
                                bg="gold"
                                borderRadius={9999}
                                color="black"
                                px={1}
                                py={0.5}
                                fontSize="xs"
                                fontWeight="bold"
                                shadow="md"
                            >
                                {`#${userRanking}`}
                            </Badge>
                        </Box>
                        <Box ml={1} color="lightgreen">
                            <Text fontSize="xl" fontWeight="bold" color="white">
                                {connectedUser}
                            </Text>
                            <FormattedAddress address={userData.eth_address} />
                        </Box>
                    </VStack>
                </HStack>
                <Text fontSize="xl" color="white">
                    {formatNumber(userData.points)} 🔥
                </Text>
            </HStack>
            <Box overflowX="auto">
                <Table size="sm" variant="ghost" colorScheme="gray" whiteSpace="nowrap">
                    <Thead>
                        <Tr>
                            <ThComponent
                                title="Power"
                                imageSrc="/logos/hp_logo.png"
                                onClick={() => openModal(
                                    'Power',
                                    'Power is the total amount of Hive Power (HP) owned by the user.',
                                    'Power UP', () => { }, userData)}
                            />
                            <ThComponent
                                title="Voted Witness"
                                icon={<FaServer size={20} />}
                                onClick={() => openModal(
                                    'Voted Witness',
                                    'Voted Witness is a boolean value indicating whether the user has voted for a witness or not.',
                                    'Vote Witness', () => handleWitnessVote(userData.hive_author), userData)}
                            />
                            <ThComponent
                                title="Last Post"
                                icon={<FaPencil size={20} />}
                                onClick={() => openModal(
                                    'Last Post',
                                    'Last Post is the date of the last post made by the user.',
                                    'Create Post', () => { }, userData)}
                            />
                            <ThComponent
                                title="SKTHV Art"
                                imageSrc="/skatehive_square_green.png"
                                onClick={() => openModal(
                                    'SKTHV Art',
                                    'SKTHV Art is the total amount of Skatehive NFTs owned by the user.',
                                    'Buy SKTHV Art', () => { }, userData)}
                            />
                            <ThComponent
                                title="Gnars Votes"
                                imageSrc="/logos/gnars_logo.png"
                                onClick={() => openModal(
                                    'Buy Gnars',
                                    'Gnars Votes is the total amount of Gnars Votes owned by the user.',
                                    'Vote Gnars', () => { }, userData)}
                            />
                            <ThComponent
                                title="Giveth Donations"
                                imageSrc="/logos/giveth_logo.png"
                                onClick={() => openModal(
                                    'Giveth Donations',
                                    'Giveth Donations is the total amount of Giveth Donations made by the user.',
                                    'Donate', () => { }, userData)}
                            />
                            <ThComponent
                                title="HBD Savings"
                                imageSrc="https://i.ibb.co/rMVdTYt/savings-hive.png"
                                onClick={() => openModal(
                                    'HBD Savings',
                                    'HBD Savings is the total amount of HBD Savings owned by the user.',
                                    'View Savings', () => { }, userData)}
                            />
                            <ThComponent
                                title="Hive Balance"
                                imageSrc="/logos/hiveLogo.png"
                                onClick={() => openModal(
                                    'Hive Balance',
                                    'Hive Balance is the total amount of Hive owned by the user.',
                                    'Buy hive', () => { }, userData)}
                            />
                        </Tr>
                    </Thead>
                    <Tbody>
                        <Tr>
                            <Td color={(userData.hp_balance ?? 0) > 2000 ? 'lightgreen' : (userData.hp_balance ?? 0) >= 500 ? 'khaki' : 'lightcoral'} textAlign="center">
                                {formatNumber(userData.hp_balance)}
                            </Td>
                            <Td color={userData.has_voted_in_witness ? 'lightgreen' : 'lightcoral'} textAlign="center" display={['none', 'table-cell']}>
                                {userData.has_voted_in_witness ? 'Yes' : 'No'}
                            </Td>
                            <Td color={(userData.gnars_votes ?? 0) > 10 ? 'lightgreen' : (userData.gnars_votes ?? 0) > 0 ? 'khaki' : 'lightcoral'} textAlign="center" display={['none', 'table-cell']}>
                                {formatNumber(userData.gnars_votes)}
                            </Td>
                            <Td color={(userData.skatehive_nft_balance ?? 0) > 10 ? 'lightgreen' : (userData.skatehive_nft_balance ?? 0) > 0 ? 'khaki' : 'lightcoral'} textAlign="center" display={['none', 'table-cell']}>
                                {formatNumber(userData.skatehive_nft_balance)}
                            </Td>
                            <Td color={userData.last_post && new Date(userData.last_post) < new Date(new Date().setFullYear(new Date().getFullYear() - 1)) ? 'lightcoral' : 'lightgreen'} textAlign="center" display={['none', 'table-cell']}>
                                {formatDate(String(userData.last_post))}
                            </Td>
                            <Td color={(userData.giveth_donations_usd ?? 0) > 500 ? 'lightgreen' : (userData.giveth_donations_usd ?? 0) >= 100 ? 'khaki' : 'lightcoral'} textAlign="center" display={['none', 'table-cell']}>
                                {formatNumber(userData.giveth_donations_usd)}
                            </Td>
                            <Td color={(userData.hbd_savings_balance ?? 0) > 500 ? 'lightgreen' : (userData.hbd_savings_balance ?? 0) >= 100 ? 'khaki' : 'lightcoral'} textAlign="center" display={['none', 'table-cell']}>
                                {formatNumber(userData.hbd_savings_balance)}
                            </Td>
                            <Td color={(userData.hive_balance ?? 0) > 500 ? 'lightgreen' : (userData.hive_balance ?? 0) >= 100 ? 'khaki' : 'lightcoral'} textAlign="center" display={['none', 'table-cell']}>
                                {formatNumber(userData.hive_balance)}
                            </Td>
                        </Tr>
                    </Tbody>
                </Table>
            </Box>
        </Box>
    );
};

export default ConnectedUserBanner;
