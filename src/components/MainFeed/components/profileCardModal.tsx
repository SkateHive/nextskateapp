import ProfileCard from "@/components/Profile/profileCard";
import { HiveAccount } from "@/lib/useHiveAuth";
import {
    Center,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
} from "@chakra-ui/react";

interface ProfileCardModalProps {
    isOpen: boolean;
    onClose: () => void;
    profile: HiveAccount;
}

const ProfileCardModal = ({ isOpen, onClose, profile }: ProfileCardModalProps) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} size="sm">
            <ModalContent bg={'transparent'}>
                <ModalCloseButton ml={5} />
                <ModalBody>
                    <Center>
                        <ProfileCard user={profile} />
                    </Center>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
};

export default ProfileCardModal;
