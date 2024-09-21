import {
    Button,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Text,
    Textarea,
} from "@chakra-ui/react";
import React from "react";
import voteOnProposal from "../utils/voteOnProposal";


interface VoteConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    choice: string;
    ethAccount: any;
    proposalId: string;

}


const VoteConfirmationModal: React.FC<VoteConfirmationModalProps> = ({
    isOpen, onClose, choice, ethAccount, proposalId
}) => {
    const [reason, setReason] = React.useState('');
    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent
                bg={"#201d21"}
                border={"1px solid #A5D6A7"}
                color={'white'}
            >
                <ModalHeader>Confirm Vote</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Text>
                        {`Are you sure you want to vote "${choice.toUpperCase()}" on this proposal? This action cannot be undone.`}
                    </Text>
                    <Textarea
                        value={reason}
                        onChange={(event) => setReason(event.target.value)}
                        placeholder="Reason for your vote"
                        height={"120px"}
                        mt={2}
                    />
                    <Text mt={2} fontSize="12px" color="gray.500">
                        Please note that voting is irreversible and binding. Make sure you have read and understood the proposal before voting.
                    </Text>
                </ModalBody>
                <ModalFooter>
                    <Button colorScheme="red" mr={3} onClick={onClose}>
                        Cancel
                    </Button>
                    <Button colorScheme="green" variant="outline" onClick={() => voteOnProposal(ethAccount, proposalId, Number(choice) + 1, reason)}>
                        Confirm
                    </Button>



                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default VoteConfirmationModal;