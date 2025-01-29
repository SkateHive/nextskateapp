import React from 'react';
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, Button, Table, Thead, Tbody, Tr, Th, Td, Center, Text } from '@chakra-ui/react';
import { formatDate } from '@/lib/utils';
import { DataBaseAuthor } from '@/components/Leaderboard/LeaderboardTable';
import useHiveBalance from '@/hooks/useHiveBalance';
import { useHiveUser } from '@/contexts/UserContext';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    content: string;
    actionText: string;
    onAction: () => void;
    data: DataBaseAuthor;
}

const InfoBox: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <code
        style={{
            display: 'block',
            whiteSpace: 'pre-wrap',
            overflowWrap: 'break-word',
            wordWrap: 'break-word',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            padding: '10px',
            borderRadius: '5px',
        }}>
        {children}
    </code>
);

const getColorByValue = (value: number, highThreshold: number, lowThreshold: number): string => {
    if (value >= highThreshold) {
        return 'lightgreen';
    } else if (value >= lowThreshold) {
        return 'yellow';
    } else {
        return 'lightcoral';
    }
};

const LeaderboardModal: React.FC<ModalProps> = ({ isOpen, onClose, title, content, actionText, onAction, data }) => {
    const hiveUser = useHiveUser();
    const { hiveUsdValue, totalHP } = useHiveBalance(hiveUser.hiveUser);

    const handleActionClick = () => {
        if (title === 'HP Balance' && actionText === 'Power UP') {
            console.log('Powering up HP');
        } else {
            onAction();
        }
    };

    const renderContent = (): JSX.Element => {
        switch (title) {
            case 'Hive Balance':
                return (
                    <div>
                        <InfoBox>
                            Hive is the main currency of the Skatehive, powering the Skatehive ecosystem.
                            It’s a liquid currency you earn for sharing skate content and receiving upvotes (likes).
                            Hive can be traded into Dollars or Bitcoin or powered up to increase your influence,
                            enabling skaters to support each other and thrive together.
                        </InfoBox>
                        <br />
                        <p>
                            You own
                            <span
                                style={{
                                    color: getColorByValue(data.hive_balance ?? 0, 1000, 500),
                                    fontWeight: 'bold',
                                    textShadow: `0 0 5px ${getColorByValue(data.hive_balance ?? 0, 1000, 500)}`
                                }}
                            >
                                {data.hive_balance}
                            </span>
                            that is worth
                            <span
                                style={{
                                    color: getColorByValue(Number(hiveUsdValue), 1000, 500),
                                    fontWeight: 'bold',
                                    textShadow: `0 0 5px ${getColorByValue(Number(hiveUsdValue), 1000, 500)}`
                                }}
                            >
                                {Number(hiveUsdValue).toFixed(2)} USD
                            </span>.
                        </p>
                        <br />
                        <Table variant="simple" size="sm">
                            <Thead>
                                <Tr>
                                    <Th>Action</Th>
                                    <Th>Points</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                <Tr>
                                    <Td>0.1 points per Hive</Td>
                                    <Td>Points capped at 1,000 Hive</Td>
                                </Tr>
                            </Tbody>
                        </Table>
                    </div>
                );
            case 'HP Balance':
                return (
                    <div>
                        <InfoBox>
                            Hive Power or POWER! represents your stake and influence on the Hive blockchain.
                            When you power up Hive into HP, you gain the ability to cast stronger upvotes,
                            which directly impacts the rewards other skaters receive for their content.
                            The more HP you have, the more weight your actions carry in the community.
                            For Skatehive users, powering up means becoming an active supporter of the skateboarding culture,
                            with increased opportunities to shape and grow the community.

                        </InfoBox>
                        <br />
                        <Center>
                            <Text>
                                You own <span style={{ color: getColorByValue(data.hp_balance ?? 0, 12000, 2000), fontWeight: 'bold', textShadow: `0 0 5px ${getColorByValue(data.hp_balance ?? 0, 12000, 2000)}` }}>{data.hp_balance}</span> HP and you control <span style={{ color: getColorByValue(totalHP ?? 0, 12000, 2000), fontWeight: 'bold', textShadow: `0 0 5px ${getColorByValue(totalHP ?? 0, 12000, 2000)}` }}>{totalHP}</span> HP.
                            </Text>
                        </Center>
                        <br />
                        <Table variant="simple" size="sm">
                            <Thead>
                                <Tr>
                                    <Th>Action</Th>
                                    <Th>Points</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                <Tr>
                                    <Td>0.5 points per HP</Td>
                                    <Td>Points capped at 12,000 HP (maximum 6,000 points)</Td>
                                </Tr>
                            </Tbody>
                        </Table>
                    </div>
                );
            case 'Gnars Votes':
                return (
                    <div>
                        <InfoBox>
                            Gnars Votes represent your voting power in the Gnars DAO.
                        </InfoBox>
                        <br />
                        <p>
                            You have <span style={{ color: getColorByValue(data.gnars_votes ?? 0, 10, 5), fontWeight: 'bold', textShadow: `0 0 5px ${getColorByValue(data.gnars_votes ?? 0, 10, 5)}` }}>{data.gnars_votes}</span> Gnars Votes.
                        </p>
                        <br />
                        <Table variant="simple" size="sm">
                            <Thead>
                                <Tr>
                                    <Th>Action</Th>
                                    <Th>Points</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                <Tr>
                                    <Td>30 points per Gnars Vote</Td>
                                    <Td></Td>
                                </Tr>
                            </Tbody>
                        </Table>
                    </div>
                );
            case 'SKTHV NFTs':
                return (
                    <div>
                        <InfoBox>
                            Skatehive NFTs represent your ownership of unique digital assets in the Skatehive ecosystem.
                        </InfoBox>
                        <br />
                        <p>
                            You own <span style={{ color: getColorByValue(data.skatehive_nft_balance ?? 0, 10, 5), fontWeight: 'bold', textShadow: `0 0 5px ${getColorByValue(data.skatehive_nft_balance ?? 0, 10, 5)}` }}>{data.skatehive_nft_balance}</span> Skatehive NFTs.
                        </p>
                        <br />
                        <Table variant="simple" size="sm">
                            <Thead>
                                <Tr>
                                    <Th>Action</Th>
                                    <Th>Points</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                <Tr>
                                    <Td>50 points per Skatehive NFT</Td>
                                    <Td></Td>
                                </Tr>
                            </Tbody>
                        </Table>
                    </div>
                );
            case 'Voted Witness':
                return (
                    <div>
                        <InfoBox>
                            Voting for witnesses helps secure the Hive blockchain.
                        </InfoBox>
                        <br />
                        <p>
                            {data.has_voted_in_witness ? 'You have voted for the Skatehive witness.' : 'You have not voted for the Skatehive witness.'}
                        </p>
                        <br />
                        <Table variant="simple" size="sm">
                            <Thead>
                                <Tr>
                                    <Th>Action</Th>
                                    <Th>Points</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                <Tr>
                                    <Td>1000 points for voting for the Skatehive witness</Td>
                                    <Td></Td>
                                </Tr>
                            </Tbody>
                        </Table>
                    </div>
                );
            case 'HBD Savings':
                return (
                    <div>
                        <InfoBox>
                            HBD Savings represent your savings in Hive Backed Dollars (HBD).
                        </InfoBox>
                        <br />
                        <p>
                            You have <span style={{ color: getColorByValue(data.hbd_savings_balance ?? 0, 1000, 500), fontWeight: 'bold', textShadow: `0 0 5px ${getColorByValue(data.hbd_savings_balance ?? 0, 1000, 500)}` }}>{data.hbd_savings_balance?.toString()}</span> HBD in savings.
                        </p>
                        <br />
                        <Table variant="simple" size="sm">
                            <Thead>
                                <Tr>
                                    <Th>Action</Th>
                                    <Th>Points</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                <Tr>
                                    <Td>0.2 points per HBD in savings</Td>
                                    <Td>Points capped at 1,000 HBD (maximum 200 points)</Td>
                                </Tr>
                            </Tbody>
                        </Table>
                    </div>
                );
            case 'Number of Posts':
                return (
                    <div>
                        <InfoBox>
                            Number of posts you have made on the Hive blockchain.
                        </InfoBox>
                        <br />
                        <p>
                            You have made <span style={{ color: getColorByValue(data.post_count ?? 0, 3000, 1500), fontWeight: 'bold', textShadow: `0 0 5px ${getColorByValue(data.post_count ?? 0, 3000, 1500)}` }}>{data.post_count}</span> posts.
                        </p>
                        <br />
                        <Table variant="simple" size="sm">
                            <Thead>
                                <Tr>
                                    <Th>Action</Th>
                                    <Th>Points</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                <Tr>
                                    <Td>0.1 points per post</Td>
                                    <Td>Points capped at 3,000 posts (maximum 300 points)</Td>
                                </Tr>
                            </Tbody>
                        </Table>
                    </div>
                );
            case 'Voting Power':
                return (
                    <div>
                        <InfoBox>
                            Your voting power in USD on the Hive blockchain.
                        </InfoBox>
                        <br />
                        <p>
                            Your voting power is worth <span style={{ color: getColorByValue(data.max_voting_power_usd ?? 0, 1000, 500), fontWeight: 'bold', textShadow: `0 0 5px ${getColorByValue(data.max_voting_power_usd ?? 0, 1000, 500)}` }}>{data.max_voting_power_usd}</span> USD.
                        </p>
                        <br />
                        <Table variant="simple" size="sm">
                            <Thead>
                                <Tr>
                                    <Th>Action</Th>
                                    <Th>Points</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                <Tr>
                                    <Td>1000 points per USD of voting power</Td>
                                    <Td></Td>
                                </Tr>
                            </Tbody>
                        </Table>
                    </div>
                );
            case 'Last Post Activity':
                return (
                    <div>
                        <InfoBox>
                            Your last post activity on the Hive blockchain.
                        </InfoBox>
                        <br />
                        <p>
                            Your last post was on <span style={{ color: getColorByValue(new Date(data.last_post ?? '').getTime(), new Date().getTime() - 7 * 24 * 60 * 60 * 1000, new Date().getTime() - 30 * 24 * 60 * 60 * 1000), fontWeight: 'bold', textShadow: `0 0 5px ${getColorByValue(new Date(data.last_post ?? '').getTime(), new Date().getTime() - 7 * 24 * 60 * 60 * 1000, new Date().getTime() - 30 * 24 * 60 * 60 * 1000)}` }}>{formatDate(String(data.last_post))}</span>.
                        </p>
                        <br />
                        <Table variant="simple" size="sm">
                            <Thead>
                                <Tr>
                                    <Th>Action</Th>
                                    <Th>Points</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                <Tr>
                                    <Td>0 points deducted if the last post was within 7 days</Td>
                                    <Td>Up to 100 points deducted for inactivity</Td>
                                </Tr>
                            </Tbody>
                        </Table>
                    </div>
                );
            case 'Ethereum Wallet Bonus':
                return (
                    <div>
                        <InfoBox>
                            Bonus points for having a valid Ethereum wallet.
                        </InfoBox>
                        <br />
                        <p>
                            You have <span style={{ color: data.eth_address ? 'lightgreen' : 'lightcoral', fontWeight: 'bold', textShadow: `0 0 5px ${data.eth_address ? 'lightgreen' : 'lightcoral'}` }}>{data.eth_address ? 'a valid' : 'no'}</span> Ethereum wallet.
                        </p>
                        <br />
                        <Table variant="simple" size="sm">
                            <Thead>
                                <Tr>
                                    <Th>Action</Th>
                                    <Th>Points</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                <Tr>
                                    <Td>5000 points for having a valid Ethereum wallet</Td>
                                    <Td></Td>
                                </Tr>
                            </Tbody>
                        </Table>
                    </div>
                );
            default:
                return <p>{content}</p>;
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="xl">
            <ModalOverlay />
            <ModalContent
                bg="gray.900"
                borderRadius="md"
                border="2px solid"
                borderColor='green.500'
                boxShadow='0 0 10px green'
            >
                <ModalHeader>{title}</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    {renderContent()}
                </ModalBody>
                <ModalFooter>
                    <Button colorScheme="blue" mr={3} onClick={onClose}>
                        Close
                    </Button>
                    <Button colorScheme="teal" onClick={handleActionClick}>{actionText}</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default LeaderboardModal;
