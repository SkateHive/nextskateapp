import React from 'react';
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, Button } from '@chakra-ui/react';
import useHiveBalance from '@/hooks/useHiveBalance';
import { useHiveUser } from '@/contexts/UserContext';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    content: string;
    actionText: string;
    onAction: () => void;
}

const ModalComponent: React.FC<ModalProps> = ({ isOpen, onClose, title, content, actionText, onAction }) => {
    const hiveUser = useHiveUser();
    const hiveBalance = useHiveBalance(hiveUser.hiveUser);
    const {
        hiveUsdValue,
        hivePower,
        delegatedToUserInUSD,
        HPthatUserDelegated,
        totalHP,
        HPUsdValue,
        delegatedHPUsdValue,
        HBDUsdValue,
        savingsUSDvalue,
        totalValue
    } = hiveBalance || {};

    const renderContent = () => {
        if (title.includes('Hive') || title.includes('HP') || title.includes('HBD')) {
            return (
                <div>
                    <p>Hive Balance: {hiveUsdValue}</p>
                    <p>HP Balance: {hivePower}</p>
                    <p>Delegated HP: {delegatedToUserInUSD}</p>
                    <p>HBD Balance: {HBDUsdValue}</p>
                    <p>Savings: {savingsUSDvalue}</p>
                    <p>Total Value: {totalValue}</p>
                </div>
            );
        } else if (title.includes('Gnars')) {
            return (
                <div>
                    <p>{content}</p>
                    <p>Gnars are NFTs that represent membership in the Gnars DAO. Holding Gnars allows you to participate in governance and vote on proposals.</p>
                </div>
            );
        } else if (title.includes('Witness')) {
            return (
                <div>
                    <p>{content}</p>
                    <p>Witnesses are responsible for producing blocks and securing the Hive blockchain. Voting for witnesses helps ensure the network remains decentralized and secure.</p>
                </div>
            );
        } else {
            return <p>{content}</p>;
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
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
                    <Button colorScheme="teal" onClick={onAction}>{actionText}</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default ModalComponent;
